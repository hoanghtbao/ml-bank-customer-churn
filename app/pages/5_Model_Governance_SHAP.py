"""
Model Governance, SHAP Explainability & AI Ethics Compliance Page.
Provides model registry metadata, decile lift table, ablation comparisons,
global/local SHAP plots, and Basel III / SR 11-7 audit checklists.
Roleplay: EuroVanguard Bank.
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

from app.ui_theme import (
    apply_theme,
    render_sidebar_brand,
    render_sidebar_footer,
    render_page_header,
    render_stat_card,
    render_meta_card
)
from app.utils import load_metadata

st.set_page_config(page_title="Model Governance - EuroVanguard", page_icon="🛡️", layout="wide")

apply_theme()
render_sidebar_brand()
render_sidebar_footer()

render_page_header(
    title="Quản Trị Mô Hình & Minh Bạch SHAP (Model Governance)",
    subtitle="Nhật ký phiên bản xuất xưởng, khoảng tin cậy 95% Bootstrap CI, phân vị Decile Lift và kiểm soát đạo đức AI",
    category="AI Governance & Explainability"
)

metadata = load_metadata()
test_metrics = metadata.get('test_holdout_metrics', {})
runtime = metadata.get('runtime_environment', {})

# 1. Model Registry & Metadata Audit Cards
st.markdown('<div class="section-title">1. Hồ Sơ Xuất Xưởng Mô Hình (Model Registry & Provenance)</div>', unsafe_allow_html=True)
m_col1, m_col2, m_col3 = st.columns(3)

with m_col1:
    render_meta_card(
        title="Mô Hình Quán Quân",
        icon="🤖",
        items={
            "Mã định danh": metadata.get('model_name', 'XGBoost_StandardScaler_Proactive'),
            "Thuật toán": metadata.get('champion_model_type', 'XGBClassifier'),
            "Bộ chuẩn hóa": metadata.get('scaler', 'StandardScaler'),
            "Ngưỡng T*": str(metadata.get('optimal_decision_threshold', 0.45)),
            "Chiến lược": "Proactive Early-Warning"
        }
    )

with m_col2:
    render_meta_card(
        title="Môi Trường Thực Thi (Certified)",
        icon="⚙️",
        items={
            "Python": runtime.get('python_version', '3.13.2'),
            "Scikit-Learn": runtime.get('scikit_learn_version', '1.9.1'),
            "XGBoost": runtime.get('xgboost_version', '3.4.1'),
            "Joblib": f"v{runtime.get('joblib_version', '1.6.0')}",
            "Nền tảng": "Windows x64 Enterprise"
        }
    )

with m_col3:
    render_meta_card(
        title="Kiểm Soát Rò Rỉ Dữ Liệu (Leakage)",
        icon="🛡️",
        items={
            "Khử rò rỉ (Leakage)": "Complain (Loại bỏ 100%)",
            "Định danh cấm đưa vào": "RowNumber, CustomerId, Surname",
            "Số biến đầu vào": f"{len(metadata.get('feature_columns', []))} đặc trưng",
            "Quy tắc ghi đè SLA": "SLA 4-Hour khiếu nại mở",
            "Tuân thủ": "EU GDPR Art. 22 & Basel III"
        }
    )

st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

# 2. Test Set Holdout Metrics with 95% Bootstrap CI
st.markdown('<div class="section-title">2. Hiệu Năng Kiểm Thử Độc Lập 1 Lần (Untouched Test Holdout - 1,500 Khách Hàng)</div>', unsafe_allow_html=True)
st.caption("Tập kiểm thử được niêm phong hoàn toàn và chỉ mở duy nhất 1 lần để thẩm định khách quan năng lực thực chiến ngoài môi trường sản xuất.")

k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    render_stat_card("Accuracy", f"{test_metrics.get('accuracy', 0.8467)*100:.2f}%", "Độ chính xác tổng thể", "success", "🎯")
with k2:
    render_stat_card("Precision", f"{test_metrics.get('precision', 0.6448)*100:.2f}%", "Độ chuẩn xác cảnh báo", "info", "🔍")
with k3:
    render_stat_card("Recall", f"{test_metrics.get('recall', 0.5475)*100:.2f}%", "Tỷ lệ bắt trúng Churn", "info", "🎯")
with k4:
    f1_ci = test_metrics.get('f1_95_ci', [0.5428, 0.6348])
    render_stat_card("F1-Score", f"{test_metrics.get('f1_score', 0.5922):.4f}", f"95% CI: [{f1_ci[0]:.2f}, {f1_ci[1]:.2f}]", "success", "⚖️")
with k5:
    auc_ci = test_metrics.get('roc_auc_95_ci', [0.8179, 0.8693])
    render_stat_card("ROC-AUC", f"{test_metrics.get('roc_auc', 0.8437):.4f}", f"95% CI: [{auc_ci[0]:.2f}, {auc_ci[1]:.2f}]", "success", "📈")

st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

# 3. Decile Gain & Cumulative Lift Table
st.markdown('<div class="section-title">3. Bảng Phân Vị Tích Lũy (Decile Gain & Cumulative Lift Table)</div>', unsafe_allow_html=True)

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

st.markdown("""
<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; color: #166534; font-size: 0.9rem; margin-top: 8px;">
    🎯 <b>Ý nghĩa Thực tiễn:</b> Decile 1 đạt hệ số Lift lên tới <b>3.97x</b>. 
    Chỉ cần tập trung nguồn lực can thiệp vào đúng 10% khách hàng có điểm rủi ro cao nhất là ngân hàng đã chặn đứng 
    <b>gần 40% (39.67%) toàn bộ lượng khách hàng rời bỏ</b>.
