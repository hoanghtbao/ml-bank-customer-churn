"""
Module: src.data.load_data
Description: Data loading, schema validation, and column categorization
for EuroVanguard Bank Customer Churn DSS (Customer-Churn-Records.csv).
"""

import os
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

# Default relative paths
RAW_DATA_PATH = os.path.join("data", "raw", "Customer-Churn-Records.csv")

# Exact schema specification for Customer-Churn-Records.csv
RAW_COLUMNS_18: List[str] = [
    "RowNumber", "CustomerId", "Surname", "CreditScore", "Geography",
    "Gender", "Age", "Tenure", "Balance", "NumOfProducts", "HasCrCard",
    "IsActiveMember", "EstimatedSalary", "Exited", "Complain",
    "Satisfaction Score", "Card Type", "Point Earned"
]

# Standardized column name mapping (removing whitespace for safe code access)
COLUMN_RENAME_MAP: Dict[str, str] = {
    "Satisfaction Score": "Satisfaction_Score",
    "Card Type": "Card_Type",
    "Point Earned": "Point_Earned"
}

# Categorization of columns by banking domain role
COLUMN_GROUPS = {
    "identifiers": ["RowNumber", "CustomerId", "Surname"],
    "demographics": ["Geography", "Gender", "Age"],
    "credit_relationship": ["CreditScore", "Tenure"],
    "financial_wealth": ["Balance", "EstimatedSalary"],
    "product_engagement": ["NumOfProducts", "HasCrCard", "IsActiveMember", "Card_Type", "Point_Earned"],
    "experience_target": ["Satisfaction_Score", "Complain", "Exited"]
}


def load_raw_dataset(file_path: str = RAW_DATA_PATH, standardize_names: bool = False) -> pd.DataFrame:
    """
    Loads the raw Customer-Churn-Records dataset and optionally standardizes column names.

    Parameters:
    -----------
    file_path : str
        Path to the CSV file.
    standardize_names : bool, default=False
        If True, renames columns with spaces ('Satisfaction Score' -> 'Satisfaction_Score', etc.)

    Returns:
    --------
    pd.DataFrame: Loaded dataset.

    Raises:
    -------
    FileNotFoundError: If the file does not exist at file_path.
    ValueError: If column names or row count do not match the expected dataset schema.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    df = pd.read_csv(file_path)

    # Validate column list
    missing_cols = set(RAW_COLUMNS_18) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Dataset is missing expected columns: {missing_cols}")

    if standardize_names:
        df = df.rename(columns=COLUMN_RENAME_MAP)

    return df


def audit_raw_data_integrity(df: pd.DataFrame) -> Dict[str, any]:
    """
    Performs a non-destructive preliminary audit of dataset integrity,
    returning key statistics and anomaly flags.
    """
    # Check for standardized vs raw column names
    col_surname = "Surname"
    col_has_crcard = "HasCrCard"
    col_balance = "Balance"
    col_complain = "Complain"
    col_exited = "Exited"
    col_card_type = "Card_Type" if "Card_Type" in df.columns else "Card Type"

    # Identify special characters in surname (e.g. '?')
    surname_corrupted_count = int(df[col_surname].str.contains(r"\?", na=False).sum())

    # Check HasCrCard == 0 but has Card Type
    mismatched_card_count = int(((df[col_has_crcard] == 0) & (df[col_card_type].notnull())).sum())

    # Zero-balance count
    zero_balance_count = int((df[col_balance] == 0).sum())

    # Concordance between Complain and Exited
    complain_exit_match_count = int((df[col_complain] == df[col_exited]).sum())

    total_rows = len(df)
    total_balance = float(df[col_balance].sum())
    churned_balance = float(df[df[col_exited] == 1][col_balance].sum())

    return {
        "total_rows": total_rows,
        "total_cols": df.shape[1],
        "null_count_total": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "unique_customer_ids": int(df["CustomerId"].nunique()),
        "headcount_churn_count": int((df[col_exited] == 1).sum()),
        "headcount_churn_rate_pct": round(float((df[col_exited] == 1).mean() * 100), 2),
        "total_deposit_volume_eur": total_balance,
        "churned_deposit_volume_eur": churned_balance,
        "deposit_churn_rate_pct": round(float((churned_balance / total_balance) * 100), 2),
        "surname_encoding_issue_count": surname_corrupted_count,
        "has_crcard_zero_but_card_type_count": mismatched_card_count,
        "zero_balance_count": zero_balance_count,
        "complain_exited_concordance_count": complain_exit_match_count,
        "complain_exited_concordance_pct": round((complain_exit_match_count / total_rows) * 100, 2),
    }


if __name__ == "__main__":
    df_raw = load_raw_dataset(standardize_names=True)
    audit = audit_raw_data_integrity(df_raw)
    print("=== DATA AUDIT SUMMARY ===")
    for k, v in audit.items():
        print(f"  {k}: {v}")
