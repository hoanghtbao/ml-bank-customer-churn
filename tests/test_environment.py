import os
import pytest
import pandas as pd

EXPECTED_RAW_PATH = os.path.join("data", "raw", "Customer-Churn-Records.csv")

EXPECTED_COLUMNS = [
    "RowNumber", "CustomerId", "Surname", "CreditScore", "Geography",
    "Gender", "Age", "Tenure", "Balance", "NumOfProducts", "HasCrCard",
    "IsActiveMember", "EstimatedSalary", "Exited", "Complain",
    "Satisfaction Score", "Card Type", "Point Earned"
]

def test_python_packages_importable():
    """Verify all required libraries are installed and importable."""
    import numpy as np
    import scipy
    import statsmodels
    import sklearn
    import imblearn
    import xgboost
    import matplotlib
    import seaborn
    import plotly
    import fastapi
    import uvicorn
    import pydantic
    import joblib
    import shap

    assert np.__version__ is not None
    assert sklearn.__version__ is not None
    assert xgboost.__version__ is not None
    assert shap.__version__ is not None
    assert fastapi.__version__ is not None

def test_raw_data_file_exists():
    """Verify raw data is stored in data/raw/ and is non-empty."""
    assert os.path.exists(EXPECTED_RAW_PATH), f"Missing raw dataset at {EXPECTED_RAW_PATH}"
    file_size = os.path.getsize(EXPECTED_RAW_PATH)
    assert file_size > 800000, f"Raw data file size seems smaller than expected: {file_size} bytes"

def test_raw_data_schema_and_integrity():
    """Verify raw dataset has exact 10,000 rows, 18 columns, and valid keys."""
    df = pd.read_csv(EXPECTED_RAW_PATH)
    assert df.shape == (10000, 18), f"Expected shape (10000, 18), got {df.shape}"
    assert list(df.columns) == EXPECTED_COLUMNS, "Columns do not match expected 18 columns"
    assert df["CustomerId"].nunique() == 10000, "CustomerId has duplicates"
    assert df["Exited"].value_counts().to_dict() == {0: 7962, 1: 2038}, "Exited counts do not match benchmark"
