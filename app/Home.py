"""
Main Home Page for EuroVanguard Bank Customer Churn Decision Support System.
"""

import streamlit as st
import os
import sys

# Universal path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.utils import load_metadata, get_pre_scored_data

st.set_page_config(
    page_title="EuroVanguard Bank - Churn DSS",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Header & Branding
st.markdown("""
<div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px;">
    <h1 style="margin: 0; font-size: 2.2rem; font-weight: 700;">🏦 EUROVANGUARD BANK</h1>
    <h3 style="margin: 5px 0 0 0; font-size: 1.2rem; opacity: 0.9;">HỆ THỐNG QUẢN TRỊ RỦI RO RỜI BỎ & RA QUYẾT ĐỊNH GIỮ CHÂN KHÁCH HÀNG (CHURN DSS)</h3>
    <p style="margin: 8px 0 0 0; font-size: 0.95rem; opacity: 0.8;">Thị trường mục tiêu: Pháp, Đức, Tây Ban Nha | Khung chuẩn mực: CRISP-DM & Gartner 4 Analytics Levels</p>
</div>
""", unsafe_allow_html=True)

# Top KPI Metric Cards (Dual Baseline Framework)
st.subheader("📊 Hệ thống Mục tiêu Kép Toàn Ngân hàng (Executive Dual Baseline)")
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="Tổng Quy mô Khách hàng",
        value="10,000",
        help="Toàn bộ cơ sở dữ liệu khách hàng cá nhân tại Pháp, Đức, Tây Ban Nha."
    )
with col2:
    st.metric(
        label="Tổng Tiền gửi Huy động",
        value="764.86M EUR",
        help="Tổng số dư tiền gửi có kỳ hạn và không kỳ hạn."
    )
with col3:
    st.metric(
        label="Tỷ lệ Rời bỏ Đầu người",
        value="20.38%",
        delta="-2,038 khách",
        delta_color="inverse",
        help="Baseline Churn Headcount."
    )
with col4:
    st.metric(
        label="Tiền gửi Rủi ro (Balance-at-Risk)",
        value="185.68M EUR",
        delta="24.28% vốn",
        delta_color="inverse",
        help="Tỷ lệ vốn tiền gửi bị thất thoát từ nhóm khách hàng rời bỏ."
    )

st.divider()

# Gartner 4 Analytics Levels Architecture
st.subheader("🧠 Kiến trúc Giải pháp Theo 4 Tầng Phân tích Gartner")

tab1, tab2, tab3, tab4 = st.tabs([
    "1. Descriptive (Mô tả)",
    "2. Diagnostic (Chẩn đoán)",
    "3. Predictive (Dự báo Sớm)",
    "4. Prescriptive (Đề xuất Giữ chân)"
])

with tab1:
    st.markdown("""
    **Tầng 1: Phân tích Mô tả (Descriptive Analytics)**
    - Phân tích đơn biến, tần suất, phân vị, độ lệch skewness và kurtosis theo phong cách đồ thị chuẩn mực `ggplot`.
    - Phát hiện cấu trúc bimodal (phân bố hai đỉnh) ở biến tiền gửi: **36.17% khách hàng có số dư bằng 0 EUR** (chủ yếu tại Pháp và Tây Ban Nha), trong khi nhóm số dư dương phân bố chuẩn quanh mức 110k - 130k EUR.
    - Nhận diện khách hàng rời bỏ có số dư trung bình **91,109 EUR** (cao hơn nhóm ở lại **+25.2%**).
    """)

with tab2:
    st.markdown("""
    **Tầng 2: Phân tích Chẩn đoán (Diagnostic Analytics)**
    - **Tâm chấn Thất thoát Đức (German Epicenter):** Tỷ lệ rời bỏ tại Đức là **32.44%** (gấp đôi Pháp 16.17% và TBN 16.67%). 100% khách Đức có số dư dương, làm thất thoát **97.97M EUR (chiếm 52.76% tổng vốn mất của toàn ngân hàng)**.
    - **Bẫy Bán chéo & Đường cong Chữ U ngược:** Sở hữu 2 sản phẩm là điểm tối ưu (churn chỉ **7.60%**). Khi cố ép bán lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên **82.71% và 100.0%**.
    - **Nghịch lý Khiếu nại & Khảo sát:** Khách hàng có khiếu nại (`Complain = 1`) rời bỏ tới **99.51%** bất kể họ chấm điểm khảo sát hài lòng 1 sao hay 5 sao. Xác nhận lỗi rò rỉ dữ liệu (Target Leakage, tương quan 99.86%).
    """)

