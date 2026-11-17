"""
Executive Dashboard Page for EuroVanguard Bank.
Visualizes descriptive and diagnostic analytics KPIs, cross-country outflows, and Balance-at-Risk.
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

from app.utils import load_full_dataset

st.set_page_config(page_title="Executive Dashboard - EuroVanguard", page_icon="📈", layout="wide")

st.title("📈 Báo Cáo Quản Trị Điều Hành (Executive Dashboard)")
st.caption("Tổng quan Hiện trạng Khách hàng, Chẩn đoán Thất thoát Vốn và Tâm chấn Rủi ro Thị trường")

df_full = load_full_dataset()

# Sidebar Filters
st.sidebar.header("🔍 Bộ Lọc Dữ Liệu Tác Nghiệp")

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

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Quy mô Phân khúc Lọc", f"{f_total:,} khách")
with col2:
    st.metric("Tỷ lệ Rời bỏ Đầu người", f"{f_churn_rate:.2f}%", f"{f_churners:,} khách rời bỏ", delta_color="inverse")
with col3:
    st.metric("Tổng Vốn Tiền gửi", f"{f_tot_bal/1e6:.2f}M EUR")
with col4:
    st.metric("Tiền gửi Bị Thất thoát", f"{f_churn_bal/1e6:.2f}M EUR", f"{f_bal_rate:.1f}% tổng vốn lọc", delta_color="inverse")

st.divider()

# Charts Row 1: Geography & Product Holding
r1_c1, r1_c2 = st.columns(2)

with r1_c1:
    st.subheader("1. Tâm chấn Quốc gia: So sánh Tỷ lệ Churn & Thất thoát Tiền gửi")
    geo_stat = df_full.groupby('Geography').agg(
        Total_Cust=('CustomerId', 'count'),
        Churn_Rate=('Exited', lambda x: x.mean() * 100),
        Total_Bal_M=('Balance', lambda x: x.sum() / 1e6),
        Lost_Bal_M=('Balance', lambda x: x[df_full.loc[x.index, 'Exited'] == 1].sum() / 1e6)
    ).reset_index()

    fig_geo = go.Figure()
    fig_geo.add_trace(go.Bar(
        x=geo_stat['Geography'], y=geo_stat['Churn_Rate'],
        name='Tỷ lệ Churn (%)', marker_color='#d9534f', yaxis='y1'
    ))
    fig_geo.add_trace(go.Scatter(
        x=geo_stat['Geography'], y=geo_stat['Lost_Bal_M'],
        name='Tiền gửi Mất (M EUR)', marker_color='#2a5298', yaxis='y2', mode='lines+markers+text',
        text=[f"{v:.1f}M" for v in geo_stat['Lost_Bal_M']], textposition="top center"
    ))
    fig_geo.update_layout(
        title="Đối chiếu Tỷ lệ Churn (%) và Khối lượng Vốn Thất thoát (M EUR) theo Thị trường",
        yaxis=dict(title="Tỷ lệ Rời bỏ Churn (%)"),
        yaxis2=dict(title="Tiền gửi Mất (Triệu EUR)", overlaying='y', side='right'),
        legend=dict(x=0.01, y=0.99),
        template='ggplot2', height=380
    )
    st.plotly_chart(fig_geo, use_container_width=True)

with r1_c2:
    st.subheader("2. Bẫy Bán chéo: Đường cong Chữ U ngược ở Số lượng Sản phẩm")
    prod_stat = df_full.groupby('NumOfProducts').agg(
        Total_Cust=('CustomerId', 'count'),
        Churn_Rate=('Exited', lambda x: x.mean() * 100)
    ).reset_index()

    colors_prod = ['#f0ad4e', '#5cb85c', '#d9534f', '#d9534f']
    fig_prod = px.bar(
        prod_stat, x='NumOfProducts', y='Churn_Rate',
        text=[f"{r:.1f}% ({c:,} khách)" for r, c in zip(prod_stat['Churn_Rate'], prod_stat['Total_Cust'])],
        title="Tỷ lệ Rời bỏ theo Số lượng Sản phẩm Sở hữu (NumOfProducts)",
        color='NumOfProducts',
        color_discrete_sequence=colors_prod,
        template='ggplot2', height=380
    )
    fig_prod.update_layout(xaxis=dict(tickmode='linear', tick0=1, dtick=1), showlegend=False)
    fig_prod.update_traces(textposition='outside')
    st.plotly_chart(fig_prod, use_container_width=True)

# Charts Row 2: Heatmap Balance at Risk & Age Distribution
r2_c1, r2_c2 = st.columns(2)

with r2_c1:
    st.subheader("3. Bản đồ Nhiệt Dòng tiền Thất thoát (Quốc gia × Hạng Thẻ)")
    heat_data = df_full[df_full['Exited'] == 1].pivot_table(
        index='Geography', columns='Card_Type', values='Balance',
        aggfunc=lambda x: round(x.sum() / 1e6, 2), fill_value=0.0
    )
    fig_heat = px.imshow(
        heat_data, text_auto=True, color_continuous_scale='Reds',
        title="Tiền gửi Bị Rút (Triệu EUR) theo Thị trường x Hạng Thẻ Tín dụng",
        labels=dict(color="Triệu EUR"), template='ggplot2', height=380
    )
    st.plotly_chart(fig_heat, use_container_width=True)

with r2_c2:
    st.subheader("4. Rủi ro theo Vòng đời Khách hàng: Độ tuổi & Hoạt động")
    age_stat = df_full.groupby(['Age_Lifecycle_Stage', 'IsActiveMember'])['Exited'].mean().reset_index()
    age_stat['Churn_Pct'] = age_stat['Exited'] * 100
    age_stat['Trạng thái'] = age_stat['IsActiveMember'].map({1: 'Đang hoạt động', 0: 'Bất hoạt'})

    fig_age = px.bar(
        age_stat, x='Age_Lifecycle_Stage', y='Churn_Pct', color='Trạng thái',
        barmode='group',
        category_orders={'Age_Lifecycle_Stage': ['<30', '30-40', '41-50', '51-60', '>60']},
        color_discrete_map={'Đang hoạt động': '#5cb85c', 'Bất hoạt': '#d9534f'},
        title="Tỷ lệ Rời bỏ theo Giai đoạn Vòng đời Tuổi x Trạng thái Tương tác",
        template='ggplot2', height=380
    )
    st.plotly_chart(fig_age, use_container_width=True)

# Executive Insight Alert Box
st.info("""
**📌 Khuyến nghị Điều hành Cấp thiết cho Ban Giám đốc:**
1. **Thị trường Đức là ưu tiên số 1:** Với tỷ lệ rời bỏ 32.44% và thất thoát 97.97M EUR (hơn 50% toàn ngân hàng), cần thiết lập gói lãi suất tiền gửi cạnh tranh linh hoạt ngay tại các chi nhánh Berlin và Frankfurt.
2. **Ngừng chính sách ép bán chéo sản phẩm thứ 3 và 4:** Tỷ lệ rời bỏ ở nhóm 3 sản phẩm là 82.7% và 4 sản phẩm là 100%. Tối ưu hóa danh mục về Combo 2 sản phẩm mang lại tỷ lệ giữ chân tốt nhất (92.4%).
3. **Chăm sóc nhóm khách hàng 45-60 tuổi:** Đây là nhóm tuổi có số dư cao nhất nhưng tỷ lệ rời bỏ vượt trên 40%.
""")
