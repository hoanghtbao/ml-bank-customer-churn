"""
Module: src.data.clean_data
Description: Technical data cleansing, schema standardization,
character encoding sanitization, and domain range validation.
"""

import os
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

from src.data.load_data import (
    load_raw_dataset,
    RAW_DATA_PATH,
    COLUMN_RENAME_MAP
)

INTERIM_DATA_PATH = os.path.join("data", "interim", "churn_technical_cleaned.csv")

# Expected domain valid sets and boundaries
VALID_GEOGRAPHIES = {"France", "Germany", "Spain"}
VALID_GENDERS = {"Male", "Female"}
VALID_CARD_TYPES = {"DIAMOND", "GOLD", "SILVER", "PLATINUM"}


def clean_technical_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies technical cleaning to raw dataset:
    1. Makes an isolated deep copy to preserve original integrity.
    2. Renames columns with whitespace to standard snake/camel style with underscores.
    3. Detects and sanitizes encoding corruption (question marks '?') in 'Surname'.
    4. Ensures proper data types (int64 for discrete/flags, float64 for monetary, category/str for objects).

    Parameters:
    -----------
    df : pd.DataFrame
        Raw dataset.

    Returns:
    --------
    pd.DataFrame: Cleaned technical dataset.
    """
    cleaned_df = df.copy()

    # 1. Standardize column names
    cleaned_df = cleaned_df.rename(columns=COLUMN_RENAME_MAP)

    # 2. Character encoding sanitization for Surname
    # Flag original encoding issues for traceability
    cleaned_df["Surname_Encoding_Issue"] = cleaned_df["Surname"].str.contains(r"\?", na=False).astype(int)
    # Sanitize '?' so UI displays cleanly (e.g., 'H?' -> 'H', 'Y?an' -> 'Yan')
    cleaned_df["Surname"] = cleaned_df["Surname"].str.replace(r"\?", "", regex=True).str.strip()
    # If any surname became empty after stripping (none do, but for safety):
    cleaned_df["Surname"] = cleaned_df["Surname"].replace("", "Unknown")

    # 3. Ensure explicit strict datatypes
    int_cols = [
        "RowNumber", "CustomerId", "CreditScore", "Age", "Tenure",
        "NumOfProducts", "HasCrCard", "IsActiveMember", "Exited",
        "Complain", "Satisfaction_Score", "Point_Earned", "Surname_Encoding_Issue"
    ]
    float_cols = ["Balance", "EstimatedSalary"]
    str_cols = ["Surname", "Geography", "Gender", "Card_Type"]

    for col in int_cols:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].astype(np.int64)

    for col in float_cols:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].astype(np.float64)

    for col in str_cols:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].astype(str).str.strip()

    return cleaned_df


def validate_domain_ranges(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validates domain business rules and bounds on the cleaned technical dataset.

    Returns:
    --------
    (is_valid: bool, violations: List[str])
    """
    violations = []

    # Check CreditScore [300, 850]
    invalid_cs = df[(df["CreditScore"] < 300) | (df["CreditScore"] > 850)]
    if not invalid_cs.empty:
        violations.append(f"CreditScore out of bounds [300, 850]: {len(invalid_cs)} rows")

    # Check Geography in valid set
    invalid_geo = df[~df["Geography"].isin(VALID_GEOGRAPHIES)]
    if not invalid_geo.empty:
        violations.append(f"Invalid Geography values found: {invalid_geo['Geography'].unique()}")

    # Check Gender in valid set
    invalid_gender = df[~df["Gender"].isin(VALID_GENDERS)]
    if not invalid_gender.empty:
        violations.append(f"Invalid Gender values found: {invalid_gender['Gender'].unique()}")

    # Check Age [18, 100]
    invalid_age = df[(df["Age"] < 18) | (df["Age"] > 100)]
    if not invalid_age.empty:
        violations.append(f"Age out of bounds [18, 100]: {len(invalid_age)} rows")

    # Check Tenure [0, 10]
    invalid_tenure = df[(df["Tenure"] < 0) | (df["Tenure"] > 10)]
    if not invalid_tenure.empty:
        violations.append(f"Tenure out of bounds [0, 10]: {len(invalid_tenure)} rows")

    # Check Balance >= 0
    invalid_bal = df[df["Balance"] < 0]
    if not invalid_bal.empty:
        violations.append(f"Negative Balance found: {len(invalid_bal)} rows")

    # Check NumOfProducts [1, 4]
    invalid_prod = df[(df["NumOfProducts"] < 1) | (df["NumOfProducts"] > 4)]
    if not invalid_prod.empty:
        violations.append(f"NumOfProducts out of bounds [1, 4]: {len(invalid_prod)} rows")

    # Check binary columns {0, 1}
    for b_col in ["HasCrCard", "IsActiveMember", "Exited", "Complain"]:
        invalid_binary = df[~df[b_col].isin({0, 1})]
        if not invalid_binary.empty:
            violations.append(f"Invalid binary values in {b_col}: {invalid_binary[b_col].unique()}")

    # Check Satisfaction_Score [1, 5]
    invalid_sat = df[(df["Satisfaction_Score"] < 1) | (df["Satisfaction_Score"] > 5)]
    if not invalid_sat.empty:
        violations.append(f"Satisfaction_Score out of bounds [1, 5]: {len(invalid_sat)} rows")

    # Check Card_Type in valid set
    invalid_card = df[~df["Card_Type"].isin(VALID_CARD_TYPES)]
    if not invalid_card.empty:
        violations.append(f"Invalid Card_Type found: {invalid_card['Card_Type'].unique()}")

    # Check Point_Earned [0, 1000]
    invalid_pts = df[(df["Point_Earned"] < 0) | (df["Point_Earned"] > 1000)]
    if not invalid_pts.empty:
        violations.append(f"Point_Earned out of bounds [0, 1000]: {len(invalid_pts)} rows")

    # Check EstimatedSalary > 0
    invalid_sal = df[df["EstimatedSalary"] <= 0]
    if not invalid_sal.empty:
        violations.append(f"EstimatedSalary <= 0 found: {len(invalid_sal)} rows")

    return (len(violations) == 0, violations)


def save_interim_dataset(df: pd.DataFrame, output_path: str = INTERIM_DATA_PATH) -> str:
    """
    Saves cleaned technical dataframe to interim storage.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8")
    return output_path


if __name__ == "__main__":
    print("Executing technical data cleansing...")
    raw_df = load_raw_dataset(RAW_DATA_PATH)
    clean_df = clean_technical_data(raw_df)
    is_valid, issues = validate_domain_ranges(clean_df)
    print(f"Domain validation passed: {is_valid}")
    if not is_valid:
        print(f"Issues: {issues}")
    out_file = save_interim_dataset(clean_df)
    print(f"Saved cleaned interim dataset to: {out_file} ({clean_df.shape[0]} rows x {clean_df.shape[1]} cols)")
