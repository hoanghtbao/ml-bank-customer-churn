"""
Tests for src.data.load_data module.
"""

import os
import pytest
import pandas as pd
from src.data.load_data import (
    load_raw_dataset,
    audit_raw_data_integrity,
    RAW_COLUMNS_18,
    COLUMN_RENAME_MAP
)

RAW_PATH = os.path.join("data", "raw", "Customer-Churn-Records.csv")


def test_load_raw_dataset_default():
    """Test standard raw dataset loading without column renaming."""
    df = load_raw_dataset(RAW_PATH, standardize_names=False)
    assert isinstance(df, pd.DataFrame)
    assert df.shape == (10000, 18)
    assert list(df.columns) == RAW_COLUMNS_18


def test_load_raw_dataset_standardized():
    """Test loading with column renaming (whitespace to underscore)."""
    df = load_raw_dataset(RAW_PATH, standardize_names=True)
    assert "Satisfaction_Score" in df.columns
    assert "Card_Type" in df.columns
    assert "Point_Earned" in df.columns
    assert "Satisfaction Score" not in df.columns


def test_load_raw_dataset_file_not_found():
    """Test that FileNotFoundError is raised if path does not exist."""
    with pytest.raises(FileNotFoundError):
        load_raw_dataset("non_existent_directory/wrong_file.csv")


def test_audit_raw_data_integrity():
    """Verify integrity audit returns correct benchmark numbers."""
    df = load_raw_dataset(RAW_PATH, standardize_names=True)
    audit = audit_raw_data_integrity(df)

    assert audit["total_rows"] == 10000
    assert audit["null_count_total"] == 0
    assert audit["duplicate_rows"] == 0
    assert audit["unique_customer_ids"] == 10000
    assert audit["headcount_churn_count"] == 2038
    assert audit["headcount_churn_rate_pct"] == 20.38
    assert audit["deposit_churn_rate_pct"] == 24.28
    assert audit["surname_encoding_issue_count"] == 92
    assert audit["has_crcard_zero_but_card_type_count"] == 2945
    assert audit["zero_balance_count"] == 3617
    assert audit["complain_exited_concordance_count"] == 9986
    assert audit["complain_exited_concordance_pct"] == 99.86
