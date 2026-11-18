"""
Prediction Router: Real-time scoring, SLA rule check, NBA, Call scripts, and What-If simulation.
"""

from fastapi import APIRouter, HTTPException
import os
import sys
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from api.schemas import (
    CustomerProfileInput,
    SinglePredictionResponse,
    WhatIfRequest,
    WhatIfResponse
)
from src.modeling.predict import predict_customer
from src.business.retention_advisor import (
    recommend_next_best_action,
    generate_call_script
)

router = APIRouter(prefix="/api/predict", tags=["Prediction & Retention Advisory"])

MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'churn_early_warning_pipeline.joblib')
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(status_code=500, detail="Model pipeline file not found.")
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline


@router.post("/single", response_model=SinglePredictionResponse)
def score_single_customer(payload: CustomerProfileInput):
    """Scores an individual customer record with business rules, NBA, and call script."""
    pipeline = get_pipeline()
    customer_dict = payload.model_dump()
    rm_name = customer_dict.pop('rm_name', 'Hoàng Hữu Bảo (Senior RM)')

    # Run ML prediction with complaint rule
    pred_res = predict_customer(pipeline, customer_dict, threshold=0.45, enforce_complain_rule=True)
    nba = recommend_next_best_action(customer_dict)
    script = generate_call_script(customer_dict, rm_name=rm_name)

    # Financial economics
    bal = float(customer_dict.get('Balance', 0.0))
    prods = int(customer_dict.get('NumOfProducts', 1))
    v_annual = (0.025 * bal) + (120.0 * prods)
    c_action = float(nba.get('estimated_cost_eur', 50.0))
    p_retain = 0.35 if bal >= 100000.0 else 0.25
    t_breakeven = c_action / (p_retain * v_annual) if (p_retain * v_annual) > 0 else 1.0

    prob = float(pred_res['churn_probability'])
    expected_net = (prob * p_retain * v_annual) - c_action

    # Convert numpy types to native Python types for clean JSON serialization
    clean_eng_features = {}
    for k, v in pred_res.get('engineered_features', {}).items():
        if hasattr(v, 'item'):
            clean_eng_features[k] = v.item()
        elif isinstance(v, (int, float, str, bool)):
            clean_eng_features[k] = v
        else:
            clean_eng_features[k] = str(v)

    return SinglePredictionResponse(
        CustomerId=int(customer_dict.get('CustomerId', 15700001)),
        Surname=str(customer_dict.get('Surname', 'Dupont')),
        churn_probability=round(prob, 4),
        churn_prediction=int(pred_res['churn_prediction']),
        threshold_used=float(pred_res['threshold_used']),
        risk_tier=str(pred_res['risk_tier']),
        rule_override_applied=bool(pred_res['rule_override_applied']),
        override_message=str(pred_res['override_message']),
        annual_customer_value_eur=round(v_annual, 2),
        action_cost_eur=round(c_action, 2),
        break_even_threshold=round(t_breakeven, 4),
        expected_net_gain_eur=round(expected_net, 2),
        next_best_action=nba,
        call_script=script,
        engineered_features=clean_eng_features
    )


@router.post("/what-if", response_model=WhatIfResponse)
def simulate_what_if(payload: WhatIfRequest):
    """Simulates real-time probability shift when tweaking actionable features."""
    pipeline = get_pipeline()
    orig_dict = payload.customer.model_dump()
    orig_dict.pop('rm_name', None)

    # Original probability (without complaint override to compare pure ML shift)
    orig_dict['Complain'] = 0
    orig_res = predict_customer(pipeline, orig_dict, threshold=0.45, enforce_complain_rule=False)
    orig_p = float(orig_res['churn_probability'])

    # Simulated profile
    sim_dict = orig_dict.copy()
    sim_dict['IsActiveMember'] = payload.sim_is_active
    sim_dict['NumOfProducts'] = payload.sim_num_products
    sim_dict['Balance'] = payload.sim_balance
    sim_dict['Complain'] = 0

    sim_res = predict_customer(pipeline, sim_dict, threshold=0.45, enforce_complain_rule=False)
    sim_p = float(sim_res['churn_probability'])

    delta = round(sim_p - orig_p, 4)
    reduced = delta < 0

    if delta < -0.05:
        note = "Khuyến nghị can thiệp rất hiệu quả! Nguy cơ rời bỏ giảm mạnh."
    elif delta > 0.05:
        note = "Cảnh báo: Thay đổi này làm tăng nguy cơ khách hàng rời bỏ."
    else:
        note = "Mức độ rủi ro tương đối ổn định, ít biến động."

    return WhatIfResponse(
        original_probability=round(orig_p, 4),
        simulated_probability=round(sim_p, 4),
        delta_probability=delta,
        is_risk_reduced=reduced,
        recommendation_note=note
    )
