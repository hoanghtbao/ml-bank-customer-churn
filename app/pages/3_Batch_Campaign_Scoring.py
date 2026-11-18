"""
Batch Campaign Scoring Page for EuroVanguard Bank.
Allows uploading custom CSV or scoring the existing portfolio, filtering by quadrant/risk,
and downloading prioritized retention campaign target lists.
Roleplay: EuroVanguard Bank.
"""

import os
import sys
import streamlit as st
import pandas as pd
import numpy as np

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
    render_stat_card
)
from app.utils import (
    load_champion_pipeline,
    load_metadata,
    load_full_dataset,
    predict_batch,
    assign_four_quadrants,
    recommend_next_best_action
)

st.set_page_config(page_title="Batch Campaign Scoring - EuroVanguard", page_icon="📋", layout="wide")

apply_theme()
render_sidebar_brand()
render_sidebar_footer()

render_page_header(
    title="Chấm Điểm & Phân Luồng Chiến Dịch Hàng Loạt (Batch Scoring)",
    subtitle="Xử lý dữ liệu khách hàng quy mô lớn, phân tầng rủi ro tự động & xuất danh sách can thiệp cho Marketing / RM",
    category="Batch Operational Workflow"
)

pipeline = load_champion_pipeline()
metadata = load_metadata()
threshold = metadata.get('optimal_decision_threshold', 0.45)

if pipeline is None:
    st.error("Không thể nạp mô hình. Vui lòng kiểm tra thư mục models/.")
    st.stop()

# Data Source Selection
st.markdown("#### 📁 1. Chọn Nguồn Dữ Liệu Để Chấm Điểm")

data_source = st.radio(
    "Lựa chọn tập dữ liệu đầu vào:",
    [
        "🏦 Sử dụng Toàn bộ Cơ sở Dữ liệu Khách hàng Hiện tại (10,000 hồ sơ)",
        "📤 Tải lên Tệp Dữ liệu CSV Tùy chỉnh (Upload Custom CSV)"
    ],
    horizontal=True
)

if data_source.startswith("🏦"):
    raw_data = load_full_dataset()
    st.markdown(f"""
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin: 10px 0; color: #166534; font-size: 0.9rem;">
        ✅ <b>Đã nạp sẵn danh mục toàn ngân hàng:</b> {len(raw_data):,} khách hàng cá nhân tại Pháp, Đức, Tây Ban Nha.
    </div>
    """, unsafe_allow_html=True)
else:
    up_c1, up_c2 = st.columns([2, 1])
    with up_c1:
        uploaded_file = st.file_uploader("Kéo và thả file CSV khách hàng vào đây:", type=["csv"])
    with up_c2:
        # Provide sample template download
        sample_df = load_full_dataset().head(20).drop(columns=['Exited', 'Surname_Encoding_Issue', 'age_groups', 'Balance_Binned_5', 'IsZeroBalance', 'Balance_To_Salary_Ratio', 'Products_Per_Tenure', 'Product_Holding_Risk_Tier', 'Engagement_Score'], errors='ignore')
        st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)
        st.download_button(
            label="📥 Tải Tệp CSV Mẫu (Template 20 Dòng)",
            data=sample_df.to_csv(index=False).encode('utf-8'),
            file_name="mau_du_lieu_khach_hang_eurovanguard.csv",
            mime="text/csv"
        )

    if uploaded_file is not None:
        try:
            raw_data = pd.read_csv(uploaded_file)
            st.success(f"Đã tải lên thành công: **{len(raw_data):,} dòng**.")
        except Exception as e:
            st.error(f"Lỗi đọc file CSV: {e}")
            st.stop()
    else:
        st.info("Vui lòng tải lên file CSV hoặc chuyển sang tùy chọn nạp dữ liệu có sẵn ở trên.")
        st.stop()

# Scoring execution
with st.spinner("Đang thực hiện chấm điểm Machine Learning và phân loại nghiệp vụ..."):
    scored_df = predict_batch(pipeline, raw_data, threshold=threshold, enforce_complain_rule=True)
    scored_df = assign_four_quadrants(scored_df, risk_threshold=threshold, high_value_threshold=80000.0)

    # Attach NBA recommendation text
    if 'Recommended_Strategy' not in scored_df.columns:
        scored_df['Recommended_Strategy'] = scored_df.apply(
            lambda row: recommend_next_best_action(row)['strategy_name'], axis=1
        )

st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)

