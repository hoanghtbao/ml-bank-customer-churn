"""
Main Home Page for EuroVanguard Bank Customer Churn Decision Support System.
Roleplay: EuroVanguard Bank (France, Germany, Spain).
Architecture: CRISP-DM & Gartner 4 Analytics Levels.
"""

import streamlit as st
import os
import sys

# Universal path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.ui_theme import apply_theme, render_sidebar_brand, render_page_header, render_stat_card
from app.utils import load_metadata, get_pre_scored_data

st.set_page_config(
    page_title="EuroVanguard Bank - Churn DSS",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apply global styling
apply_theme()
render_sidebar_brand()
render_sidebar_footer()

# Sidebar Info
st.sidebar.markdown("""
<div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.5; margin-top: 10px;">
    <strong style="color: #cbd5e1;">Chuẩn mực Nghiệp vụ:</strong><br>
    • <b>CRISP-DM Standard</b> (6 Phases)<br>
    • <b>Gartner 4 Analytics Levels</b><br>
    • <b>Basel III / SR 11-7 Compliance</b><br>
    • <b>EU GDPR Article 22 Fairness</b>
</div>
""", unsafe_allow_html=True)

# Hero Banner
render_page_header(
    title="EuroVanguard Bank — Churn Analytics & Retention DSS",
    subtitle="Hệ thống quản trị rủi ro rời bỏ và hỗ trợ quyết định giữ chân khách hàng (Pháp, Đức, Tây Ban Nha)",
    category="Enterprise Portfolio Analytics"
)

# Top KPI Metric Cards (Dual Baseline Framework)
st.markdown('<div class="section-title">Hệ Thống Mục Tiêu Kép Toàn Ngân Hàng (Executive Dual Baseline)</div>', unsafe_allow_html=True)

c1, c2, c3, c4 = st.columns(4)
with c1:
    render_stat_card(
        title="Tổng Quy Mô Danh Mục",
        value="10,000",
        delta="Pháp, Đức, Tây Ban Nha",
        delta_type="info",
        icon="👥",
        tooltip="Toàn bộ danh mục khách hàng cá nhân đang quản lý."
    )
with c2:
    render_stat_card(
        title="Tổng Tiền Gửi Huy Động",
        value="764.86M €",
        delta="100% Nguồn vốn tiền gửi",
        delta_type="neutral",
        icon="💰",
        tooltip="Tổng số dư tiền gửi có kỳ hạn và không kỳ hạn."
    )
with c3:
    render_stat_card(
        title="Tỷ Lệ Churn Đầu Người",
        value="20.38%",
        delta="▼ 2,038 khách hàng",
        delta_type="danger",
        icon="⚠️",
        tooltip="Baseline Churn theo số lượng đầu tài khoản."
    )
with c4:
    render_stat_card(
        title="Tiền Gửi Rủi Ro (At-Risk)",
        value="185.68M €",
        delta="▲ 24.28% tổng vốn (Nguy hiểm)",
        delta_type="danger",
        icon="🚨",
        tooltip="Khách rời bỏ giữ TB 91,109 EUR vs Khách ở lại 72,743 EUR (+25.2%)."
    )

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# Gartner 4 Analytics Levels Architecture
st.markdown("### 🧠 Kiến Trúc Giải Pháp 4 Tầng Phân Tích Gartner")

tab1, tab2, tab3, tab4 = st.tabs([
    "📈 1. Descriptive (Mô tả)",
    "🔬 2. Diagnostic (Chẩn đoán)",
    "🎯 3. Predictive (Dự báo Sớm)",
    "💡 4. Prescriptive (Đề xuất Giữ chân)"
])

with tab1:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0 0 10px 0; color: #1e3a8a;">Tầng 1: Phân tích Mô tả (Descriptive Analytics) — Hiện tượng gì đã và đang diễn ra?</h4>
        <ul style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin: 0; padding-left: 20px;">
            <li><b>Phân phối tiền gửi hai đỉnh (Bimodal Trap):</b> Có tới <b>36.17% khách hàng (3,617 người) có số dư bằng 0 EUR</b> tập trung ở Pháp và Tây Ban Nha, trong khi khách hàng có tiền gửi phân bố chuẩn quanh 110k – 130k EUR.</li>
            <li><b>Chênh lệch tài sản nhóm rời bỏ:</b> Khách hàng rời bỏ có số dư trung bình <b>91,109 EUR</b>, cao hơn nhóm trung thành <b>+25.2%</b> (72,743 EUR). Ngân hàng đang đối mặt với nguy cơ thất thoát vốn lớn chứ không chỉ là mất số lượng tài khoản đơn thuần.</li>
            <li><b>Đặc trưng phân bố:</b> Phân tích đơn biến 18 thuộc tính theo chuẩn đồ thị <code>ggplot</code> với độ đo Skewness và Kurtosis chuẩn xác.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with tab2:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0 0 10px 0; color: #1e3a8a;">Tầng 2: Phân tích Chẩn đoán (Diagnostic Analytics) — Tại sao hiện tượng này lại xảy ra?</h4>
        <ul style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin: 0; padding-left: 20px;">
            <li><b>Tâm chấn Thất thoát Đức (German Epicenter):</b> Tỷ lệ rời bỏ tại Đức là <b>32.44%</b> (gấp đôi Pháp 16.17% và TBN 16.67%). 100% khách hàng Đức có số dư dương (trung bình 119,730 EUR), làm thất thoát <b>97.97M EUR (chiếm 52.76% tổng lượng tiền gửi bị mất của toàn ngân hàng)</b>.</li>
            <li><b>Bẫy Bán chéo & Đường cong Chữ U ngược:</b> Khách dùng 2 sản phẩm có tỷ lệ rời bỏ tối ưu nhất (chỉ <b>7.60%</b>). Khi cố ép bán chéo lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên <b>82.71% và 100.0%</b> do quá tải dịch vụ.</li>
            <li><b>Phát hiện Rò rỉ Nhãn (Target Leakage):</b> Biến <code>Complain</code> tương quan 99.86% với <code>Exited</code> (99.51% khách có khiếu nại đều rời bỏ). Hệ thống bóc tách biến này ra khỏi mô hình để thiết lập cơ chế cảnh báo sớm thực sự.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with tab3:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0 0 10px 0; color: #1e3a8a;">Tầng 3: Phân tích Dự báo (Predictive Analytics) — Khách hàng nào sẽ rời bỏ tiếp theo?</h4>
        <ul style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin: 0; padding-left: 20px;">
            <li><b>Mô hình Quán quân Proactive XGBoost:</b> Huấn luyện độc lập 12 mô hình và kiểm định 4 kịch bản Ablation (A, A1, A2, B) nhằm đảm bảo tính công bằng (Fairness) và không rò rỉ nhãn.</li>
            <li><b>Kết quả Kiểm thử Độc lập 1 Lần (Test Holdout 1,500 khách):</b>
                Accuracy <b>84.67%</b> | ROC-AUC <b>0.8437</b> (95% Bootstrap CI: [0.8179, 0.8693]) | F1-Score <b>0.5922</b> tại ngưỡng quyết định tối ưu <b>T* = 0.45</b>.
            </li>
            <li><b>Decile 1 Lift 3.97x:</b> Nhắm mục tiêu 10% khách hàng có điểm rủi ro cao nhất giúp ngân hàng chặn đứng <b>39.67% tổng lượng khách hàng rời bỏ</b>.</li>
            <li><b>Giải thích Minh bạch SHAP:</b> Trích xuất nguyên nhân thúc đẩy rủi ro toàn cục và cục bộ cho từng hồ sơ khách hàng.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with tab4:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0 0 10px 0; color: #1e3a8a;">Tầng 4: Phân tích Đề xuất (Prescriptive Analytics) — Cần hành động gì để giữ chân và tối đa hóa ROI?</h4>
        <ul style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin: 0; padding-left: 20px;">
            <li><b>Ma trận Phân khúc 4 Góc phần tư (Value × Risk Matrix):</b> Tập trung nguồn lực cao nhất vào <b>Q1 (VIP At-Risk)</b> — nhóm giữ <b>242.81M EUR tiền gửi (31.75% toàn ngân hàng)</b> với tỷ lệ rời bỏ thực tế 74.14%.</li>
            <li><b>5 Chiến lược Next-Best-Action (NBA):</b> Quy trình khẩn cấp SLA 4 giờ khi có khiếu nại, tái cơ cấu sản phẩm tháo gỡ bẫy bán chéo, chương trình bảo toàn tiền gửi tại Đức, kích hoạt số cho nhóm số dư 0, và tri ân định kỳ.</li>
            <li><b>Mô hình Kinh tế học Tiered ROI:</b> Ngân sách can thiệp <b>303,700 EUR</b> giúp giữ chân thành công <b>720 khách hàng</b>, bảo vệ <b>73.95M EUR tiền gửi</b>, mang lại lợi ích tài chính ròng <b>3.54 triệu EUR</b> (ROI <b>1,164.96%</b>).</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<div style='height: 30px;'></div>", unsafe_allow_html=True)

# Module Navigation Grid
st.markdown("### 🧭 Khám Phá Các Phân Hệ Chức Năng (Navigation Hub)")

n1, n2, n3 = st.columns(3)

with n1:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
            <div style="font-size: 1.5rem; margin-bottom: 8px;">📈</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700;">1. Executive Dashboard</h4>
            <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">
                Báo cáo quản trị điều hành, so sánh thất thoát tiền gửi 3 quốc gia, bản đồ nhiệt tương tác và phân tích sâu nhân khẩu học.
            </p>
        </div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #2563eb;">👉 Mở trang 1_Executive_Dashboard ở menu trái</div>
    </div>
    """, unsafe_allow_html=True)

with n2:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
            <div style="font-size: 1.5rem; margin-bottom: 8px;">👤</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700;">2. Retention Advisor (Tư Vấn 1-1)</h4>
            <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">
                Tra cứu hoặc nhập hồ sơ cá nhân, chấm điểm rủi ro thời gian thực, bóc tách SHAP Waterfall, gợi ý Next-Best-Action và tạo kịch bản gọi điện chăm sóc.
            </p>
        </div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #2563eb;">👉 Mở trang 2_Customer_Retention_Advisor</div>
    </div>
    """, unsafe_allow_html=True)

