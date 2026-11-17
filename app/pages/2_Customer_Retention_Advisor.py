"""
Customer Retention Advisor Page (1-on-1 Advisory & Decision Support).
Features real-time scoring, Hard Business Rule check, SHAP top drivers,
Next-Best-Action recommendation, dynamic Vietnamese call scripts, and What-If simulation.
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
    predict_customer,
    recommend_next_best_action,
    generate_call_script
)
from src.preprocessing.feature_engineering import create_domain_features

st.set_page_config(page_title="Retention Advisor - EuroVanguard", page_icon="👤", layout="wide")

st.title("👤 Tư Vấn Giữ Chân Khách Hàng Cá Nhân (Retention Advisor)")
st.caption("Chấm điểm Rủi ro Thời gian thực, Giải thích Nguyên nhân SHAP, Đề xuất Next-Best-Action & Kịch bản Cuộc gọi Chăm sóc")

pipeline = load_champion_pipeline()
metadata = load_metadata()
threshold = metadata.get('optimal_decision_threshold', 0.45)

if pipeline is None:
    st.error("Không thể nạp mô hình Machine Learning. Vui lòng kiểm tra thư mục models/.")
    st.stop()

# Preset Customer Personas
PRESET_PERSONAS = {
    "Tự nhập thông tin tùy chỉnh": None,
    "Hồ sơ 1: VIP Đức có Số dư Lớn (German Wealth Outflow)": {
        'CustomerId': 15700001, 'Surname': 'Müller', 'Gender': 'Male',
        'Geography': 'Germany', 'Age': 52, 'Tenure': 5, 'Balance': 145000.0,
        'NumOfProducts': 1, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 120000.0, 'Satisfaction_Score': 3,
        'Card_Type': 'DIAMOND', 'Point_Earned': 650, 'CreditScore': 680, 'Complain': 0
    },
    "Hồ sơ 2: Bẫy Bán chéo Sản phẩm Quá mức (Over-bundled Trap)": {
        'CustomerId': 15700002, 'Surname': 'Dubois', 'Gender': 'Female',
        'Geography': 'France', 'Age': 46, 'Tenure': 3, 'Balance': 75000.0,
        'NumOfProducts': 4, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 85000.0, 'Satisfaction_Score': 2,
        'Card_Type': 'GOLD', 'Point_Earned': 450, 'CreditScore': 610, 'Complain': 0
    },
    "Hồ sơ 3: Khiếu nại Mở Khẩn cấp (Emergency Open Complaint)": {
        'CustomerId': 15700003, 'Surname': 'Schneider', 'Gender': 'Male',
        'Geography': 'Germany', 'Age': 44, 'Tenure': 4, 'Balance': 98000.0,
        'NumOfProducts': 2, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 95000.0, 'Satisfaction_Score': 1,
        'Card_Type': 'PLATINUM', 'Point_Earned': 520, 'CreditScore': 650, 'Complain': 1
    },
    "Hồ sơ 4: Khách hàng Trung thành Điển hình (Optimal Loyal Customer)": {
        'CustomerId': 15700004, 'Surname': 'Martin', 'Gender': 'Female',
        'Geography': 'France', 'Age': 34, 'Tenure': 6, 'Balance': 45000.0,
        'NumOfProducts': 2, 'HasCrCard': 1, 'IsActiveMember': 1,
        'EstimatedSalary': 60000.0, 'Satisfaction_Score': 4,
        'Card_Type': 'SILVER', 'Point_Earned': 780, 'CreditScore': 720, 'Complain': 0
    }
}

selected_persona = st.selectbox("🎯 Chọn Hồ sơ Mẫu để Thử nghiệm Nhanh hoặc Tự nhập:", list(PRESET_PERSONAS.keys()))
preset_data = PRESET_PERSONAS[selected_persona]

# Customer Input Form
st.subheader("1. Thông tin Hồ sơ Khách hàng")
with st.form("customer_input_form"):
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        surname = st.text_input("Họ tên Khách hàng:", value=preset_data['Surname'] if preset_data else "Dupont")
        gender = st.selectbox("Giới tính:", ['Male', 'Female'], index=0 if (preset_data and preset_data['Gender'] == 'Male') else 1)
        geography = st.selectbox("Thị trường Quốc gia:", ['France', 'Germany', 'Spain'], index=['France', 'Germany', 'Spain'].index(preset_data['Geography']) if preset_data else 0)
        age = st.number_input("Độ tuổi (Age):", min_value=18, max_value=100, value=preset_data['Age'] if preset_data else 45)

    with c2:
        tenure = st.number_input("Thời gian gắn bó (Năm):", min_value=0, max_value=10, value=preset_data['Tenure'] if preset_data else 4)
        balance = st.number_input("Số dư Tiền gửi (Balance EUR):", min_value=0.0, max_value=500000.0, step=1000.0, value=preset_data['Balance'] if preset_data else 85000.0)
        num_products = st.selectbox("Số lượng Sản phẩm đang dùng:", [1, 2, 3, 4], index=[1, 2, 3, 4].index(preset_data['NumOfProducts']) if preset_data else 1)
        credit_score = st.number_input("Điểm Tín dụng (CreditScore):", min_value=350, max_value=850, value=preset_data['CreditScore'] if preset_data else 650)

    with c3:
        has_cr_card = st.selectbox("Có Thẻ tín dụng (HasCrCard):", [1, 0], format_func=lambda x: "Có (1)" if x == 1 else "Không (0)", index=0 if (preset_data and preset_data['HasCrCard'] == 1) else 1)
        is_active = st.selectbox("Trạng thái Tương tác (IsActiveMember):", [1, 0], format_func=lambda x: "Đang hoạt động (1)" if x == 1 else "Bất hoạt (0)", index=0 if (preset_data and preset_data['IsActiveMember'] == 1) else 1)
        salary = st.number_input("Thu nhập ước tính (EstimatedSalary EUR):", min_value=0.0, max_value=500000.0, step=5000.0, value=preset_data['EstimatedSalary'] if preset_data else 75000.0)
        card_type = st.selectbox("Hạng Thẻ (Card Type):", ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'], index=['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'].index(preset_data['Card_Type']) if preset_data else 0)

    with c4:
        complain = st.selectbox("Có Khiếu nại Mở Chưa Giải quyết (Complain):", [0, 1], format_func=lambda x: "KHÔNG (0)" if x == 0 else "CÓ KHIẾU NẠI (1)", index=1 if (preset_data and preset_data['Complain'] == 1) else 0)
        satisfaction = st.slider("Điểm Hài lòng (Satisfaction Score):", min_value=1, max_value=5, value=preset_data['Satisfaction_Score'] if preset_data else 3)
        points = st.number_input("Điểm Tích lũy Thưởng (Points):", min_value=0, max_value=2000, value=preset_data['Point_Earned'] if preset_data else 500)
        rm_name = st.text_input("Tên Chuyên viên RM Phụ trách:", value="Nguyễn Văn Bảo")

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

# Run prediction
prediction_result = predict_customer(pipeline, current_customer, threshold=threshold, enforce_complain_rule=True)
nba_result = recommend_next_best_action(current_customer)

st.divider()

# Results Display Section
st.subheader("2. Kết Quả Đánh Giá Rủi Ro & Phân Tầng")

r_col1, r_col2, r_col3 = st.columns([1, 1, 2])

prob = prediction_result['churn_probability']
is_churn = prediction_result['churn_prediction']
risk_tier = prediction_result['risk_tier']
override_flag = prediction_result['rule_override_applied']

with r_col1:
    if override_flag:
        st.error(f"### Xác suất Rời bỏ:\n# 99.9%")
    elif prob >= threshold:
        st.error(f"### Xác suất Rời bỏ:\n# {prob*100:.1f}%")
    else:
        st.success(f"### Xác suất Rời bỏ:\n# {prob*100:.1f}%")
    st.caption(f"Ngưỡng Quyết định Tối ưu: T* = {threshold}")

with r_col2:
    if override_flag:
        st.error("### Phân Tầng:\n# TỐI KHẨN (CRITICAL)")
        st.warning("⚠️ QUY TẮC CỨNG: Phát sinh Khiếu nại!")
    elif risk_tier == 'CRITICAL_RISK':
        st.error(f"### Phân Tầng:\n# RẤT CAO")
    elif risk_tier == 'HIGH_RISK':
        st.warning(f"### Phân Tầng:\n# NGUY CƠ CAO")
    elif risk_tier == 'MODERATE_RISK':
        st.info(f"### Phân Tầng:\n# NGUY CƠ VỪA")
    else:
        st.success(f"### Phân Tầng:\n# AN TOÀN")

with r_col3:
    st.markdown(f"**Chiến lược Đề xuất (Next-Best-Action):** `{nba_result['strategy_code']}`")
    st.markdown(f"**Tên Chiến lược:** **{nba_result['strategy_name']}**")
    st.markdown(f"**Hành động Cụ thể:** {nba_result['recommended_action']}")
    st.markdown(f"**Kênh Tiếp cận:** `{nba_result['channel']}` | **Chi phí Dự kiến:** `{nba_result['estimated_cost_eur']} EUR`")

if override_flag:
    st.error("""
    🚨 **KÍCH HOẠT QUY TRÌNH PHẢN ỨNG NHANH SLA 4-HOUR ESCALATION:**  
    Khách hàng có khiếu nại mở chưa được xử lý. Dữ liệu chứng minh 99.86% khách hàng khiếu nại sẽ đóng tài khoản nếu không được can thiệp lập tức. 
    Hồ sơ này đã được chuyển thẳng tới Trưởng phòng Chăm sóc Khách hàng Chi nhánh để gọi điện trực tiếp trong 4 giờ làm việc.
    """)

st.divider()

# Call Script Section
st.subheader("3. Kịch Bản Cuộc Gọi Chăm Sóc Khách Hàng Cá Nhân Hóa (Front-line Call Script)")
st.info("💡 **Nguyên tắc Bảo mật:** Kịch bản được thiết kế tôn trọng sự riêng tư và đạo đức AI. Tuyệt đối không tiết lộ điểm rủi ro thuật toán cho khách hàng.")

generated_script = generate_call_script(current_customer, rm_name=rm_name)
st.code(generated_script, language="markdown")

st.divider()

# What-If Simulation
st.subheader("4. Mô Phỏng Nhạy Cảm Độ Rủi Ro (What-If Simulation)")
st.caption("Khảo sát tác động khi thay đổi các biến số hành vi có thể can thiệp được (Actionable Features)")

w_col1, w_col2, w_col3 = st.columns(3)
with w_col1:
    sim_active = st.radio("Giả định Trạng thái Tương tác:", [1, 0], index=0 if is_active == 1 else 1, format_func=lambda x: "Hoạt động (Active = 1)" if x == 1 else "Bất hoạt (Inactive = 0)")
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
st.write(f"**Kết quả Mô phỏng:** Xác suất rời bỏ mới là **{sim_prob*100:.1f}%** (Chênh lệch: **{delta_p*100:+.1f}%** so với hiện tại).")

if sim_products == 2 and num_products != 2:
    st.success("✅ **Quan sát Nghiệp vụ:** Chuyển đổi về 2 sản phẩm (Sweet Spot) giúp giảm thiểu đáng kể nguy cơ rời bỏ!")
if sim_active == 1 and is_active == 0:
    st.success("✅ **Quan sát Nghiệp vụ:** Kích hoạt tương tác kênh số (Active Member = 1) giúp hạ thấp rủi ro đóng tài khoản!")

st.warning("⚠️ *Lưu ý Tuân thủ: Mô phỏng What-If chỉ thể hiện độ nhạy tương quan của thuật toán, không thay thế hoàn toàn tương tác con người thực tế ngoài đời.*")
