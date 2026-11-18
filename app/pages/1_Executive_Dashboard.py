"""
Executive Dashboard Page for EuroVanguard Bank.
Visualizes descriptive and diagnostic analytics KPIs, cross-country outflows, and Balance-at-Risk.
Roleplay: EuroVanguard Bank (France, Germany, Spain).
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

from app.ui_theme import (
    apply_theme,
    render_sidebar_brand,
    render_page_header,
    render_stat_card,
    get_plotly_theme
)
from app.utils import load_full_dataset

st.set_page_config(page_title="Executive Dashboard - EuroVanguard", page_icon="📈", layout="wide")

apply_theme()
render_sidebar_brand()

render_page_header(
    title="BÁO CÁO QUẢN TRỊ ĐIỀU HÀNH (EXECUTIVE DASHBOARD)",
    subtitle="Tổng quan Hiện trạng Danh mục, Chẩn đoán Thất thoát Vốn và Tâm chấn Rủi ro 3 Quốc gia",
    badge="DESCRIPTIVE & DIAGNOSTIC ANALYTICS"
)

df_full = load_full_dataset()

# Sidebar Filters
st.sidebar.markdown("### 🔍 Bộ Lọc Phân Tích Tác Nghiệp")

geo_options = ['Tất cả'] + list(df_full['Geography'].unique())
selected_geo = st.sidebar.selectbox("Thị trường Quốc gia:", geo_options)

gender_options = ['Tất cả'] + list(df_full['Gender'].unique())
selected_gender = st.sidebar.selectbox("Giới tính:", gender_options)

card_options = ['Tất cả'] + list(df_full['Card_Type'].unique())
selected_card = st.sidebar.selectbox("Hạng Thẻ (Card Type):", card_options)

active_options = ['Tất cả', 'Đang hoạt động (1)', 'Không hoạt động (0)']
selected_active = st.sidebar.selectbox("Trạng thái Tương tác:", active_options)

# Filter logic
filtered_df = df_full.copy()
if selected_geo != 'Tất cả':
    filtered_df = filtered_df[filtered_df['Geography'] == selected_geo]
if selected_gender != 'Tất cả':
    filtered_df = filtered_df[filtered_df['Gender'] == selected_gender]
if selected_card != 'Tất cả':
    filtered_df = filtered_df[filtered_df['Card_Type'] == selected_card]
if selected_active == 'Đang hoạt động (1)':
    filtered_df = filtered_df[filtered_df['IsActiveMember'] == 1]
elif selected_active == 'Không hoạt động (0)':
    filtered_df = filtered_df[filtered_df['IsActiveMember'] == 0]

# Metrics Row
f_total = len(filtered_df)
f_churners = filtered_df['Exited'].sum()
f_churn_rate = (f_churners / f_total * 100) if f_total > 0 else 0.0
f_tot_bal = filtered_df['Balance'].sum()
f_churn_bal = filtered_df[filtered_df['Exited'] == 1]['Balance'].sum()
f_bal_rate = (f_churn_bal / f_tot_bal * 100) if f_tot_bal > 0 else 0.0

st.markdown("#### 📌 Các Chỉ Số Trọng Yếu Theo Bộ Lọc Đang Chọn")
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_stat_card(
        title="Quy Mô Nhóm Khách Hàng",
        value=f"{f_total:,}",
        delta=f"{(f_total/len(df_full))*100:.1f}% toàn ngân hàng",
        delta_type="info",
        icon="👥"
    )
with c2:
    render_stat_card(
        title="Tỷ Lệ Churn Đầu Người",
        value=f"{f_churn_rate:.2f}%",
        delta=f"▼ {f_churners:,} khách rời bỏ",
        delta_type="danger" if f_churn_rate > 20 else "success",
        icon="📉"
    )
with c3:
    render_stat_card(
        title="Tổng Tiền Gửi Đang Quản Lý",
        value=f"{f_tot_bal/1e6:.2f}M €",
        delta="Nguồn vốn huy động",
        delta_type="neutral",
        icon="💳"
    )
with c4:
    render_stat_card(
        title="Tiền Gửi Bị Thất Thoát",
        value=f"{f_churn_bal/1e6:.2f}M €",
        delta=f"▲ {f_bal_rate:.1f}% tổng vốn nhóm này",
        delta_type="danger" if f_bal_rate > 20 else "success",
        icon="🚨"
    )

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# Visual Dashboard Tabs
dash_tab1, dash_tab2, dash_tab3 = st.tabs([
    "🌍 1. Thị Trường & Tâm Chấn Quốc Gia",
    "📦 2. Sản Phẩm & Hành Vi Khách Hàng",
    "📋 3. Ma Trận Dữ Liệu & Xuất Báo Cáo"
])

theme_layout = get_plotly_theme()

with dash_tab1:
    r1_c1, r1_c2 = st.columns(2)
    with r1_c1:
        st.markdown("##### 📍 Đối Chiếu Tỷ Lệ Churn (%) và Tiền Gửi Mất (Triệu EUR)")
        geo_stat = df_full.groupby('Geography').agg(
            Total_Cust=('CustomerId', 'count'),
            Churn_Rate=('Exited', lambda x: x.mean() * 100),
            Total_Bal_M=('Balance', lambda x: x.sum() / 1e6),
            Lost_Bal_M=('Balance', lambda x: x[df_full.loc[x.index, 'Exited'] == 1].sum() / 1e6)
        ).reset_index()

        fig_geo = go.Figure()
        fig_geo.add_trace(go.Bar(
            x=geo_stat['Geography'], y=geo_stat['Churn_Rate'],
            name='Tỷ lệ Churn (%)', marker_color='#ef4444', yaxis='y1'
        ))
        fig_geo.add_trace(go.Scatter(
            x=geo_stat['Geography'], y=geo_stat['Lost_Bal_M'],
            name='Tiền gửi Mất (M EUR)', marker_color='#2563eb', yaxis='y2', mode='lines+markers+text',
            text=[f"{v:.1f}M €" for v in geo_stat['Lost_Bal_M']], textposition="top center",
            line=dict(width=3)
        ))
        fig_geo.update_layout(
            theme_layout,
            yaxis=dict(title="Tỷ lệ Rời bỏ Churn (%)", gridcolor="#f1f5f9"),
            yaxis2=dict(title="Tiền gửi Mất (Triệu EUR)", overlaying='y', side='right'),
            legend=dict(x=0.02, y=0.98, bgcolor="rgba(255,255,255,0.8)"),
            height=370
        )
        st.plotly_chart(fig_geo, use_container_width=True)

    with r1_c2:
        st.markdown("##### 🗺️ Bản Đồ Nhiệt Thất Thoát Vốn (Quốc Gia × Hạng Thẻ)")
        heat_data = df_full[df_full['Exited'] == 1].pivot_table(
            index='Geography', columns='Card_Type', values='Balance',
            aggfunc=lambda x: round(x.sum() / 1e6, 2), fill_value=0.0
        )
        fig_heat = px.imshow(
            heat_data, text_auto=True, color_continuous_scale='Reds',
            labels=dict(color="Triệu EUR")
        )
        fig_heat.update_layout(theme_layout, height=370)
        st.plotly_chart(fig_heat, use_container_width=True)

    st.markdown("""
    <div class="action-box">
        <h5 style="margin: 0 0 8px 0; color: #1e3a8a;">⚡ Insight Trọng Yếu Về Thị Trường:</h5>
        <b>Đức là tâm chấn rủi ro:</b> Tỷ lệ rời bỏ tại Đức lên tới <b>32.44%</b> (gấp đôi Pháp 16.17% và Tây Ban Nha 16.67%). 
        Đặc biệt, 100% khách hàng Đức đều có số dư dương (trung bình 119,730 EUR), khiến ngân hàng bị rút ròng tới <b>97.97M EUR</b> 
        (chiếm tới <b>52.76%</b> tổng số tiền gửi bị mất trên toàn hệ thống).
    </div>
    """, unsafe_allow_html=True)

with dash_tab2:
    r2_c1, r2_c2 = st.columns(2)
    with r2_c1:
        st.markdown("##### ⚠️ Bẫy Bán Chéo: Đường Cong Chữ U Ngược ở Số Lượng Sản Phẩm")
        prod_stat = df_full.groupby('NumOfProducts').agg(
            Total_Cust=('CustomerId', 'count'),
            Churn_Rate=('Exited', lambda x: x.mean() * 100)
        ).reset_index()

        colors_prod = ['#f59e0b', '#10b981', '#ef4444', '#dc2626']
        fig_prod = px.bar(
            prod_stat, x='NumOfProducts', y='Churn_Rate',
            text=[f"{r:.1f}% ({c:,} KH)" for r, c in zip(prod_stat['Churn_Rate'], prod_stat['Total_Cust'])],
            color='NumOfProducts',
            color_discrete_sequence=colors_prod
        )
        fig_prod.update_layout(
            theme_layout,
            xaxis=dict(tickmode='linear', tick0=1, dtick=1, title="Số lượng Sản phẩm Sở hữu"),
            yaxis=dict(title="Tỷ lệ Rời bỏ Churn (%)"),
            showlegend=False,
            height=370
        )
        fig_prod.update_traces(textposition='outside')
        st.plotly_chart(fig_prod, use_container_width=True)

    with r2_c2:
        st.markdown("##### 👥 Rủi Ro Theo Nhóm Tuổi & Trạng Thái Tương Tác")
        age_stat = df_full.groupby(['Age_Lifecycle_Stage', 'IsActiveMember'])['Exited'].mean().reset_index()
        age_stat['Churn_Pct'] = age_stat['Exited'] * 100
        age_stat['Trạng thái'] = age_stat['IsActiveMember'].map({1: 'Đang hoạt động', 0: 'Bất hoạt'})

        fig_age = px.bar(
            age_stat, x='Age_Lifecycle_Stage', y='Churn_Pct', color='Trạng thái',
            barmode='group',
            category_orders={'Age_Lifecycle_Stage': ['<30', '30-40', '41-50', '51-60', '>60']},
            color_discrete_map={'Đang hoạt động': '#10b981', 'Bất hoạt': '#ef4444'}
        )
        fig_age.update_layout(
            theme_layout,
            xaxis=dict(title="Nhóm Tuổi Vòng Đời"),
            yaxis=dict(title="Tỷ lệ Rời bỏ Churn (%)"),
            legend=dict(x=0.02, y=0.98, bgcolor="rgba(255,255,255,0.8)"),
            height=370
        )
        st.plotly_chart(fig_age, use_container_width=True)

    st.markdown("""
    <div class="action-box">
        <h5 style="margin: 0 0 8px 0; color: #1e3a8a;">⚡ Insight Trọng Yếu Về Sản Phẩm & Khách Hàng:</h5>
        <b>Khách dùng 2 sản phẩm là tối ưu nhất:</b> Churn chỉ <b>7.60%</b>. Khi ngân hàng cố ép bán lên 3 hoặc 4 sản phẩm, 
        tỷ lệ rời bỏ vọt lên <b>82.71%</b> và <b>100.0%</b> do sự phức tạp và trải nghiệm kém.<br>
        <b>Khách hàng tuổi trung niên 45–60:</b> Là nhóm giữ lượng tiền gửi tiết kiệm lớn nhất nhưng tỷ lệ rời bỏ lên tới <b>49.45%</b> 
        nếu không tương tác tích cực.
    </div>
    """, unsafe_allow_html=True)

with dash_tab3:
    st.markdown("##### 📊 Bảng Thống Kê Chi Tiết Danh Mục Lọc")
    summary_cols = ['CustomerId', 'Surname', 'Geography', 'Gender', 'Age', 'Tenure', 'Balance', 'NumOfProducts', 'IsActiveMember', 'Exited']
    st.dataframe(filtered_df[summary_cols].head(100), use_container_width=True, height=350)
    
    csv_bytes = filtered_df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Tải Xuống Dữ Liệu Bộ Lọc Hiện Tại (CSV)",
        data=csv_bytes,
        file_name=f"eurovanguard_filtered_{selected_geo}_{selected_gender}.csv",
        mime="text/csv"
    )
