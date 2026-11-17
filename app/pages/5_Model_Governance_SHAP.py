"""
Model Governance, SHAP Explainability & AI Ethics Compliance Page.
Provides model registry metadata, decile lift table, ablation comparisons,
global/local SHAP plots, and Basel III / SR 11-7 audit checklists.
"""

import os
import sys
import json
import streamlit as st
import pandas as pd
from PIL import Image

# Universal path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.utils import load_metadata

st.set_page_config(page_title="Model Governance & SHAP - EuroVanguard", page_icon="🛡️", layout="wide")

st.title("🛡️ Quản Trị Mô Hình & Minh Bạch SHAP (Model Governance & Explainability)")
st.caption("Nhật Ký Phiên Bản, Khoảng Tin Cậy 95% Bootstrap CI, Bảng Decile Lift, Bóc Tách Đóng Góp SHAP & Kiểm Soát Đạo Đức AI")

metadata = load_metadata()
test_metrics = metadata.get('test_holdout_metrics', {})

# 1. Model Registry & Provenance
st.subheader("1. Hồ Sơ Xuất Xưởng Mô Hình (Model Registry & Metadata)")
m_col1, m_col2, m_col3 = st.columns(3)

with m_col1:
    st.info(f"""
    **Thông Tin Mô Hình Quán Quân:**  
    • Định danh: `{metadata.get('model_name', 'XGBoost_StandardScaler_Proactive')}`  
    • Thuật toán: `{metadata.get('champion_model_type', 'XGBClassifier')}`  
    • Bộ Chuẩn hóa: `{metadata.get('scaler', 'StandardScaler')}`  
    • Ngưỡng Quyết định T*: `{metadata.get('optimal_decision_threshold', 0.45)}`
    """)

with m_col2:
    runtime = metadata.get('runtime_environment', {})
    st.info(f"""
    **Môi Trường Thực Thi (Certified Runtime):**  
    • Python: `{runtime.get('python_version', '3.13.2')}`  
    • Scikit-Learn: `{runtime.get('scikit_learn_version', '1.9.1')}`  
    • XGBoost: `{runtime.get('xgboost_version', '3.4.1')}`  
    • Joblib: `{runtime.get('joblib_version', '1.6.0')}`
    """)

with m_col3:
    st.info(f"""
    **Nguyên Tắc Khử Rò Rỉ Dữ Liệu:**  
    • Biến bị loại bỏ triệt để (Leakage): `{metadata.get('excluded_features_target_leakage', ['Complain'])}`  
    • Định danh không tham gia huấn luyện: `RowNumber, CustomerId, Surname`  
    • Tổng số đặc trưng đầu vào: `{len(metadata.get('feature_columns', []))}`
    """)

st.divider()

# 2. Test Set Holdout Metrics with 95% Bootstrap CI
st.subheader("2. Hiệu Năng Kiểm Thử Độc Lập 1 Lần (1-Time Untouched Test Holdout - 1,500 Khách hàng)")
st.caption("Được niêm phong hoàn toàn và chỉ mở duy nhất 1 lần để thẩm định khách quan năng lực thực chiến ngoài môi trường sản xuất.")

k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    st.metric("Accuracy", f"{test_metrics.get('accuracy', 0.8467)*100:.2f}%")
with k2:
    st.metric("Precision", f"{test_metrics.get('precision', 0.6448)*100:.2f}%")
with k3:
    st.metric("Recall", f"{test_metrics.get('recall', 0.5475)*100:.2f}%")
with k4:
    f1_ci = test_metrics.get('f1_95_ci', [0.5428, 0.6348])
    st.metric("F1-Score", f"{test_metrics.get('f1_score', 0.5922):.4f}", f"95% CI: [{f1_ci[0]:.2f}, {f1_ci[1]:.2f}]")
with k5:
    auc_ci = test_metrics.get('roc_auc_95_ci', [0.8179, 0.8693])
    st.metric("ROC-AUC", f"{test_metrics.get('roc_auc', 0.8437):.4f}", f"95% CI: [{auc_ci[0]:.2f}, {auc_ci[1]:.2f}]")

st.divider()

# 3. Decile Gain & Cumulative Lift Table
st.subheader("3. Bảng Phân Vị Tích Lũy (Decile Gain & Cumulative Lift Table)")
st.caption("Đo lường năng lực tập trung khách hàng rủi ro cao của mô hình trên tập kiểm thử độc lập.")

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
st.dataframe(pd.DataFrame(decile_data), use_container_width=True)
st.success("🎯 **Ý nghĩa Thực tiễn:** Decile 1 đạt hệ số Lift **3.97x**! Chỉ cần can thiệp 10% khách hàng rủi ro cao nhất, ngân hàng đã chặn đứng **gần 40% toàn bộ khách hàng rời bỏ**.")

