# EuroVanguard Bank – Customer Churn Analytics & Decision Support System (DSS)

## 📌 Giới thiệu Dự án
Hệ thống Phân tích Dữ liệu Đa tầng, Dự báo Sớm Khách hàng Rời bỏ và Phần mềm Hỗ trợ Quyết định Giữ chân Khách hàng ứng dụng Machine Learning tại Ngân hàng Bán lẻ Châu Âu (**EuroVanguard Bank**).

Dự án áp dụng khung phân tích 4 cấp độ của **Gartner (Descriptive -> Diagnostic -> Predictive -> Prescriptive)** kết hợp quy trình chuẩn **CRISP-DM** và các chỉ số thẩm định rủi ro ngân hàng (**WOE/IV, Decile Gain/Lift, Tiered ROI, Model Governance & Fairness**).

---

## 🏛 Bối cảnh Doanh nghiệp Giả định
* **Tổ chức:** EuroVanguard Bank (Ngân hàng bán lẻ đa quốc gia tại Eurozone).
* **Thị trường khảo sát:** 10.000 khách hàng cá nhân tại Pháp (50,14%), Đức (25,09%) và Tây Ban Nha (24,77%).
* **Thực trạng dữ liệu:**
  * Tỷ lệ rời bỏ theo số lượng (**Headcount Churn Rate**): **20,38%** (2.038 / 10.000 khách hàng).
  * Quy mô tiền gửi rủi ro (**Deposit Volume at Risk**): **185,68 triệu EUR** / 764,86 triệu EUR (**24,28%** tổng nguồn vốn huy động).
  * Số dư trung bình của khách hàng rời bỏ là **91.109 EUR** (cao hơn 25,2% so với khách hàng ở lại), cho thấy ngân hàng đang thất thoát nhóm khách hàng có giá trị tiền gửi cao (Affluent/VIP), đặc biệt tại chi nhánh Đức (churn rate 32,44%).

---

## 🏗 Cấu trúc Thư mục Dự án

```text
Bank_Customer_Churn/
├── data/
│   ├── raw/                 # Dữ liệu gốc bất biến (Customer-Churn-Records.csv)
│   ├── interim/             # Dữ liệu sạch kỹ thuật (Giai đoạn 2)
│   └── processed/           # Dữ liệu Feature Engineering & chia tập (Giai đoạn 4)
├── notebooks/               # Chuỗi 8 Notebook phân tích theo tiến trình
├── src/
│   ├── data/                # Load và validate dữ liệu
│   ├── eda/                 # Kiểm định thống kê, Effect Size, WOE/IV, VIF
│   ├── preprocessing/       # Feature Engineering & Pipeline Scikit-Learn
│   ├── modeling/            # Huấn luyện, đánh giá, tối ưu ngưỡng & giải thích SHAP
│   └── business/            # Phân khúc Risk x Value, Tiered ROI & Gợi ý giữ chân
├── app/                     # Ứng dụng Streamlit GUI (5 phân hệ nghiệp vụ)
│   ├── Home.py
│   └── pages/
├── models/                  # Pipeline đã huấn luyện (.joblib) & metadata (.json)
├── reports/                 # Báo cáo markdown & biểu đồ phân tích (figures/)
├── tests/                   # Kiểm thử tự động pytest
├── requirements.txt         # Danh mục thư viện và phiên bản
└── README.md                # Tài liệu hướng dẫn tổng quan
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu Môi trường
* Python 3.10 trở lên (khuyến nghị Python 3.11 - 3.13).

### 2. Cài đặt Thư viện
```bash
pip install -r requirements.txt
```

### 3. Kiểm tra Tính toàn vẹn Dữ liệu & Môi trường
```bash
pytest tests/
```

### 4. Khởi chạy Ứng dụng GUI (Streamlit)
```bash
streamlit run app/Home.py
```

---

## 📋 Tiến độ Thực hiện theo Giai đoạn
- [x] **Giai đoạn 0:** Khởi tạo dự án, thiết lập quản trị dữ liệu & môi trường.
- [ ] **Giai đoạn 1:** Business Understanding & Data Audit (Kiểm toán 18 thuộc tính).
- [ ] **Giai đoạn 2:** Technical Data Cleansing & Validation trước EDA.
- [ ] **Giai đoạn 3:** EDA Chuẩn Ngân hàng (Đơn biến, Nhị biến + Kiểm định, WOE/IV, Đa biến + VIF).
- [ ] **Giai đoạn 4:** Domain Feature Engineering & Chia 3 tập `Train / Val / Test`.
- [ ] **Giai đoạn 5:** Predictive Modeling, Ablation Studies, Threshold Tuning & SHAP.
- [ ] **Giai đoạn 6:** Prescriptive Analytics – Phân khúc `Risk x Value`, Chiến lược & Tiered ROI.
- [ ] **Giai đoạn 7:** Phần mềm Streamlit GUI, Kiểm thử toàn diện & Hoàn thiện Nghiệp thu.