# High-level KPIs of Scored Batch
st.markdown("#### 📊 2. Tổng Quan Kết Quả Chấm Điểm Toàn Danh Mục")
tot_scored = len(scored_df)
tot_high_risk = (scored_df['Predicted_Probability'] >= threshold).sum()
high_risk_bal = scored_df[scored_df['Predicted_Probability'] >= threshold]['Balance'].sum()
q1_count = (scored_df['Quadrant'] == 'Q1_VIP_At_Risk').sum()
q1_bal = scored_df[scored_df['Quadrant'] == 'Q1_VIP_At_Risk']['Balance'].sum()

k1, k2, k3, k4 = st.columns(4)
with k1:
    render_stat_card(
        title="Tổng Số Hồ Sơ Đã Chấm",
        value=f"{tot_scored:,}",
        delta="100% Hồ sơ hợp lệ",
        delta_type="info",
        icon="📋"
    )
with k2:
    render_stat_card(
        title="Khách Hàng Nguy Cơ Cao",
        value=f"{tot_high_risk:,}",
        delta=f"▼ {tot_high_risk/tot_scored*100:.1f}% toàn danh mục",
        delta_type="danger",
        icon="🚨"
    )
with k3:
    render_stat_card(
        title="Tiền Gửi Rủi Ro (At-Risk)",
        value=f"{high_risk_bal/1e6:.2f}M €",
        delta="Cần bảo vệ khẩn cấp",
        delta_type="danger",
        icon="💰"
    )
with k4:
    render_stat_card(
        title="Tâm Điểm Q1 (VIP At-Risk)",
        value=f"{q1_count:,} KH",
        delta=f"▲ {q1_bal/1e6:.1f}M € tiền gửi",
        delta_type="danger",
        icon="💎"
    )

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# Filtering Controls
st.markdown("#### 🔍 3. Bộ Lọc & Phân Tuyến Tiếp Cận (Target Prioritization)")

f_col1, f_col2, f_col3 = st.columns(3)
with f_col1:
    quadrant_filter = st.multiselect(
        "Phân khúc 4 Góc phần tư (Quadrant):",
        ['Q1_VIP_At_Risk', 'Q2_Standard_At_Risk', 'Q3_VIP_Loyal', 'Q4_Standard_Loyal'],
        default=['Q1_VIP_At_Risk', 'Q2_Standard_At_Risk']
    )
with f_col2:
    risk_tier_filter = st.multiselect(
        "Cấp độ Rủi ro (Risk Tier):",
        ['CRITICAL_RISK', 'HIGH_RISK', 'MODERATE_RISK', 'LOW_RISK'],
        default=['CRITICAL_RISK', 'HIGH_RISK']
    )
with f_col3:
    geo_filter = st.multiselect(
        "Thị trường Quốc gia:",
        list(scored_df['Geography'].unique()),
        default=list(scored_df['Geography'].unique())
    )

# Apply filters
view_df = scored_df.copy()
if quadrant_filter:
    view_df = view_df[view_df['Quadrant'].isin(quadrant_filter)]
if risk_tier_filter:
    view_df = view_df[view_df['Risk_Tier'].isin(risk_tier_filter)]
if geo_filter:
    view_df = view_df[view_df['Geography'].isin(geo_filter)]

view_df = view_df.sort_values(by='Predicted_Probability', ascending=False)

st.markdown(f"""
<div style="margin: 10px 0; color: #475569; font-size: 0.9rem;">
    Đang hiển thị <b>{len(view_df):,}</b> khách hàng thỏa mãn tiêu chí lọc ưu tiên tiếp cận.
</div>
""", unsafe_allow_html=True)

# Display table
cols_to_show = [
    'CustomerId', 'Surname', 'Geography', 'Gender', 'Age', 'Balance',
    'NumOfProducts', 'IsActiveMember', 'Complain', 'Predicted_Probability',
    'Risk_Tier', 'Quadrant', 'Recommended_Strategy'
]
cols_available = [c for c in cols_to_show if c in view_df.columns]

st.dataframe(
    view_df[cols_available].style.format({
        'Balance': '{:,.2f} €',
        'Predicted_Probability': '{:.1%}'
    }),
    use_container_width=True,
    height=380
)

st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)

# Export / Download Button
csv_export = view_df[cols_available].to_csv(index=False).encode('utf-8-sig')
st.download_button(
    label="📥 Tải Về Danh Sách Tiếp Cận Ưu Tiên (Call-List CSV Cho RM & CSKH)",
    data=csv_export,
    file_name="eurovanguard_retention_call_list.csv",
    mime="text/csv",
    type="primary"
)
st.caption("Tệp CSV được đóng gói định dạng chuẩn UTF-8-BOM tương thích 100% với Microsoft Excel, hệ thống CRM và tổng đài tự động.")
