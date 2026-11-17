"""
Batch Campaign Scoring Page for EuroVanguard Bank.
Allows uploading custom CSV or scoring the existing portfolio, filtering by quadrant/risk,
and downloading prioritized retention campaign target lists.
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

from app.utils import (
    load_champion_pipeline,
    load_metadata,
    load_full_dataset,
    predict_batch,
    assign_four_quadrants,
    recommend_next_best_action
)

st.set_page_config(page_title="Batch Campaign Scoring - EuroVanguard", page_icon="📋", layout="wide")

st.title("📋 Chấm Điểm & Phân Luồng Chiến Dịch Hàng Loạt (Batch Campaign Scoring)")
st.caption("Xử lý Danh sách Khách hàng Số lượng lớn, Phân tầng Rủi ro Tự động, Gắn nhãn Next-Best-Action & Xuất Danh sách Can thiệp")

pipeline = load_champion_pipeline()
metadata = load_metadata()
threshold = metadata.get('optimal_decision_threshold', 0.45)

if pipeline is None:
    st.error("Không thể nạp mô hình. Vui lòng kiểm tra thư mục models/.")
    st.stop()

# Data Source Selection
st.subheader("1. Nguồn Dữ Liệu Chấm Điểm")
data_source = st.radio(
    "Chọn nguồn dữ liệu:",
    ["Sử dụng Toàn bộ Cơ sở Dữ liệu Khách hàng Hiện tại (10,000 hồ sơ)", "Tải lên Tệp Dữ liệu CSV Tùy chỉnh (Upload Custom CSV)"],
    horizontal=True
)

if data_source.startswith("Sử dụng Toàn bộ"):
    raw_data = load_full_dataset()
    st.success(f"Đã nạp sẵn danh mục toàn ngân hàng: **{len(raw_data):,} khách hàng**.")
else:
    uploaded_file = st.file_uploader("Chọn file CSV khách hàng để chấm điểm:", type=["csv"])
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

st.divider()

# High-level KPIs of Scored Batch
st.subheader("2. Tổng Quan Kết Quả Chấm Điểm")
tot_scored = len(scored_df)
tot_high_risk = (scored_df['Predicted_Probability'] >= threshold).sum()
high_risk_bal = scored_df[scored_df['Predicted_Probability'] >= threshold]['Balance'].sum()
q1_count = (scored_df['Quadrant'] == 'Q1_VIP_At_Risk').sum()
q1_bal = scored_df[scored_df['Quadrant'] == 'Q1_VIP_At_Risk']['Balance'].sum()

k1, k2, k3, k4 = st.columns(4)
with k1:
    st.metric("Tổng Số Hồ sơ Đã Chấm", f"{tot_scored:,}")
with k2:
    st.metric("Khách hàng Nguy cơ Cao (>= T*)", f"{tot_high_risk:,}", f"{tot_high_risk/tot_scored*100:.1f}%", delta_color="inverse")
with k3:
    st.metric("Tiền gửi Rủi ro (Balance at Risk)", f"{high_risk_bal/1e6:.2f}M EUR")
with k4:
    st.metric("Tâm điểm Q1: VIP At-Risk", f"{q1_count:,} khách", f"{q1_bal/1e6:.1f}M EUR", delta_color="inverse")

st.divider()

# Filtering Controls
st.subheader("3. Lọc & Ưu Tiên Tiếp Cận Khách Hàng (Prioritization Filter)")

f_col1, f_col2, f_col3 = st.columns(3)
with f_col1:
    quadrant_filter = st.multiselect(
        "Lọc theo Phân khúc 4 Góc phần tư:",
        ['Q1_VIP_At_Risk', 'Q2_Standard_At_Risk', 'Q3_VIP_Loyal', 'Q4_Standard_Loyal'],
        default=['Q1_VIP_At_Risk', 'Q2_Standard_At_Risk']
    )
with f_col2:
    risk_tier_filter = st.multiselect(
        "Lọc theo Cấp độ Rủi ro:",
        ['CRITICAL_RISK', 'HIGH_RISK', 'MODERATE_RISK', 'LOW_RISK'],
        default=['CRITICAL_RISK', 'HIGH_RISK']
    )
with f_col3:
    geo_filter = st.multiselect(
        "Lọc theo Quốc gia:",
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

st.write(f"Đang hiển thị **{len(view_df):,}** khách hàng thỏa mãn tiêu chí lọc.")

# Display table
cols_to_show = [
    'CustomerId', 'Surname', 'Geography', 'Gender', 'Age', 'Balance',
    'NumOfProducts', 'IsActiveMember', 'Complain', 'Predicted_Probability',
    'Risk_Tier', 'Quadrant', 'Recommended_Strategy'
]
cols_available = [c for c in cols_to_show if c in view_df.columns]

st.dataframe(
    view_df[cols_available].style.format({
        'Balance': '{:,.2f} EUR',
        'Predicted_Probability': '{:.1%}'
    }),
    use_container_width=True,
    height=400
)

# Export / Download Button
csv_export = view_df[cols_available].to_csv(index=False).encode('utf-8-sig')
st.download_button(
    label="📥 Tải Về Danh Sách Khách Hàng Ưu Tiên Tiếp Cận (CSV)",
    data=csv_export,
    file_name="danh_sach_uu_tien_can_thiep_eurovanguard.csv",
    mime="text/csv",
    type="primary"
)
st.caption("Tệp CSV xuất ra bao gồm đầy đủ ID, Họ tên, Xác suất Rời bỏ, Phân tầng Rủi ro và Chiến lược Đề xuất Next-Best-Action tương ứng.")
