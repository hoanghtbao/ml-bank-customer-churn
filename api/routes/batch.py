"""
Batch Scoring Router: Upload CSV, score portfolio, filter and export retention call list.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from datetime import datetime
import os
import sys
import pandas as pd
import io
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from api.schemas import BatchExportExcelRequest
from src.modeling.predict import predict_batch
from src.business.segmentation import assign_four_quadrants
from src.business.retention_advisor import recommend_next_best_action
from src.business.excel_exporter import build_portfolio_excel_bytes

router = APIRouter(prefix="/api/batch", tags=["Batch Campaign Scoring"])

DATA_PATH = os.path.join(PROJECT_ROOT, 'data', 'processed', 'full_engineered.csv')
MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'churn_early_warning_pipeline.joblib')

_PORTFOLIO_DF_CACHE = None


def _get_portfolio_df() -> pd.DataFrame:
    """Lazy-load and cache full_engineered.csv for sub-millisecond customer lookup."""
    global _PORTFOLIO_DF_CACHE
    if _PORTFOLIO_DF_CACHE is None:
        _PORTFOLIO_DF_CACHE = pd.read_csv(DATA_PATH)
    return _PORTFOLIO_DF_CACHE


def _row_to_customer_profile(row: pd.Series) -> dict:
    return {
        "CustomerId": int(row["CustomerId"]),
        "Surname": str(row["Surname"]),
        "Geography": str(row["Geography"]),
        "Gender": str(row["Gender"]),
        "Age": int(row["Age"]),
        "Tenure": int(row["Tenure"]),
        "Balance": float(row["Balance"]),
        "NumOfProducts": int(row["NumOfProducts"]),
        "HasCrCard": int(row["HasCrCard"]),
        "IsActiveMember": int(row["IsActiveMember"]),
        "EstimatedSalary": float(row["EstimatedSalary"]),
        "Satisfaction_Score": int(row.get("Satisfaction Score", row.get("Satisfaction_Score", 3))),
        "Card_Type": str(row.get("Card Type", row.get("Card_Type", "GOLD"))),
        "Point_Earned": int(row.get("Point Earned", row.get("Point_Earned", 500))),
        "CreditScore": int(row["CreditScore"]),
        "Complain": int(row.get("Complain", 0)),
    }


@router.get("/search")
def search_customers(q: str = "", limit: int = 8):
    """Fast prefix/substring search across all 10,000 customers by CustomerId or Surname."""
    query = (q or "").strip()
    if not query:
        return {"query": query, "count": 0, "results": []}

    df = _get_portfolio_df()
    q_lower = query.lower()
    mask = (
        df["CustomerId"].astype(str).str.contains(q_lower, regex=False, na=False)
        | df["Surname"].astype(str).str.lower().str.contains(q_lower, regex=False, na=False)
    )
    matched = df[mask].sort_values(by="Balance", ascending=False).head(max(1, min(limit, 25)))
    results = [_row_to_customer_profile(row) for _, row in matched.iterrows()]
    return {"query": query, "count": len(results), "results": results}


@router.get("/customer/{customer_id}")
def get_customer_by_id(customer_id: int):
    """Fetch a single customer's real feature profile by CustomerId."""
    df = _get_portfolio_df()
    matched = df[df["CustomerId"].astype(int) == customer_id]
    if matched.empty:
        raise HTTPException(status_code=404, detail=f"CustomerId {customer_id} not found.")
    return _row_to_customer_profile(matched.iloc[0])


@router.get("/portfolio-scored")
def get_portfolio_scored(limit: int = 200, risk_only: bool = False):
    """Returns scored customers from the 10,000 portfolio."""
    pipeline = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    scored = predict_batch(pipeline, df, threshold=0.45, enforce_complain_rule=True)
    scored = assign_four_quadrants(scored, risk_threshold=0.45, high_value_threshold=80000.0)

    if risk_only:
        scored = scored[scored['Predicted_Probability'] >= 0.45]

    scored = scored.sort_values(by='Predicted_Probability', ascending=False)
    sub = scored.head(limit)

    records = []
    for _, row in sub.iterrows():
        nba = recommend_next_best_action(row.to_dict())
        records.append({
            "CustomerId": int(row['CustomerId']),
            "Surname": str(row['Surname']),
            "Geography": str(row['Geography']),
            "Gender": str(row['Gender']),
            "Age": int(row['Age']),
            "Balance": float(row['Balance']),
            "NumOfProducts": int(row['NumOfProducts']),
            "IsActiveMember": int(row['IsActiveMember']),
            "Complain": int(row.get('Complain', 0)),
            "Predicted_Probability": round(float(row['Predicted_Probability']), 4),
            "Risk_Tier": str(row['Risk_Tier']),
            "Quadrant": str(row['Quadrant']),
            "Recommended_Strategy": nba['strategy_name'],
            "Channel": nba['channel'],
            "Estimated_Cost_EUR": nba['estimated_cost_eur']
        })

    return {
        "total_records": len(df),
        "total_high_risk": int((scored['Predicted_Probability'] >= 0.45).sum()),
        "total_balance_at_risk_m_eur": round(float(scored[scored['Predicted_Probability'] >= 0.45]['Balance'].sum()) / 1e6, 2),
        "returned_count": len(records),
        "records": records
    }


@router.post("/upload-csv")
async def score_uploaded_csv(file: UploadFile = File(...)):
    """Scores a custom uploaded CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    try:
        df_upload = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    pipeline = joblib.load(MODEL_PATH)
    scored = predict_batch(pipeline, df_upload, threshold=0.45, enforce_complain_rule=True)
    scored = assign_four_quadrants(scored, risk_threshold=0.45, high_value_threshold=80000.0)
    scored = scored.sort_values(by='Predicted_Probability', ascending=False)

    records = []
    for _, row in scored.head(200).iterrows():
        nba = recommend_next_best_action(row.to_dict())
        records.append({
            "CustomerId": int(row.get('CustomerId', 0)),
            "Surname": str(row.get('Surname', 'Unknown')),
            "Geography": str(row.get('Geography', 'France')),
            "Gender": str(row.get('Gender', 'Male')),
            "Age": int(row.get('Age', 35)),
            "Balance": float(row.get('Balance', 0.0)),
            "NumOfProducts": int(row.get('NumOfProducts', 1)),
            "IsActiveMember": int(row.get('IsActiveMember', 1)),
            "Complain": int(row.get('Complain', 0)),
            "Predicted_Probability": round(float(row['Predicted_Probability']), 4),
            "Risk_Tier": str(row['Risk_Tier']),
            "Quadrant": str(row['Quadrant']),
            "Recommended_Strategy": nba['strategy_name'],
            "Channel": nba['channel'],
            "Estimated_Cost_EUR": nba['estimated_cost_eur']
        })

    return {
        "filename": file.filename,
        "total_rows": len(df_upload),
        "total_high_risk": int((scored['Predicted_Probability'] >= 0.45).sum()),
        "records": records
    }


@router.post("/export-excel")
def export_scored_portfolio_excel(payload: BatchExportExcelRequest):
    """Exports scored customer rows into a professionally styled Microsoft Excel (.xlsx) workbook."""
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records provided to export.")

    xlsx_bytes = build_portfolio_excel_bytes(
        records=payload.records,
        sheet_label=payload.sheet_name,
        filter_summary=payload.filter_summary,
    )
    today = datetime.now().strftime("%Y-%m-%d")
    safe_sheet = "".join(c if c.isalnum() or c in ("_", "-") else "_" for c in payload.sheet_name)
    filename = f"BB_Bank_Scored_Portfolio_{safe_sheet}_{today}.xlsx"

    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