st.divider()

# 4. Ablation Studies Matrix
st.subheader("4. Nghiên Cứu Triệt Tiêu (Ablation Studies: 4 Kịch Bản Độc Lập)")
ab_table = pd.DataFrame([
    {
        'Kịch bản': 'Scenario A (Champion Proactive)',
        'Mô tả': 'Standard Early-Warning (Loại bỏ Complain)',
        'Val Accuracy': '86.40%', 'Val F1': '0.5968', 'Val ROC-AUC': '0.8702',
        'Trạng thái': 'CLEAN (An toàn vận hành thực chiến)'
    },
    {
        'Kịch bản': 'Scenario A1 (Strict Operational)',
        'Mô tả': 'Loại bỏ cả Complain & Satisfaction_Score',
        'Val Accuracy': '85.73%', 'Val F1': '0.5754', 'Val ROC-AUC': '0.8717',
        'Trạng thái': 'CLEAN (Dự phòng khi khảo sát bị gián đoạn)'
    },
    {
        'Kịch bản': 'Scenario A2 (AI Fairness & Ethics)',
        'Mô tả': 'Loại bỏ Complain & Gender (Phi định kiến giới tính)',
        'Val Accuracy': '85.93%', 'Val F1': '0.5838', 'Val ROC-AUC': '0.8661',
        'Trạng thái': 'CLEAN (Tuân thủ đạo đức AI, chỉ giảm 0.004 AUC)'
    },
    {
        'Kịch bản': 'Scenario B (Leakage Benchmark)',
        'Mô tả': 'Bao gồm biến Complain (Chứng minh khiếm khuyết)',
        'Val Accuracy': '99.87%', 'Val F1': '0.9967', 'Val ROC-AUC': '0.9982',
        'Trạng thái': 'RÒ RỈ DỮ LIỆU NẶNG (Bị từ chối đưa vào sản xuất)'
    }
])
st.table(ab_table)

st.divider()

# 5. SHAP Visualizations
st.subheader("5. Minh Bạch Hóa Mô Hình với SHAP (Global & Local Explainability)")
shap_c1, shap_c2 = st.columns(2)

fig14_path = os.path.join(PROJECT_ROOT, 'reports', 'figures', 'fig_14_shap_summary.png')
fig15_path = os.path.join(PROJECT_ROOT, 'reports', 'figures', 'fig_15_shap_waterfall_sample.png')

with shap_c1:
    st.markdown("#### Đóng Góp Đặc Trưng Toàn Cục (Global SHAP Beeswarm)")
    if os.path.exists(fig14_path):
        st.image(fig14_path, use_container_width=True)
    else:
        st.info("Chưa tìm thấy fig_14_shap_summary.png")

with shap_c2:
    st.markdown("#### Giải Thích Cục Bộ Cho 1 Khách Hàng (Local SHAP Waterfall)")
    if os.path.exists(fig15_path):
        st.image(fig15_path, use_container_width=True)
    else:
        st.info("Chưa tìm thấy fig_15_shap_waterfall_sample.png")

st.divider()

# 6. Model Governance Audit Checklist
st.subheader("6. Danh Mục Kiểm Soát Tuân Thủ Quản Trị Mô Hình (Basel III / SR 11-7 / AI Ethics)")
g1, g2 = st.columns(2)

with g1:
    st.checkbox("✅ [SR 11-7] Phân lập tuyệt đối dữ liệu: Pipeline tiền xử lý độc lập, không rò rỉ dữ liệu qua các tập Train/Val/Test.", value=True, disabled=True)
    st.checkbox("✅ [Leakage Audit] Loại bỏ triệt để biến Complain trong mô hình dự báo sớm để ngăn ngừa rò rỉ mục tiêu.", value=True, disabled=True)
    st.checkbox("✅ [Basel III] Đánh giá khả năng tổng quát hóa với khoảng tin cậy 95% Bootstrap CI trên tập Test độc lập.", value=True, disabled=True)

with g2:
    st.checkbox("✅ [AI Fairness] Kiểm định phi định kiến giới tính: Mô hình Gender-blind duy trì AUC 0.8661.", value=True, disabled=True)
    st.checkbox("✅ [Operational SLA] Thiết lập quy tắc cứng SLA 4-Hour Escalation cho 100% trường hợp khiếu nại phát sinh.", value=True, disabled=True)
    st.checkbox("✅ [Version Provenance] Lưu trữ đầy đủ Metadata cấu hình, siêu tham số và phiên bản thư viện tại models/model_metadata.json.", value=True, disabled=True)
