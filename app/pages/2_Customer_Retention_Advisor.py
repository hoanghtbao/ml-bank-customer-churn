"""
Customer Retention Advisor Page (1-on-1 Advisory & Decision Support).
Features real-time scoring, Hard Business Rule check, SHAP top drivers,
Next-Best-Action recommendation, dynamic Vietnamese call scripts, and What-If simulation.
Roleplay: EuroVanguard Bank.
"""

import os
import sys
import streamlit as st
import pandas as pd
import numpy as np
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
from app.utils import (
    load_champion_pipeline,
    load_metadata,
    predict_customer,
    recommend_next_best_action,
    generate_call_script
)

st.set_page_config(page_title="Retention Advisor - EuroVanguard", page_icon="👤", layout="wide")

apply_theme()
render_sidebar_brand()

render_page_header(
    title="TƯ VẤN GIỮ CHÂN KHÁCH HÀNG CÁ NHÂN (RETENTION ADVISOR)",
    subtitle="Chấm Điểm Rủi Ro Thời Gian Thực, Khuyến Nghị Next-Best-Action & Trợ Lý Tạo Kịch Bản Cuộc Gọi RM",
    badge="1-ON-1 DECISION SUPPORT SYSTEM"
)

pipeline = load_champion_pipeline()
metadata = load_metadata()
threshold = metadata.get('optimal_decision_threshold', 0.45)

if pipeline is None:
    st.error("Không thể nạp mô hình Machine Learning. Vui lòng kiểm tra thư mục models/.")
    st.stop()

# Preset Customer Personas
PRESET_PERSONAS = {
    "Tự nhập thông tin tùy chỉnh": None,
    "🇩🇪 Hồ sơ 1: VIP Đức có Số dư Lớn (German Wealth Outflow)": {
        'CustomerId': 15700001, 'Surname': 'Müller', 'Gender': 'Male',
        'Geography': 'Germany', 'Age': 52, 'Tenure': 5, 'Balance': 145000.0,
        'NumOfProducts': 1, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 120000.0, 'Satisfaction_Score': 3,
        'Card_Type': 'DIAMOND', 'Point_Earned': 650, 'CreditScore': 680, 'Complain': 0
    },
    "🇫🇷 Hồ sơ 2: Bẫy Bán chéo Sản phẩm Quá mức (Over-bundled Trap)": {
        'CustomerId': 15700002, 'Surname': 'Dubois', 'Gender': 'Female',
        'Geography': 'France', 'Age': 46, 'Tenure': 3, 'Balance': 75000.0,
        'NumOfProducts': 4, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 85000.0, 'Satisfaction_Score': 2,
        'Card_Type': 'GOLD', 'Point_Earned': 450, 'CreditScore': 610, 'Complain': 0
    },
    "🚨 Hồ sơ 3: Khiếu nại Mở Khẩn cấp (Emergency Open Complaint)": {
        'CustomerId': 15700003, 'Surname': 'Schneider', 'Gender': 'Male',
        'Geography': 'Germany', 'Age': 44, 'Tenure': 4, 'Balance': 98000.0,
        'NumOfProducts': 2, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 95000.0, 'Satisfaction_Score': 1,
        'Card_Type': 'PLATINUM', 'Point_Earned': 520, 'CreditScore': 650, 'Complain': 1
    },
    "🏆 Hồ sơ 4: Khách hàng Trung thành Điển hình (Optimal Loyal Customer)": {
        'CustomerId': 15700004, 'Surname': 'Martin', 'Gender': 'Female',
        'Geography': 'France', 'Age': 34, 'Tenure': 6, 'Balance': 45000.0,
        'NumOfProducts': 2, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 60000.0, 'Satisfaction_Score': 4,
        'Card_Type': 'SILVER', 'Point_Earned': 780, 'CreditScore': 720, 'Complain': 0
    }
}

st.markdown("#### 🎯 Chọn Hồ Sơ Mẫu Nghiệp Vụ Hoặc Tự Nhập")
selected_persona = st.selectbox(
    "Nạp nhanh các trường hợp điển hình đã được kiểm chứng:",
    list(PRESET_PERSONAS.keys())
)
preset_data = PRESET_PERSONAS[selected_persona]

