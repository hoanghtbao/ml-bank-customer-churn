"""
Strategy Router: 4-Quadrant segmentation and dynamic Tiered ROI simulation.
"""

from fastapi import APIRouter
import os
import sys
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from api.schemas import RoiSimulateRequest
from src.business.segmentation import assign_four_quadrants, get_quadrant_summary
from src.business.retention_advisor import calculate_tiered_roi
from src.modeling.predict import predict_batch
import joblib

router = APIRouter(prefix="/api/strategy", tags=["Prescriptive Strategy & ROI"])

DATA_PATH = os.path.join(PROJECT_ROOT, 'data', 'processed', 'full_engineered.csv')
MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'churn_early_warning_pipeline.joblib')

_cached_scored_df = None


def get_scored_df():
    global _cached_scored_df
    if _cached_scored_df is None:
        df = pd.read_csv(DATA_PATH)
        pipeline = joblib.load(MODEL_PATH)
        scored = predict_batch(pipeline, df, threshold=0.45, enforce_complain_rule=True)
        scored = assign_four_quadrants(scored, risk_threshold=0.45, high_value_threshold=80000.0)
        _cached_scored_df = scored
    return _cached_scored_df


@router.get("/quadrants")
def get_quadrant_data():
    """Returns 4 Quadrant summary table and sample scatter points for visualization."""
    df_quad = get_scored_df()
    q_sum = get_quadrant_summary(df_quad)

    # Sample 1000 points for smooth charting
    sample = df_quad.sample(n=min(1000, len(df_quad)), random_state=42)
    points = []
    for _, row in sample.iterrows():
        points.append({
            "CustomerId": int(row['CustomerId']),
            "Surname": str(row['Surname']),
            "Balance": float(row['Balance']),
            "Predicted_Probability": float(row['Predicted_Probability']),
            "Quadrant": str(row['Quadrant'])
        })

    return {
        "summary": q_sum.to_dict(orient="records"),
        "sample_points": points
    }


@router.post("/roi-simulate")
def simulate_roi(params: RoiSimulateRequest):
    """Calculates live Tiered Financial ROI metrics."""
    df_quad = get_scored_df()
    roi_res = calculate_tiered_roi(
        df_quad,
        vip_cost=params.vip_cost,
        std_cost=params.std_cost,
        vip_save_rate=params.vip_save_rate,
        std_save_rate=params.std_save_rate,
        margin_rate=params.margin_rate,
        base_service_fee=params.base_service_fee
    )
    return roi_res