with tab3:
    st.markdown("""
    **Tầng 3: Phân tích Dự báo (Predictive Analytics)**
    - **Mô hình Cảnh báo Sớm (Proactive Champion XGBoost):** Loại bỏ biến `Complain` để học cách nhận diện rủi ro từ sớm trước khi phát sinh khiếu nại.
    - **Kết quả Kiểm thử Độc lập 1 Lần trên Tập Test (1,500 khách):** 
      - Accuracy: **84.67%** | ROC-AUC: **0.8437** (95% CI: [0.8179, 0.8693]) | F1: **0.5922**.
      - **Decile 1 Lift: 3.97x** (Tập trung 10% khách hàng rủi ro nhất giúp chặn đứng **39.67% toàn bộ lượng khách hàng rời bỏ**).
    - **SHAP Explainability:** Giải thích minh bạch lý do dự báo ở cả cấp độ toàn hệ thống và từng cá nhân khách hàng.
    """)

with tab4:
    st.markdown("""
    **Tầng 4: Phân tích Đề xuất (Prescriptive Analytics)**
    - **Ma trận 4 Góc phần tư (Value × Risk Matrix):** Tập trung 90% nguồn lực vào **Q1 (VIP At-Risk)** đang giữ **242.81M EUR tiền gửi**.
    - **Động cơ Next-Best-Action (NBA):** 5 chiến lược hành động cụ thể (SLA 4-Hour khiếu nại, gỡ bẫy bán chéo, bảo toàn vốn Đức, kích hoạt số, tri ân thường niên).
    - **Mô hình Tài chính Lợi nhuận Ròng Đa tầng (Tiered ROI):** Đầu tư **303,700 EUR** giúp giữ chân **720 khách hàng**, bảo toàn **73.95M EUR tiền gửi**, mang lại lợi nhuận ròng **3.54 triệu EUR** (ROI **1,164.96%**).
    """)

st.divider()

# Module Navigation Guide
st.subheader("🧭 Danh mục Phân hệ Tác nghiệp")
nav_col1, nav_col2, nav_col3 = st.columns(3)

with nav_col1:
    st.info("""
    **1. Executive Dashboard**  
    Báo cáo quản trị điều hành, đối chiếu 3 quốc gia, bản đồ nhiệt thất thoát vốn tiền gửi và phân tích nhân khẩu học.
    """)
    st.info("""
    **2. Retention Advisor (Tư vấn 1-1)**  
    Tra cứu hồ sơ cá nhân, tính điểm rủi ro, xem SHAP top 3 động lực, gợi ý Next-Best-Action, sinh kịch bản gọi điện tiếng Việt, và mô phỏng What-If.
    """)

with nav_col2:
    st.info("""
    **3. Batch Campaign Scoring**  
    Tải lên file CSV bất kỳ hoặc chấm điểm toàn bộ danh mục, lọc theo góc phần tư, và tải về file CSV danh sách ưu tiên tiếp cận.
    """)
    st.info("""
    **4. Prescriptive Strategy & ROI**  
    Bản đồ phân khúc 4 góc phần tư tương tác và Bảng tính mô phỏng Lợi nhuận Ròng ROI thời gian thực với thanh trượt tùy biến.
    """)

with nav_col3:
    st.info("""
    **5. Model Governance & SHAP**  
    Trung tâm quản trị mô hình: Metadata phiên bản, bảng Decile Lift, kiểm chứng 4 kịch bản Ablation, biểu đồ SHAP và checklist tuân thủ Basel III / AI Ethics.
    """)
    meta = load_metadata()
    if meta:
        st.success(f"""
        **Trạng thái Mô hình:**  
        • Thuật toán: `{meta.get('model_name', 'XGBoost_StandardScaler')}`  
        • Ngưỡng T*: `{meta.get('optimal_decision_threshold', 0.45)}`  
        • Runtime: Python `{meta.get('runtime_environment', {}).get('python_version', '3.13')}` | Sklearn `{meta.get('runtime_environment', {}).get('scikit_learn_version', '1.9')}`
        """)

st.caption("EuroVanguard Bank Churn Decision Support System © 2026. Phát triển bởi Hoàng Hữu Bảo.")
