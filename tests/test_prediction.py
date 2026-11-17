"""
Unit tests for end-to-end prediction, model loading, and Streamlit application utilities.
"""

import os
import pytest
import pandas as pd
import numpy as np

from app.utils import (
    load_champion_pipeline,
    load_metadata,
    load_full_dataset,
    get_pre_scored_data
)
from src.modeling.predict import predict_customer, predict_batch
from src.business.segmentation import assign_four_quadrants


def test_load_champion_pipeline():
    pipe = load_champion_pipeline()
    assert pipe is not None
    assert 'preprocessor' in pipe.named_steps
    assert 'classifier' in pipe.named_steps


def test_load_metadata():
    meta = load_metadata()
    assert isinstance(meta, dict)
    assert 'model_name' in meta
    assert 'optimal_decision_threshold' in meta
    assert 'test_holdout_metrics' in meta


def test_load_full_dataset():
    df = load_full_dataset()
    assert len(df) == 10000
    assert 'CustomerId' in df.columns
    assert 'Balance' in df.columns
    assert 'Exited' in df.columns


def test_predict_single_customer_normal():
    pipe = load_champion_pipeline()
    sample_c = {
        'CustomerId': 15700001,
        'Surname': 'Müller',
        'Gender': 'Male',
        'Geography': 'Germany',
        'Age': 45,
        'Tenure': 5,
        'Balance': 120000.0,
        'NumOfProducts': 2,
        'HasCrCard': 1,
        'IsActiveMember': 1,
        'EstimatedSalary': 90000.0,
        'CreditScore': 680,
        'Card_Type': 'DIAMOND',
        'Satisfaction_Score': 3,
        'Point_Earned': 600,
        'Complain': 0
    }
    res = predict_customer(pipe, sample_c, threshold=0.45, enforce_complain_rule=True)
    assert 'churn_probability' in res
    assert 0.0 <= res['churn_probability'] <= 1.0
    assert res['rule_override_applied'] is False
    assert res['risk_tier'] in ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'CRITICAL_RISK']


def test_predict_single_customer_complaint_override():
    pipe = load_champion_pipeline()
    sample_c = {
        'CustomerId': 15700002,
        'Surname': 'Schneider',
        'Gender': 'Male',
        'Geography': 'France',
        'Age': 35,
        'Tenure': 3,
        'Balance': 50000.0,
        'NumOfProducts': 2,
        'HasCrCard': 1,
        'IsActiveMember': 1,
        'EstimatedSalary': 60000.0,
        'CreditScore': 700,
        'Card_Type': 'GOLD',
        'Satisfaction_Score': 1,
        'Point_Earned': 400,
        'Complain': 1
    }
    res = predict_customer(pipe, sample_c, threshold=0.45, enforce_complain_rule=True)
    assert res['rule_override_applied'] is True
    assert res['churn_probability'] >= 0.99
    assert res['churn_prediction'] == 1
    assert res['risk_tier'] == 'CRITICAL_URGENT'


def test_predict_batch_and_segmentation():
    pipe = load_champion_pipeline()
    df = load_full_dataset().head(50)
    scored = predict_batch(pipe, df, threshold=0.45, enforce_complain_rule=True)
    assert 'Predicted_Probability' in scored.columns
    assert 'Predicted_Churn' in scored.columns
    assert 'Risk_Tier' in scored.columns

    quad = assign_four_quadrants(scored, risk_threshold=0.45, high_value_threshold=80000.0)
    assert 'Quadrant' in quad.columns
    valid_quadrants = {'Q1_VIP_At_Risk', 'Q2_Standard_At_Risk', 'Q3_VIP_Loyal', 'Q4_Standard_Loyal'}
    assert set(quad['Quadrant'].unique()).issubset(valid_quadrants)
