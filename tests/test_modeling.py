"""
Unit tests for Modeling, Evaluation, Threshold Tuning, Prediction, and Explainability.
"""

import pytest
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

from src.preprocessing.feature_engineering import create_domain_features, split_dataset_3way
from src.modeling.train import (
    build_preprocessor,
    evaluate_models_and_scalers,
    run_ablation_study,
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES
)
from src.modeling.evaluate import (
    tune_decision_threshold,
    evaluate_test_set
)
from src.modeling.predict import (
    predict_customer,
    predict_batch
)


@pytest.fixture
def sample_dataset():
    """Generates a synthetic dataset with realistic bank churn properties."""
    rng = np.random.default_rng(42)
    n = 200
    data = {
        'RowNumber': range(1, n + 1),
        'CustomerId': [15600000 + i for i in range(1, n + 1)],
        'Surname': [f'Customer_{i}' for i in range(1, n + 1)],
        'CreditScore': rng.integers(500, 850, size=n),
        'Geography': rng.choice(['France', 'Germany', 'Spain'], size=n),
        'Gender': rng.choice(['Male', 'Female'], size=n),
        'Age': rng.integers(20, 70, size=n),
        'Tenure': rng.integers(0, 11, size=n),
        'Balance': [0.0 if i % 3 == 0 else float(rng.uniform(20000, 150000)) for i in range(n)],
        'NumOfProducts': rng.choice([1, 2, 3, 4], p=[0.5, 0.45, 0.04, 0.01], size=n),
        'HasCrCard': rng.choice([0, 1], size=n),
        'IsActiveMember': rng.choice([0, 1], size=n),
        'EstimatedSalary': rng.uniform(20000, 150000, size=n),
        'Exited': rng.choice([0, 1], p=[0.8, 0.2], size=n),
        'Complain': [0] * n,
        'Satisfaction_Score': rng.integers(1, 6, size=n),
        'Card_Type': rng.choice(['DIAMOND', 'GOLD', 'PLATINUM', 'SILVER'], size=n),
        'Point_Earned': rng.integers(200, 1000, size=n),
    }
    df = pd.DataFrame(data)
    # Set complain = exited for 99% concordance
    for i in range(n):
        df.loc[i, 'Complain'] = df.loc[i, 'Exited'] if rng.random() > 0.01 else (1 - df.loc[i, 'Exited'])
    
    return create_domain_features(df)


def test_build_preprocessor(sample_dataset):
    pre = build_preprocessor('StandardScaler', NUMERIC_FEATURES, CATEGORICAL_FEATURES)
    cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    X_trans = pre.fit_transform(sample_dataset[cols])
    assert X_trans.shape[0] == len(sample_dataset)
    assert X_trans.shape[1] > len(cols)  # One-hot encoding expands columns


def test_pipeline_training_and_threshold_tuning(sample_dataset):
    train_df, val_df, test_df = split_dataset_3way(sample_dataset, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15)
    cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES

    pre = build_preprocessor('StandardScaler', NUMERIC_FEATURES, CATEGORICAL_FEATURES)
    clf = XGBClassifier(n_estimators=30, max_depth=3, eval_metric='logloss', random_state=42)
    pipe = Pipeline([('preprocessor', pre), ('classifier', clf)])
    pipe.fit(train_df[cols], train_df['Exited'])

    summary, curve = tune_decision_threshold(pipe, val_df, cols)
    assert 'optimal_f1_threshold' in summary
    assert 0.05 <= summary['optimal_f1_threshold'] <= 0.95
    assert len(curve) > 0


def test_evaluate_test_set(sample_dataset):
    train_df, val_df, test_df = split_dataset_3way(sample_dataset, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15)
    cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES

    pre = build_preprocessor('StandardScaler', NUMERIC_FEATURES, CATEGORICAL_FEATURES)
    clf = XGBClassifier(n_estimators=30, max_depth=3, eval_metric='logloss', random_state=42)
    pipe = Pipeline([('preprocessor', pre), ('classifier', clf)])
    pipe.fit(train_df[cols], train_df['Exited'])

    eval_result = evaluate_test_set(pipe, test_df, cols, threshold=0.3, n_bootstrap=50)
    assert 'accuracy' in eval_result
    assert 'roc_auc_95_ci' in eval_result
    assert eval_result['roc_auc_95_ci'][0] <= eval_result['roc_auc_95_ci'][1]
    assert len(eval_result['decile_lift_table']) == 10


def test_predict_customer_hard_rule_override(sample_dataset):
    cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    pre = build_preprocessor('StandardScaler', NUMERIC_FEATURES, CATEGORICAL_FEATURES)
    clf = LogisticRegression()
    pipe = Pipeline([('preprocessor', pre), ('classifier', clf)])
    pipe.fit(sample_dataset[cols], sample_dataset['Exited'])

    # Test customer WITH complaint
    cust_complain = sample_dataset.iloc[0].to_dict()
    cust_complain['Complain'] = 1

    result_override = predict_customer(pipe, cust_complain, enforce_complain_rule=True)
    assert result_override['rule_override_applied'] is True
    assert result_override['churn_prediction'] == 1
    assert result_override['churn_probability'] > 0.99
    assert result_override['risk_tier'] == 'CRITICAL_URGENT'

    # Test customer WITHOUT complaint
    cust_no_complain = sample_dataset.iloc[0].to_dict()
    cust_no_complain['Complain'] = 0
    result_normal = predict_customer(pipe, cust_no_complain, enforce_complain_rule=True)
    assert result_normal['rule_override_applied'] is False
    assert 0.0 <= result_normal['churn_probability'] <= 1.0


def test_predict_batch(sample_dataset):
    cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    pre = build_preprocessor('StandardScaler', NUMERIC_FEATURES, CATEGORICAL_FEATURES)
    clf = LogisticRegression()
    pipe = Pipeline([('preprocessor', pre), ('classifier', clf)])
    pipe.fit(sample_dataset[cols], sample_dataset['Exited'])

    scored_batch = predict_batch(pipe, sample_dataset.head(20), threshold=0.3, enforce_complain_rule=True)
    assert 'Predicted_Probability' in scored_batch.columns
    assert 'Predicted_Churn' in scored_batch.columns
    assert 'Risk_Tier' in scored_batch.columns
    assert 'Rule_Override_Applied' in scored_batch.columns
