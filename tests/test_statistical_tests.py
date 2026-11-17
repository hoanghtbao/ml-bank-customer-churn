"""
Tests for src.eda.statistical_tests module.
"""

import os
import pytest
import pandas as pd
import numpy as np
from src.data.clean_data import clean_technical_data
from src.data.load_data import load_raw_dataset, RAW_DATA_PATH
from src.eda.statistical_tests import (
    calculate_categorical_association,
    calculate_continuous_difference,
    calculate_woe_iv,
    calculate_vif_dataframe
)


@pytest.fixture(scope="module")
def cleaned_df():
    raw_df = load_raw_dataset(RAW_DATA_PATH)
    return clean_technical_data(raw_df)


def test_calculate_categorical_association(cleaned_df):
    """Test Chi-Square and Cramer's V for Geography."""
    res = calculate_categorical_association(cleaned_df, "Geography", "Exited")
    assert res["test"] == "Chi-Square"
    assert res["p_value"] < 0.05
    assert 0.0 <= res["effect_size"] <= 1.0
    assert res["dof"] == 2


def test_calculate_continuous_difference(cleaned_df):
    """Test Welch's t-test and Mann-Whitney U for Age."""
    res = calculate_continuous_difference(cleaned_df, "Age", "Exited")
    assert res["mean_1"] > res["mean_0"]  # Churned customers are older
    assert res["welch_p_value"] < 0.001
    assert res["mann_whitney_p_value"] < 0.001
    assert res["cohens_d"] > 0.5  # Moderate to large effect size


def test_calculate_woe_iv_ranking(cleaned_df):
    """Verify that Age has high IV and EstimatedSalary has very low IV (< 0.02)."""
    _, iv_age = calculate_woe_iv(cleaned_df, "Age", "Exited", bins=5)
    _, iv_salary = calculate_woe_iv(cleaned_df, "EstimatedSalary", "Exited", bins=5)

    assert iv_age > 0.30, f"Expected Age IV > 0.30, got {iv_age}"
    assert iv_salary < 0.05, f"Expected EstimatedSalary IV < 0.05, got {iv_salary}"


def test_calculate_vif_dataframe(cleaned_df):
    """Verify VIF dataframe calculation and ensure numeric features have VIF < 5 (no severe multicollinearity)."""
    num_cols = ["CreditScore", "Age", "Tenure", "Balance", "NumOfProducts", "EstimatedSalary", "Point_Earned"]
    vif_df = calculate_vif_dataframe(cleaned_df, num_cols)
    assert len(vif_df) == len(num_cols)
    assert (vif_df["VIF"] < 5.0).all(), "Detected multicollinearity with VIF >= 5.0"
