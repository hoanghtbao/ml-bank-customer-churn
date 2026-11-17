"""
Tests for src.data.clean_data module.
"""

import os
import pytest
import pandas as pd
from src.data.load_data import load_raw_dataset, RAW_DATA_PATH
from src.data.clean_data import (
    clean_technical_data,
    validate_domain_ranges,
    save_interim_dataset,
    INTERIM_DATA_PATH
)


@pytest.fixture
def raw_df():
    return load_raw_dataset(RAW_DATA_PATH)


@pytest.fixture
def cleaned_df(raw_df):
    return clean_technical_data(raw_df)


def test_clean_technical_data_shape_and_columns(cleaned_df):
    """Cleaned dataset preserves 10,000 rows and adds tracing flag."""
    assert cleaned_df.shape[0] == 10000
    # Expected 18 original columns renamed + 1 flag column (Surname_Encoding_Issue) = 19 columns
    assert cleaned_df.shape[1] == 19
    assert "Satisfaction_Score" in cleaned_df.columns
    assert "Card_Type" in cleaned_df.columns
    assert "Point_Earned" in cleaned_df.columns
    assert "Surname_Encoding_Issue" in cleaned_df.columns
    assert "Satisfaction Score" not in cleaned_df.columns


def test_surname_encoding_sanitization(cleaned_df):
    """Verify no '?' characters remain in Surname column and 92 flags are set."""
    assert cleaned_df["Surname"].str.contains(r"\?").sum() == 0, "Surname still contains '?'"
    assert cleaned_df["Surname_Encoding_Issue"].sum() == 92, "Expected 92 encoding issue flags"


def test_validate_domain_ranges_passes(cleaned_df):
    """Domain validation must pass with zero violations on cleaned dataset."""
    is_valid, violations = validate_domain_ranges(cleaned_df)
    assert is_valid is True, f"Validation failed with: {violations}"
    assert len(violations) == 0


def test_validate_domain_ranges_catches_violations(cleaned_df):
    """Verify that domain validator properly flags out-of-bound errors."""
    corrupted_df = cleaned_df.copy()
    corrupted_df.loc[0, "CreditScore"] = 250  # < 300
    corrupted_df.loc[1, "Age"] = 120          # > 100
    corrupted_df.loc[2, "Balance"] = -50.0    # < 0

    is_valid, violations = validate_domain_ranges(corrupted_df)
    assert is_valid is False
    assert len(violations) == 3


def test_save_interim_dataset(cleaned_df):
    """Verify interim dataset file is saved and readable."""
    out_path = save_interim_dataset(cleaned_df)
    assert os.path.exists(out_path)
    loaded_interim = pd.read_csv(out_path)
    assert loaded_interim.shape == (10000, 19)
