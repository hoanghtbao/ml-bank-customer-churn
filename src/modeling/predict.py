"""
Model Prediction and Operational Decision Support Module.
Roleplay: EuroVanguard Bank.
Implements the Proactive ML Pipeline combined with the Hard Business Rule Override for Complaints.
"""

from typing import Dict, Any, Union
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline

from src.preprocessing.feature_engineering import create_domain_features


def calibrate_risk_tier(prob: float) -> str:
    """Calibrates continuous probability into operational bank risk tiers."""
    if prob >= 0.70:
        return 'CRITICAL_RISK'
    elif prob >= 0.40:
        return 'HIGH_RISK'
    elif prob >= 0.20:
        return 'MODERATE_RISK'
    else:
        return 'LOW_RISK'


def predict_customer(
    pipeline: Pipeline,
    customer_data: Dict[str, Any],
    threshold: float = 0.27,
    enforce_complain_rule: bool = True
) -> Dict[str, Any]:
    """
    Scores an individual customer record.
    Incorporates the Hard Business Rule: If Complain == 1, overrides probability to 1.0
    and triggers emergency SLA 4-Hour Escalation Protocol.
    """
    df_single = pd.DataFrame([customer_data])

    # Check and generate domain features if missing
    req_domain_cols = [
        'IsZeroBalance', 'Balance_To_Salary_Ratio', 'Products_Per_Tenure',
        'Product_Holding_Risk_Tier', 'Age_Lifecycle_Stage', 'Engagement_Score', 'age_groups'
    ]
    if not all(col in df_single.columns for col in req_domain_cols):
        df_single = create_domain_features(df_single)

    # 1. Hard Business Rule check
    has_complain = int(customer_data.get('Complain', 0)) == 1
    if enforce_complain_rule and has_complain:
        return {
            'churn_probability': 0.9986,
            'churn_prediction': 1,
            'threshold_used': threshold,
            'risk_tier': 'CRITICAL_URGENT',
            'rule_override_applied': True,
            'override_message': 'HARD BUSINESS RULE TRIGGERED: Khách hàng có khiếu nại chưa giải quyết. Kích hoạt quy trình khẩn cấp SLA 4-Hour Escalation.',
            'engineered_features': {col: df_single[col].values[0] for col in req_domain_cols}
        }

    # 2. ML Pipeline scoring
    prob = float(pipeline.predict_proba(df_single)[:, 1][0])
    pred = int(prob >= threshold)
    risk_tier = calibrate_risk_tier(prob)

    return {
        'churn_probability': round(prob, 4),
        'churn_prediction': pred,
        'threshold_used': threshold,
        'risk_tier': risk_tier,
        'rule_override_applied': False,
        'override_message': 'Dự báo tiêu chuẩn từ Mô hình Cảnh báo Sớm (Proactive Early-Warning Model).',
        'engineered_features': {col: df_single[col].values[0] for col in req_domain_cols}
    }


def predict_batch(
    pipeline: Pipeline,
    batch_df: pd.DataFrame,
    threshold: float = 0.27,
    enforce_complain_rule: bool = True
) -> pd.DataFrame:
    """
    Scores a batch DataFrame of customer records.
    Applies vectorised scoring and Hard Business Rule override.
    """
    df_scored = batch_df.copy()

    # Generate engineered features if needed
    req_domain_cols = [
        'IsZeroBalance', 'Balance_To_Salary_Ratio', 'Products_Per_Tenure',
        'Product_Holding_Risk_Tier', 'Age_Lifecycle_Stage', 'Engagement_Score', 'age_groups'
    ]
    if not all(col in df_scored.columns for col in req_domain_cols):
        df_scored = create_domain_features(df_scored)

    # ML Pipeline probabilities
    raw_probs = pipeline.predict_proba(df_scored)[:, 1]

    df_scored['Predicted_Probability'] = np.round(raw_probs, 4)
    df_scored['Rule_Override_Applied'] = False

    if enforce_complain_rule and 'Complain' in df_scored.columns:
        complain_mask = df_scored['Complain'] == 1
        df_scored.loc[complain_mask, 'Predicted_Probability'] = 0.9986
        df_scored.loc[complain_mask, 'Rule_Override_Applied'] = True

    df_scored['Predicted_Churn'] = (df_scored['Predicted_Probability'] >= threshold).astype(int)
    df_scored['Risk_Tier'] = df_scored['Predicted_Probability'].apply(calibrate_risk_tier)

    return df_scored
