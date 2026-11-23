"""
Customer Value-Risk Segmentation Module (4 Quadrants Matrix).
Roleplay: BB Bank.
Standard: Gartner Prescriptive Analytics — Value vs Risk Prioritization.
"""

from typing import Dict, Any
import pandas as pd
import numpy as np


def assign_four_quadrants(
    df: pd.DataFrame,
    prob_col: str = 'Predicted_Probability',
    balance_col: str = 'Balance',
    risk_threshold: float = 0.45,
    high_value_threshold: float = 80000.0
) -> pd.DataFrame:
    """
    Classifies customers into the 4 Quadrants Matrix:
    - Q1_VIP_At_Risk: High Value (Balance >= 80,000 EUR) & High Risk (Prob >= T*)
    - Q2_Standard_At_Risk: Low Value (Balance < 80,000 EUR) & High Risk (Prob >= T*)
    - Q3_VIP_Loyal: High Value (Balance >= 80,000 EUR) & Low Risk (Prob < T*)
    - Q4_Standard_Loyal: Low Value (Balance < 80,000 EUR) & Low Risk (Prob < T*)

    Parameters
    ----------
    df : pd.DataFrame
        Input scored customer dataframe.
    prob_col : str, optional
        Predicted churn probability column name, default 'Predicted_Probability'.
    balance_col : str, optional
        Deposit balance column name, default 'Balance'.
    risk_threshold : float, optional
        Threshold separating high risk from low risk, default 0.45.
    high_value_threshold : float, optional
        Deposit threshold separating VIP from Standard, default 80000.0 EUR.

    Returns
    -------
    pd.DataFrame
        DataFrame with Value_Tier, Risk_Tier_Binary, and Quadrant columns.
    """
    df_out = df.copy()

    if prob_col not in df_out.columns:
        raise KeyError(f"Column '{prob_col}' not found in DataFrame.")
    if balance_col not in df_out.columns:
        raise KeyError(f"Column '{balance_col}' not found in DataFrame.")

    high_val = df_out[balance_col] >= high_value_threshold
    high_risk = df_out[prob_col] >= risk_threshold

    df_out['Value_Tier'] = np.where(high_val, 'High_Value', 'Low_Value')
    df_out['Risk_Tier_Binary'] = np.where(high_risk, 'High_Risk', 'Low_Risk')

    conditions = [
        high_val & high_risk,
        (~high_val) & high_risk,
        high_val & (~high_risk),
        (~high_val) & (~high_risk)
    ]
    choices = [
        'Q1_VIP_At_Risk',
        'Q2_Standard_At_Risk',
        'Q3_VIP_Loyal',
        'Q4_Standard_Loyal'
    ]

    df_out['Quadrant'] = np.select(conditions, choices, default='Q4_Standard_Loyal')
    return df_out


def get_quadrant_summary(
    df_quadrants: pd.DataFrame,
    balance_col: str = 'Balance',
    prob_col: str = 'Predicted_Probability',
    target_col: str = 'Exited'
) -> pd.DataFrame:
    """
    Generates an executive KPI summary table for the 4 Quadrants.
    """
    total_customers = len(df_quadrants)
    total_balance_bank = df_quadrants[balance_col].sum()

    records = []
    quadrant_names = [
        ('Q1_VIP_At_Risk', 'VIP Nguy cơ Cao (High Value, High Risk)'),
        ('Q2_Standard_At_Risk', 'Phổ thông Nguy cơ Cao (Low Value, High Risk)'),
        ('Q3_VIP_Loyal', 'VIP Trung thành (High Value, Low Risk)'),
        ('Q4_Standard_Loyal', 'Phổ thông Trung thành (Low Value, Low Risk)')
    ]

    for q_code, q_desc in quadrant_names:
        q_df = df_quadrants[df_quadrants['Quadrant'] == q_code]
        count = len(q_df)
        pct_cust = (count / total_customers) * 100.0 if total_customers > 0 else 0.0
        tot_bal = q_df[balance_col].sum()
        pct_bal = (tot_bal / total_balance_bank) * 100.0 if total_balance_bank > 0 else 0.0
        mean_bal = q_df[balance_col].mean() if count > 0 else 0.0
        avg_risk = q_df[prob_col].mean() * 100.0 if count > 0 else 0.0
        
        actual_churn = 0.0
        if target_col in q_df.columns:
            actual_churn = q_df[target_col].mean() * 100.0

        records.append({
            'Quadrant_Code': q_code,
            'Description': q_desc,
            'Customer_Count': count,
            'Customer_Pct': round(pct_cust, 2),
            'Total_Balance_M_EUR': round(tot_bal / 1e6, 2),
            'Balance_Pct': round(pct_bal, 2),
            'Mean_Balance_EUR': round(mean_bal, 2),
            'Avg_Predicted_Risk_Pct': round(avg_risk, 2),
            'Actual_Churn_Pct': round(actual_churn, 2)
        })

    return pd.DataFrame(records)