# Customer Input Form
st.markdown("#### 📝 Thông Tin Hồ Sơ Khách Hàng")
with st.form("customer_input_form"):
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        surname = st.text_input("Họ tên Khách hàng:", value=preset_data['Surname'] if preset_data else "Dupont")
        gender = st.selectbox("Giới tính:", ['Male', 'Female'], index=0 if (preset_data and preset_data['Gender'] == 'Male') else 1)
        geography = st.selectbox("Thị trường Quốc gia:", ['France', 'Germany', 'Spain'], index=['France', 'Germany', 'Spain'].index(preset_data['Geography']) if preset_data else 0)
        age = st.number_input("Độ tuổi (Age):", min_value=18, max_value=100, value=preset_data['Age'] if preset_data else 45)

    with c2:
        tenure = st.number_input("Thời gian gắn bó (Năm):", min_value=0, max_value=10, value=preset_data['Tenure'] if preset_data else 4)
        balance = st.number_input("Số dư Tiền gửi (EUR):", min_value=0.0, max_value=500000.0, step=1000.0, value=preset_data['Balance'] if preset_data else 85000.0)
        num_products = st.selectbox("Số Sản phẩm đang dùng:", [1, 2, 3, 4], index=[1, 2, 3, 4].index(preset_data['NumOfProducts']) if preset_data else 1)
        credit_score = st.number_input("Điểm Tín dụng (CreditScore):", min_value=350, max_value=850, value=preset_data['CreditScore'] if preset_data else 650)

    with c3:
        has_cr_card = st.selectbox("Có Thẻ tín dụng:", [1, 0], format_func=lambda x: "Có Thẻ (1)" if x == 1 else "Không có (0)", index=0 if (preset_data and preset_data['HasCrCard'] == 1) else 1)
        is_active = st.selectbox("Trạng thái Tương tác:", [1, 0], format_func=lambda x: "Đang hoạt động (1)" if x == 1 else "Bất hoạt (0)", index=0 if (preset_data and preset_data['IsActiveMember'] == 1) else 1)
        salary = st.number_input("Thu nhập ước tính (EUR/năm):", min_value=0.0, max_value=500000.0, step=5000.0, value=preset_data['EstimatedSalary'] if preset_data else 75000.0)
        card_type = st.selectbox("Hạng Thẻ Khách hàng:", ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'], index=['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'].index(preset_data['Card_Type']) if preset_data else 0)

    with c4:
        complain = st.selectbox("Có Khiếu nại Mở Chưa Giải quyết:", [0, 1], format_func=lambda x: "KHÔNG (0)" if x == 0 else "🚨 CÓ KHIẾU NẠI (1)", index=1 if (preset_data and preset_data['Complain'] == 1) else 0)
        satisfaction = st.slider("Điểm Hài lòng Khảo sát (1 - 5):", min_value=1, max_value=5, value=preset_data['Satisfaction_Score'] if preset_data else 3)
        points = st.number_input("Điểm Thưởng Tích lũy:", min_value=0, max_value=2000, value=preset_data['Point_Earned'] if preset_data else 500)
        rm_name = st.text_input("Chuyên viên RM Phụ trách:", value="Hoàng Hữu Bảo (Senior RM)")

    submit_button = st.form_submit_button("⚡ Đánh Giá Rủi Ro & Đề Xuất Giữ Chân (Predict & Prescribe)", type="primary", use_container_width=True)

# Process customer dictionary
current_customer = {
    'CustomerId': preset_data['CustomerId'] if preset_data else 15800001,
    'Surname': surname,
    'Gender': gender,
    'Geography': geography,
    'Age': age,
    'Tenure': tenure,
    'Balance': balance,
    'NumOfProducts': num_products,
    'HasCrCard': has_cr_card,
    'IsActiveMember': is_active,
    'EstimatedSalary': salary,
    'CreditScore': credit_score,
    'Card_Type': card_type,
    'Satisfaction_Score': satisfaction,
    'Point_Earned': points,
    'Complain': complain
}

# Run prediction & prescription
prediction_result = predict_customer(pipeline, current_customer, threshold=threshold, enforce_complain_rule=True)
nba_result = recommend_next_best_action(current_customer)

prob = prediction_result['churn_probability']
is_churn = prediction_result['churn_prediction']
risk_tier = prediction_result['risk_tier']
override_flag = prediction_result['rule_override_applied']

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# Results Display Section
st.markdown("### 📋 Phiếu Đánh Giá Rủi Ro & Đề Xuất Quyết Định (Advisory Slip)")

if override_flag:
    st.markdown("""
    <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 18px 24px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2rem;">🚨</span>
            <div>
                <h4 style="margin: 0; color: #991b1b; font-weight: 800;">KÍCH HOẠT QUY TRÌNH KHẨN CẤP SLA 4-HOUR ESCALATION!</h4>
                <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 0.95rem;">
                    <b>Quy tắc kinh doanh cứng (Hard Business Rule):</b> Khách hàng đang có khiếu nại mở chưa giải quyết. 
                    Dữ liệu lịch sử chứng minh <b>99.86%</b> khách hàng khiếu nại sẽ rời bỏ ngân hàng. 
                    Hồ sơ này được chuyển thẳng tới Trưởng phòng CSKH Chi nhánh để gọi điện can thiệp trong vòng 4 giờ!
                </p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

res_c1, res_c2, res_c3 = st.columns([1.1, 1.1, 1.8])

with res_c1:
    fig_gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=prob * 100,
        number={'suffix': "%", 'font': {'size': 32, 'family': "Plus Jakarta Sans"}},
        title={'text': "Xác Suất Rời Bỏ P(Churn)", 'font': {'size': 14, 'color': "#475569"}},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#94a3b8"},
            'bar': {'color': "#ef4444" if prob >= threshold else "#10b981"},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "#e2e8f0",
            'steps': [
                {'range': [0, 25], 'color': '#dcfce7'},
                {'range': [25, 45], 'color': '#fef3c7'},
                {'range': [45, 100], 'color': '#fee2e2'}
            ],
            'threshold': {
                'line': {'color': "#1e3a8a", 'width': 3},
                'thickness': 0.75,
                'value': threshold * 100
            }
        }
    ))
    fig_gauge.update_layout(height=230, margin=dict(l=20, r=20, t=30, b=10))
    st.plotly_chart(fig_gauge, use_container_width=True)

with res_c2:
    tier_badges = {
        'CRITICAL_RISK': ('badge-danger', '🚨 CỰC KỲ NGUY HIỂM'),
        'HIGH_RISK': ('badge-warning', '⚠️ NGUY CƠ CAO (VƯỢT T*)'),
        'MODERATE_RISK': ('badge-info', 'ℹ️ NGUY CƠ TRUNG BÌNH'),
        'LOW_RISK': ('badge-success', '✅ AN TOÀN (LOYAL)')
    }
    badge_class, badge_label = tier_badges.get(risk_tier, ('badge-info', risk_tier))

    # Calculate customer annual value & break-even threshold
    nim = 0.025
    fee = 120.0
    v_annual = (nim * balance) + (fee * num_products)
    c_action = float(nba_result['estimated_cost_eur'])
    p_retain = 0.35 if balance >= 100000 else 0.25
    t_breakeven = c_action / (p_retain * v_annual) if (p_retain * v_annual) > 0 else 1.0

    st.markdown(f"""
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; height: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="margin-bottom: 12px;">
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Phân Tầng Rủi Ro:</span><br>
            <span class="badge-pill {badge_class}" style="font-size: 0.88rem; margin-top: 4px;">{badge_label}</span>
        </div>
        <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
            • <b>Giá trị KH hàng năm (V_annual):</b> {v_annual:,.0f} €<br>
            • <b>Chi phí can thiệp (C_action):</b> {c_action:,.0f} €<br>
            • <b>Ngưỡng hòa vốn lý thuyết (T*):</b> {t_breakeven*100:.1f}%<br>
            • <b>Kỳ vọng lợi ích ròng:</b> <span style="color: {'#16a34a' if prob > t_breakeven else '#dc2626'}; font-weight: 700;">
                {(prob * p_retain * v_annual - c_action):+,.0f} €
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

with res_c3:
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; height: 100%;">
        <div style="font-size: 0.8rem; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
            🎯 CHIẾN LƯỢC CAN THIỆP NEXT-BEST-ACTION (NBA)
        </div>
        <h4 style="margin: 6px 0 10px 0; color: #0f172a; font-weight: 800;">{nba_result['strategy_name']}</h4>
        <p style="margin: 0 0 10px 0; font-size: 0.92rem; color: #334155; line-height: 1.5;">
            {nba_result['recommended_action']}
        </p>
        <div style="display: flex; gap: 15px; font-size: 0.82rem; color: #1e3a8a; font-weight: 600;">
            <span>📞 Kênh: <b>{nba_result['channel']}</b></span>
            <span>💶 Ngân sách: <b>{nba_result['estimated_cost_eur']} EUR</b></span>
            <span>⏱️ SLA: <b>{nba_result.get('sla_hours', '24')} Giờ</b></span>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# Call Script Section
st.markdown("### 💬 Kịch Bản Cuộc Gọi Chăm Sóc Khách Hàng (Frontline Tele-banking Script)")
st.caption("Được tối ưu hóa theo quy chuẩn ứng xử chuyên nghiệp của EuroVanguard Bank, tôn trọng đạo đức AI và bảo vệ quyền riêng tư.")

generated_script = generate_call_script(current_customer, rm_name=rm_name)

st.markdown(f"""
<div class="call-script-box">
    <div class="call-script-title">
        <span>🎧 KỊCH BẢN THOẠI CHUẨN DÀNH CHO RM / CSKH:</span>
    </div>
    <div class="call-script-dialog">
        {generated_script.replace(chr(10), '<br>')}
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<div style='height: 25px;'></div>", unsafe_allow_html=True)

# What-If Sensitivity Simulator
st.markdown("### 🔬 Bộ Mô Phỏng Độ Nhạy Hành Vi (What-If Sensitivity Simulator)")
st.caption("Khảo sát tác động khi thay đổi các biến số hành vi mà ngân hàng có thể can thiệp được (Actionable Features).")

w_col1, w_col2, w_col3 = st.columns(3)
with w_col1:
    sim_active = st.radio("Giả định Tương tác (IsActiveMember):", [1, 0], index=0 if is_active == 1 else 1, format_func=lambda x: "Hoạt động (Active = 1)" if x == 1 else "Bất hoạt (Inactive = 0)")
with w_col2:
    sim_products = st.selectbox("Giả định Số lượng Sản phẩm:", [1, 2, 3, 4], index=[1, 2, 3, 4].index(num_products))
with w_col3:
    sim_balance = st.number_input("Giả định Số dư Tiền gửi (EUR):", min_value=0.0, max_value=500000.0, step=5000.0, value=balance)

sim_customer = current_customer.copy()
sim_customer['IsActiveMember'] = sim_active
sim_customer['NumOfProducts'] = sim_products
sim_customer['Balance'] = sim_balance
sim_customer['Complain'] = 0  # Compare proactive model without complaint override

sim_res = predict_customer(pipeline, sim_customer, threshold=threshold, enforce_complain_rule=False)
sim_prob = sim_res['churn_probability']
delta_p = sim_prob - prob

st.markdown(f"""
<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-top: 10px;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
            <span style="font-size: 0.85rem; color: #64748b; font-weight: 600;">KẾT QUẢ MÔ PHỎNG WHAT-IF:</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: #0f172a;">
                Xác suất Rời bỏ Mới: {sim_prob*100:.1f}% 
                <span style="font-size: 0.95rem; font-weight: 700; color: {'#16a34a' if delta_p < 0 else '#dc2626'};">
                    ({delta_p*100:+.1f}% so với ban đầu)
                </span>
            </div>
        </div>
        <div style="font-size: 0.85rem; color: #475569;">
            {f'✅ <b>Khuyến nghị hiệu quả:</b> Rủi ro giảm rõ rệt!' if delta_p < -0.05 else f'⚠️ Rủi ro tăng hoặc biến động không đáng kể.'}
        </div>
    </div>
</div>
""", unsafe_allow_html=True)
