"""
Prescriptive Strategy and Tiered Financial ROI Simulator Page.
Features 4-quadrant interactive visualization and dynamic real-time ROI simulation.
"""

import os
import sys
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Universal path resolution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.utils import (
    get_pre_scored_data,
    get_quadrant_summary,
    calculate_tiered_roi
)

st.set_page_config(page_title="Prescriptive Strategy & ROI - EuroVanguard", page_icon="💰", layout="wide")

st.title("💰 Chiến Lược Đề Xuất & Mô Hình Tài Chính ROI (Prescriptive & ROI)")
st.caption("Ma trận Phân khúc 4 Góc phần tư (Value × Risk) & Bảng Tính Lợi Nhuận Ròng Thời Gian Thực")

df_quad = get_pre_scored_data()

# 1. Four Quadrants Section
st.subheader("1. Bản Đồ Phân Khúc 4 Góc Phần Tư (Value × Risk Matrix)")

q_sum = get_quadrant_summary(df_quad)

col_map, col_tbl = st.columns([1.2, 1])

with col_map:
    colors_map = {
        'Q1_VIP_At_Risk': '#d9534f',
        'Q2_Standard_At_Risk': '#f0ad4e',
        'Q3_VIP_Loyal': '#0275d8',
        'Q4_Standard_Loyal': '#5cb85c'
    }

    # Sample for smooth scatter rendering
    sample_plot = df_quad.sample(n=min(2500, len(df_quad)), random_state=42)

    fig_quad = px.scatter(
        sample_plot,
        x=sample_plot['Balance'] / 1e3,
        y='Predicted_Probability',
        color='Quadrant',
        color_discrete_map=colors_map,
        labels={'x': 'Số dư Tiền gửi (Nghìn EUR)', 'Predicted_Probability': 'Xác suất Rời bỏ Churn'},
        title="Phân bố Khách hàng: Tiền gửi (Balance) x Xác suất Rời bỏ (Risk)",
        opacity=0.45,
        template='ggplot2',
        height=380
    )
    fig_quad.add_vline(x=80.0, line_dash="dash", line_color="black", annotation_text="Ngưỡng VIP (80k EUR)")
    fig_quad.add_hline(y=0.45, line_dash="dot", line_color="black", annotation_text="Ngưỡng Rủi ro T* (0.45)")
    st.plotly_chart(fig_quad, use_container_width=True)

with col_tbl:
    st.markdown("**Bảng Tổng hợp Chỉ số 4 Góc phần tư:**")
    st.dataframe(
        q_sum[['Quadrant_Code', 'Customer_Count', 'Customer_Pct', 'Total_Balance_M_EUR', 'Balance_Pct', 'Actual_Churn_Pct']],
        use_container_width=True,
        height=340
    )
    st.info("💡 **Q1 (VIP At-Risk)** nắm giữ **31.75% tổng vốn tiền gửi ngân hàng (242.81M EUR)** và có tỷ lệ rời bỏ thực tế lên tới **74.14%**!")

st.divider()

# 2. Tiered Financial ROI Simulator
st.subheader("2. Mô Phỏng Lợi Nhuận Ròng Tài Chính Thời Gian Thực (Tiered ROI Simulator)")
st.caption("Tùy biến các tham số chi phí và tỷ lệ giữ chân thành công để đánh giá hiệu quả kinh tế của chiến dịch")

sim_col1, sim_col2, sim_col3 = st.columns(3)

with sim_col1:
    st.markdown("#### 🎯 Phân khúc Q1: VIP At-Risk")
    vip_cost = st.slider("Chi phí Can thiệp Q1 (EUR/khách):", min_value=50, max_value=500, value=150, step=10, help="Private Banker liên hệ trực tiếp, đàm phán lãi suất đặc quyền, tặng quà tri ân.")
    vip_save = st.slider("Tỷ lệ Giữ chân Thành công Q1 (%):", min_value=10, max_value=80, value=40, step=5, help="Tỷ lệ khách hàng đồng ý ở lại khi được chăm sóc chuyên biệt 1-1.") / 100.0

with sim_col2:
    st.markdown("#### 📱 Phân khúc Q2: Standard At-Risk")
    std_cost = st.slider("Chi phí Can thiệp Q2 (EUR/khách):", min_value=5, max_value=100, value=25, step=5, help="Thông báo App tự động, chiến dịch email, voucher điện tử.")
    std_save = st.slider("Tỷ lệ Giữ chân Thành công Q2 (%):", min_value=5, max_value=60, value=25, step=5, help="Tỷ lệ khách hàng quay lại giao dịch khi nhận ưu đãi số.") / 100.0

with sim_col3:
    st.markdown("#### 🏦 Tham số Biên Lợi nhuận Ngân hàng")
    margin_rate = st.slider("Biên Lợi nhuận trên Tiền gửi (%/năm):", min_value=1.0, max_value=10.0, value=5.0, step=0.5, help="Tỷ suất lợi nhuận ròng ngân hàng tạo ra từ vốn huy động cho vay.") / 100.0
    base_fee = st.number_input("Phí Dịch vụ Cơ sở Hàng năm (EUR/khách):", min_value=50, max_value=1000, value=200, step=50, help="Phí quản lý tài khoản, phí thẻ thường niên.")

