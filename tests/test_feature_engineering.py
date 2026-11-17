"""
Unit tests for feature engineering and dataset splitting module.
"""

import os
import pytest
import pandas as pd
import numpy as np

from src.preprocessing.feature_engineering import (
    create_domain_features,
    split_dataset_3way,
    save_processed_splits
)


@pytest.fixture
def sample_cleaned_data():
    """Provides a sample cleaned dataset matching the technical schema."""
    data = {
        'RowNumber': range(1, 101),
        'CustomerId': [15600000 + i for i in range(1, 101)],
        'Surname': [f'Customer_{i}' for i in range(1, 101)],
        'CreditScore': [600 + (i % 200) for i in range(1, 101)],
        'Geography': ['France' if i % 2 == 0 else ('Germany' if i % 3 == 0 else 'Spain') for i in range(1, 101)],
        'Gender': ['Male' if i % 2 == 0 else 'Female' for i in range(1, 101)],
        'Age': [20 + (i % 55) for i in range(1, 101)],
        'Tenure': [i % 11 for i in range(1, 101)],  # Includes 0 to 10
        'Balance': [0.0 if i % 3 == 0 else float(50000 + i * 1000) for i in range(1, 101)],
        'NumOfProducts': [1 if i % 4 == 0 else (2 if i % 4 == 1 else (3 if i % 4 == 2 else 4)) for i in range(1, 101)],
        'HasCrCard': [i % 2 for i in range(1, 101)],
        'IsActiveMember': [(i + 1) % 2 for i in range(1, 101)],
        'EstimatedSalary': [0.0 if i == 1 else float(30000 + i * 1000) for i in range(1, 101)],  # Includes 0.0
        'Exited': [1 if i % 5 == 0 else 0 for i in range(1, 101)],  # Exactly 20% churn
        'Complain': [1 if i % 5 == 0 else 0 for i in range(1, 101)],
        'Satisfaction_Score': [(i % 5) + 1 for i in range(1, 101)],
        'Card_Type': ['DIAMOND' if i % 4 == 0 else 'GOLD' for i in range(1, 101)],
        'Point_Earned': [300 + (i * 5) for i in range(1, 101)],
    }
    return pd.DataFrame(data)


def test_feature_creation_columns_and_shapes(sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    assert len(df_feat) == len(sample_cleaned_data)
    
    expected_new_cols = [
        'IsZeroBalance',
        'Balance_To_Salary_Ratio',
        'Products_Per_Tenure',
        'Product_Holding_Risk_Tier',
        'Age_Lifecycle_Stage',
        'Engagement_Score'
    ]
    for col in expected_new_cols:
        assert col in df_feat.columns, f"Missing engineered column: {col}"
        # Ensure no NaNs or Infs
        assert not df_feat[col].isna().any(), f"Column {col} contains NaN"
        if df_feat[col].dtype in [np.float64, np.float32]:
            assert not np.isinf(df_feat[col]).any(), f"Column {col} contains Inf"


def test_zero_balance_logic(sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    zero_mask = df_feat['Balance'] == 0.0
    assert (df_feat.loc[zero_mask, 'IsZeroBalance'] == 1).all()
    assert (df_feat.loc[~zero_mask, 'IsZeroBalance'] == 0).all()


def test_safe_division_corner_cases(sample_cleaned_data):
    # Customer 1 has EstimatedSalary == 0.0, and several have Tenure == 0
    df_feat = create_domain_features(sample_cleaned_data)
    row_sal_zero = df_feat[df_feat['EstimatedSalary'] == 0.0]
    assert len(row_sal_zero) > 0
    assert not np.isinf(row_sal_zero['Balance_To_Salary_Ratio']).any()
    assert not row_sal_zero['Balance_To_Salary_Ratio'].isna().any()

    row_tenure_zero = df_feat[df_feat['Tenure'] == 0]
    assert len(row_tenure_zero) > 0
    assert not np.isinf(row_tenure_zero['Products_Per_Tenure']).any()
    assert not row_tenure_zero['Products_Per_Tenure'].isna().any()


def test_risk_tier_classification(sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    optimal_mask = df_feat['NumOfProducts'] == 2
    assert (df_feat.loc[optimal_mask, 'Product_Holding_Risk_Tier'] == 'Optimal').all()

    moderate_mask = df_feat['NumOfProducts'] == 1
    assert (df_feat.loc[moderate_mask, 'Product_Holding_Risk_Tier'] == 'Moderate_Risk').all()

    extreme_mask = df_feat['NumOfProducts'].isin([3, 4])
    assert (df_feat.loc[extreme_mask, 'Product_Holding_Risk_Tier'] == 'Extreme_Danger').all()


def test_engagement_score_bounds(sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    assert df_feat['Engagement_Score'].min() >= 0
    assert df_feat['Engagement_Score'].max() <= 4


def test_split_dataset_3way(sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    train_df, val_df, test_df = split_dataset_3way(
        df_feat,
        target_col='Exited',
        train_ratio=0.70,
        val_ratio=0.15,
        test_ratio=0.15,
        random_state=42
    )

    # Check sizes
    assert len(train_df) == 70
    assert len(val_df) == 15
    assert len(test_df) == 15

    # Check no customer overlap (zero leakage)
    train_ids = set(train_df['CustomerId'])
    val_ids = set(val_df['CustomerId'])
    test_ids = set(test_df['CustomerId'])

    assert len(train_ids.intersection(val_ids)) == 0
    assert len(train_ids.intersection(test_ids)) == 0
    assert len(val_ids.intersection(test_ids)) == 0

    # Check stratification: target mean should be 0.20 in all sets
    assert np.isclose(train_df['Exited'].mean(), 0.20, atol=0.02)
    assert np.isclose(val_df['Exited'].mean(), 0.20, atol=0.02)
    assert np.isclose(test_df['Exited'].mean(), 0.20, atol=0.02)


def test_save_processed_splits(tmp_path, sample_cleaned_data):
    df_feat = create_domain_features(sample_cleaned_data)
    train_df, val_df, test_df = split_dataset_3way(df_feat)
    
    out_dir = str(tmp_path / "processed")
    paths = save_processed_splits(train_df, val_df, test_df, output_dir=out_dir)

    for key, path in paths.items():
        assert os.path.exists(path)
        loaded = pd.read_csv(path)
        if key == 'train':
            assert len(loaded) == 70
        else:
            assert len(loaded) == 15
