"""
Unit tests for Business Strategy, 4 Quadrants Segmentation, Next-Best-Action,
Call Script Generation, and Tiered ROI Calculator.
"""

import pytest
import pandas as pd
import numpy as np

from src.business.segmentation import assign_four_quadrants, get_quadrant_summary
from src.business.retention_advisor import (
    recommend_next_best_action,
    generate_call_script,
    calculate_tiered_roi
)


@pytest.fixture
def sample_scored_data():
    """Generates synthetic scored customer records covering all 4 quadrants."""
    data = {
        'CustomerId': [1, 2, 3, 4],
        'Surname': ['Dupont', 'Schmidt', 'Garcia', 'Muller'],
        'Gender': ['Male', 'Female', 'Male', 'Female'],
        'Geography': ['France', 'Germany', 'Spain', 'Germany'],
        'Tenure': [5, 2, 8, 3],
        'Balance': [100000.0, 20000.0, 120000.0, 15000.0],
        'NumOfProducts': [1, 3, 2, 1],
        'IsActiveMember': [1, 0, 1, 1],
        'Complain': [0, 1, 0, 0],
        'Predicted_Probability': [0.85, 0.90, 0.15, 0.10],
        'Exited': [1, 1, 0, 0]
    }
    return pd.DataFrame(data)


def test_assign_four_quadrants(sample_scored_data):
    df_quad = assign_four_quadrants(
        sample_scored_data,
        prob_col='Predicted_Probability',
        balance_col='Balance',
        risk_threshold=0.45,
        high_value_threshold=80000.0
    )

    assert 'Quadrant' in df_quad.columns
    # Row 0: Balance 100k (>=80k), Prob 0.85 (>=0.45) -> Q1
    assert df_quad.loc[0, 'Quadrant'] == 'Q1_VIP_At_Risk'
    # Row 1: Balance 20k (<80k), Prob 0.90 (>=0.45) -> Q2
    assert df_quad.loc[1, 'Quadrant'] == 'Q2_Standard_At_Risk'
    # Row 2: Balance 120k (>=80k), Prob 0.15 (<0.45) -> Q3
    assert df_quad.loc[2, 'Quadrant'] == 'Q3_VIP_Loyal'
    # Row 3: Balance 15k (<80k), Prob 0.10 (<0.45) -> Q4
    assert df_quad.loc[3, 'Quadrant'] == 'Q4_Standard_Loyal'


def test_get_quadrant_summary(sample_scored_data):
    df_quad = assign_four_quadrants(sample_scored_data)
    summary = get_quadrant_summary(df_quad)
    assert len(summary) == 4
    assert 'Customer_Count' in summary.columns
    assert 'Total_Balance_M_EUR' in summary.columns
    assert summary['Customer_Count'].sum() == len(sample_scored_data)


def test_recommend_next_best_action_rules():
    # 1. Complain rule
    cust_comp = {'Surname': 'Smith', 'Complain': 1, 'NumOfProducts': 1, 'Geography': 'France', 'Balance': 50000, 'IsActiveMember': 1}
    nba1 = recommend_next_best_action(cust_comp)
    assert nba1['strategy_code'] == 'S1_COMPLAINT_ESCALATION'

    # 2. Over-bundling rule
    cust_prod = {'Surname': 'Smith', 'Complain': 0, 'NumOfProducts': 4, 'Geography': 'France', 'Balance': 50000, 'IsActiveMember': 1}
    nba2 = recommend_next_best_action(cust_prod)
    assert nba2['strategy_code'] == 'S2_PRODUCT_RATIONALIZATION'

    # 3. German high balance rule
    cust_de = {'Surname': 'Schmidt', 'Complain': 0, 'NumOfProducts': 2, 'Geography': 'Germany', 'Balance': 120000, 'IsActiveMember': 1}
    nba3 = recommend_next_best_action(cust_de)
    assert nba3['strategy_code'] == 'S3_GERMAN_WEALTH_LOCK'

    # 4. Inactive rule
    cust_inact = {'Surname': 'Smith', 'Complain': 0, 'NumOfProducts': 2, 'Geography': 'France', 'Balance': 50000, 'IsActiveMember': 0}
    nba4 = recommend_next_best_action(cust_inact)
    assert nba4['strategy_code'] == 'S4_DIGITAL_REENGAGEMENT'


def test_generate_call_script():
    cust = {
        'Surname': 'Bao',
        'Gender': 'Male',
        'Geography': 'Germany',
        'Tenure': 4,
        'Balance': 105000.0,
        'NumOfProducts': 2,
        'IsActiveMember': 1,
        'Complain': 0
    }
    script = generate_call_script(cust, rm_name="Le Van B")
    assert "Bao" in script
    assert "Le Van B" in script
    assert "Germany" in script
    assert "EuroVanguard" in script
    # Ensure internal AI risk score is never leaked to the customer
    assert "Machine Learning" not in script
    assert "AI Churn Score" not in script


def test_calculate_tiered_roi(sample_scored_data):
    df_quad = assign_four_quadrants(sample_scored_data)
    roi_dict = calculate_tiered_roi(df_quad)

    assert 'Q1_VIP' in roi_dict
    assert 'Q2_Standard' in roi_dict
    assert 'Total_Campaign' in roi_dict
    assert roi_dict['Total_Campaign']['total_targeted_count'] == 2  # Rows 0 and 1
    assert roi_dict['Total_Campaign']['total_intervention_cost_eur'] > 0