</div>
""", unsafe_allow_html=True)

st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

# 4. Ablation Studies Matrix
st.markdown('<div class="section-title">4. Nghiên Cứu Triệt Tiêu (Ablation Studies: 4 Kịch Bản Độc Lập)</div>', unsafe_allow_html=True)
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
st.dataframe(ab_table, use_container_width=True)

st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

# 5. SHAP Visualizations
st.markdown('<div class="section-title">5. Minh Bạch Hóa Mô Hình với SHAP (Explainability)</div>', unsafe_allow_html=True)
shap_c1, shap_c2 = st.columns(2)

fig14_path = os.path.join(PROJECT_ROOT, 'reports', 'figures', 'fig_14_shap_summary.png')
fig15_path = os.path.join(PROJECT_ROOT, 'reports', 'figures', 'fig_15_shap_waterfall_sample.png')

with shap_c1:
    st.markdown("**Đóng Góp Đặc Trưng Toàn Cục (Global SHAP Beeswarm)**")
    if os.path.exists(fig14_path):
        st.image(fig14_path, use_container_width=True)
    else:
        st.info("Chưa tìm thấy fig_14_shap_summary.png")

with shap_c2:
    st.markdown("**Giải Thích Cục Bộ Cho 1 Khách Hàng (Local SHAP Waterfall)**")
    if os.path.exists(fig15_path):
        st.image(fig15_path, use_container_width=True)
    else:
        st.info("Chưa tìm thấy fig_15_shap_waterfall_sample.png")

st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

# 6. Model Governance Audit Checklist
st.markdown('<div class="section-title">6. Danh Mục Kiểm Soát Tuân Thủ Quản Trị Mô Hình (Basel III / SR 11-7 / AI Ethics)</div>', unsafe_allow_html=True)
g1, g2 = st.columns(2)

with g1:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [SR 11-7] Phân Lập Tuyệt Đối Dữ Liệu</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Pipeline tiền xử lý độc lập, không rò rỉ dữ liệu qua các tập Train / Val / Test.</div>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [Leakage Audit] Loại Bỏ Triệt Để Biến Complain</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Chặn đứng hiện tượng Target Leakage (tương quan 99.86%) trong luồng dự báo sớm.</div>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [Basel III] Đánh Giá Khả Năng Tổng Quát Hóa</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Kiểm định nghiêm ngặt với khoảng tin cậy 95% Bootstrap CI trên tập Test độc lập.</div>
    </div>
    """, unsafe_allow_html=True)

with g2:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [AI Fairness] Kiểm Định Phi Định Kiến Giới Tính</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Mô hình Gender-blind duy trì AUC 0.8661, không phân biệt đối xử theo quy định EU GDPR.</div>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [Operational SLA] Quy Trình Cứng SLA 4-Hour Escalation</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">100% khách hàng có khiếu nại mở được kích hoạt chuyển tiếp can thiệp khẩn cấp.</div>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;">
        <div style="font-weight: 700; color: #166534; font-size: 0.88rem;">✅ [Version Provenance] Lưu Trữ Đầy Đủ Metadata</div>
        <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Ghi nhận cấu hình, siêu tham số và phiên bản thư viện tại models/model_metadata.json.</div>
    </div>
    """, unsafe_allow_html=True)
