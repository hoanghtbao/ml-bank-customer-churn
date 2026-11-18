"""
Governance Router: Model registry metadata, test holdout metrics, decile lift, and ablation.
"""

from fastapi import APIRouter
import os
import sys
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

router = APIRouter(prefix="/api/governance", tags=["Model Governance & Explainability"])

META_PATH = os.path.join(PROJECT_ROOT, 'models', 'model_metadata.json')


@router.get("/metadata")
def get_model_metadata():
    """Returns official certified model registry metadata."""
    if os.path.exists(META_PATH):
        with open(META_PATH, 'r', encoding='utf-8') as f:
            meta = json.load(f)
    else:
        meta = {}

    decile_data = [
        {'Decile': 1, 'Khách hàng': 150, 'Số Churn': 121, 'Tỷ lệ Churn Decile (%)': '80.67%', 'Tích lũy Churn Bắt được (%)': '39.67%', 'Hệ số Nâng (Lift)': '3.97x'},
        {'Decile': 2, 'Khách hàng': 150, 'Số Churn': 61, 'Tỷ lệ Churn Decile (%)': '40.67%', 'Tích lũy Churn Bắt được (%)': '59.67%', 'Hệ số Nâng (Lift)': '2.98x'},
        {'Decile': 3, 'Khách hàng': 150, 'Số Churn': 39, 'Tỷ lệ Churn Decile (%)': '26.00%', 'Tích lũy Churn Bắt được (%)': '72.46%', 'Hệ số Nâng (Lift)': '2.42x'},
        {'Decile': 4, 'Khách hàng': 150, 'Số Churn': 25, 'Tỷ lệ Churn Decile (%)': '16.67%', 'Tích lũy Churn Bắt được (%)': '80.66%', 'Hệ số Nâng (Lift)': '2.02x'},
        {'Decile': 5, 'Khách hàng': 150, 'Số Churn': 20, 'Tỷ lệ Churn Decile (%)': '13.33%', 'Tích lũy Churn Bắt được (%)': '87.21%', 'Hệ số Nâng (Lift)': '1.74x'},
        {'Decile': 6, 'Khách hàng': 150, 'Số Churn': 12, 'Tỷ lệ Churn Decile (%)': '8.00%', 'Tích lũy Churn Bắt được (%)': '91.15%', 'Hệ số Nâng (Lift)': '1.52x'},
        {'Decile': 7, 'Khách hàng': 150, 'Số Churn': 11, 'Tỷ lệ Churn Decile (%)': '7.33%', 'Tích lũy Churn Bắt được (%)': '94.75%', 'Hệ số Nâng (Lift)': '1.35x'},
        {'Decile': 8, 'Khách hàng': 150, 'Số Churn': 7, 'Tỷ lệ Churn Decile (%)': '4.67%', 'Tích lũy Churn Bắt được (%)': '97.05%', 'Hệ số Nâng (Lift)': '1.21x'},
        {'Decile': 9, 'Khách hàng': 150, 'Số Churn': 4, 'Tỷ lệ Churn Decile (%)': '2.67%', 'Tích lũy Churn Bắt được (%)': '98.36%', 'Hệ số Nâng (Lift)': '1.09x'},
        {'Decile': 10, 'Khách hàng': 150, 'Số Churn': 5, 'Tỷ lệ Churn Decile (%)': '3.33%', 'Tích lũy Churn Bắt được (%)': '100.00%', 'Hệ số Nâng (Lift)': '1.00x'}
    ]

    ablation_data = [
        {
            'scenario': 'Scenario A (Champion Proactive)',
            'description': 'Standard Early-Warning (Loại bỏ Complain)',
            'val_accuracy': '86.40%', 'val_f1': '0.5968', 'val_roc_auc': '0.8702',
            'status': 'CLEAN (An toàn vận hành thực chiến)'
        },
        {
            'scenario': 'Scenario A1 (Strict Operational)',
            'description': 'Loại bỏ cả Complain & Satisfaction_Score',
            'val_accuracy': '85.73%', 'val_f1': '0.5754', 'val_roc_auc': '0.8717',
            'status': 'CLEAN (Dự phòng khi khảo sát bị gián đoạn)'
        },
        {
            'scenario': 'Scenario A2 (AI Fairness & Ethics)',
            'description': 'Loại bỏ Complain & Gender (Phi định kiến giới tính)',
            'val_accuracy': '85.93%', 'val_f1': '0.5838', 'val_roc_auc': '0.8661',
            'status': 'CLEAN (Tuân thủ đạo đức AI, chỉ giảm 0.004 AUC)'
        },
        {
            'scenario': 'Scenario B (Leakage Benchmark)',
            'description': 'Bao gồm biến Complain (Chứng minh khiếm khuyết)',
            'val_accuracy': '99.87%', 'val_f1': '0.9967', 'val_roc_auc': '0.9982',
            'status': 'RÒ RỈ DỮ LIỆU NẶNG (Bị từ chối đưa vào sản xuất)'
        }
    ]

    return {
        "metadata": meta,
        "decile_lift_table": decile_data,
        "ablation_studies": ablation_data
    }