# Calculate Live ROI
live_roi = calculate_tiered_roi(
    df_quad,
    vip_cost=vip_cost,
    std_cost=std_cost,
    vip_save_rate=vip_save,
    std_save_rate=std_save,
    margin_rate=margin_rate,
    base_service_fee=base_fee
)

st.divider()

# ROI Results Display
st.subheader("3. Kết Quả Cân Đối Tài Chính Dự Kiến")

m1, m2, m3, m4 = st.columns(4)
with m1:
    st.metric("Tổng Ngân sách Can thiệp", f"{live_roi['Total_Campaign']['total_intervention_cost_eur']:,.0f} EUR")
with m2:
    st.metric("Số Khách hàng Giữ chân Kỳ vọng", f"{live_roi['Total_Campaign']['total_customers_saved']:.0f} khách", f"{live_roi['Total_Campaign']['total_targeted_count']:,} tiếp cận")
with m3:
    st.metric("Vốn Tiền gửi Được Bảo toàn", f"{live_roi['Total_Campaign']['total_deposit_saved_m_eur']:.2f}M EUR")
with m4:
    net_p = live_roi['Total_Campaign']['total_net_profit_eur']
    roi_p = live_roi['Total_Campaign']['total_roi_pct']
    st.metric("Lợi nhuận Ròng Dự kiến (Net Gain)", f"{net_p:,.0f} EUR", f"ROI: {roi_p:.1f}%")

# Comparison Chart: Cost vs Value vs Profit
bar_col1, bar_col2 = st.columns([1.2, 1])

with bar_col1:
    categories = ['Q1: VIP At-Risk', 'Q2: Standard At-Risk', 'Toàn Chiến Dịch']
    cost_vals = [live_roi['Q1_VIP']['intervention_cost_eur']/1e3, live_roi['Q2_Standard']['intervention_cost_eur']/1e3, live_roi['Total_Campaign']['total_intervention_cost_eur']/1e3]
    clv_vals = [live_roi['Q1_VIP']['clv_value_saved_eur']/1e3, live_roi['Q2_Standard']['clv_value_saved_eur']/1e3, live_roi['Total_Campaign']['total_clv_saved_eur']/1e3]
    profit_vals = [live_roi['Q1_VIP']['net_profit_eur']/1e3, live_roi['Q2_Standard']['net_profit_eur']/1e3, live_roi['Total_Campaign']['total_net_profit_eur']/1e3]

    fig_bar = go.Figure(data=[
        go.Bar(name='Chi phí Can thiệp (k EUR)', x=categories, y=cost_vals, marker_color='#d9534f'),
        go.Bar(name='Giá trị CLV Bảo toàn (k EUR)', x=categories, y=clv_vals, marker_color='#5bc0de'),
        go.Bar(name='Lợi nhuận Ròng (k EUR)', x=categories, y=profit_vals, marker_color='#5cb85c')
    ])
    fig_bar.update_layout(barmode='group', title="So sánh Chi phí, Giá trị Bảo toàn và Lợi nhuận Ròng (k EUR)", template='ggplot2', height=360)
    st.plotly_chart(fig_bar, use_container_width=True)

with bar_col2:
    st.markdown("#### 📋 Bảng Chi tiết Hiệu quả Kinh tế:")
    st.table(pd.DataFrame([
        {
            'Phân khúc': 'Q1: VIP At-Risk',
            'Khách tiếp cận': f"{live_roi['Q1_VIP']['targeted_count']:,}",
            'Khách giữ lại': f"{live_roi['Q1_VIP']['expected_customers_saved']:.0f}",
            'Vốn cứu (M EUR)': f"{live_roi['Q1_VIP']['deposit_volume_saved_m_eur']:.2f}M",
            'Net Gain': f"{live_roi['Q1_VIP']['net_profit_eur']:,.0f} EUR",
            'ROI': f"{live_roi['Q1_VIP']['roi_pct']:.1f}%"
        },
        {
            'Phân khúc': 'Q2: Standard At-Risk',
            'Khách tiếp cận': f"{live_roi['Q2_Standard']['targeted_count']:,}",
            'Khách giữ lại': f"{live_roi['Q2_Standard']['expected_customers_saved']:.0f}",
            'Vốn cứu (M EUR)': f"{live_roi['Q2_Standard']['deposit_volume_saved_m_eur']:.2f}M",
            'Net Gain': f"{live_roi['Q2_Standard']['net_profit_eur']:,.0f} EUR",
            'ROI': f"{live_roi['Q2_Standard']['roi_pct']:.1f}%"
        },
        {
            'Phân khúc': 'TOÀN CHIẾN DỊCH',
            'Khách tiếp cận': f"{live_roi['Total_Campaign']['total_targeted_count']:,}",
            'Khách giữ lại': f"{live_roi['Total_Campaign']['total_customers_saved']:.0f}",
            'Vốn cứu (M EUR)': f"{live_roi['Total_Campaign']['total_deposit_saved_m_eur']:.2f}M",
            'Net Gain': f"{live_roi['Total_Campaign']['total_net_profit_eur']:,.0f} EUR",
            'ROI': f"{live_roi['Total_Campaign']['total_roi_pct']:.1f}%"
        }
    ]))