with n3:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
            <div style="font-size: 1.5rem; margin-bottom: 8px;">📋</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700;">3. Batch Campaign Scoring</h4>
            <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">
                Tải lên tệp CSV bất kỳ hoặc chấm điểm toàn bộ 10,000 hồ sơ hiện hữu, phân tầng rủi ro và xuất danh sách gọi điện (Call-list) ưu tiên theo ngân sách.
            </p>
        </div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #2563eb;">👉 Mở trang 3_Batch_Campaign_Scoring</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<div style='height: 14px;'></div>", unsafe_allow_html=True)

n4, n5 = st.columns(2)

with n4:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);">
        <div style="font-size: 1.5rem; margin-bottom: 8px;">💰</div>
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700;">4. Prescriptive Strategy & Tiered ROI Simulator</h4>
        <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">
            Bản đồ ma trận 4 góc phần tư tương tác và máy tính mô phỏng Lợi nhuận Ròng tài chính với các thanh trượt NIM, chi phí chăm sóc và xác suất giữ chân.
        </p>
        <div style="font-size: 0.82rem; font-weight: 600; color: #2563eb;">👉 Mở trang 4_Prescriptive_Strategy_ROI</div>
    </div>
    """, unsafe_allow_html=True)

with n5:
    st.markdown("""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);">
        <div style="font-size: 1.5rem; margin-bottom: 8px;">🛡️</div>
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700;">5. Model Governance, Fairness & SHAP Registry</h4>
        <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">
            Báo cáo kiểm định mô hình, đối chiếu 4 kịch bản Ablation (Leakage & Fairness), đường cong Decile Gain/Lift, biểu đồ SHAP và checklist tuân thủ Basel III.
        </p>
        <div style="font-size: 0.82rem; font-weight: 600; color: #2563eb;">👉 Mở trang 5_Model_Governance_SHAP</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("""
<div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 0.85rem;">
    EuroVanguard Bank Decision Support System © 2026 • Certified Enterprise Machine Learning Deployment
</div>
""", unsafe_allow_html=True)
