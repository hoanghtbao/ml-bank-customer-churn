# BB Bank – Customer Churn Analytics & Decision Support System (DSS)

## 📌 Giới thiệu Dự án
Hệ thống Phân tích Dữ liệu Đa tầng, Dự báo Sớm Khách hàng Rời bỏ và Phần mềm Hỗ trợ Quyết định Giữ chân Khách hàng ứng dụng Machine Learning tại Ngân hàng Bán lẻ Châu Âu (**BB Bank**).

Dự án áp dụng khung phân tích 4 cấp độ của **Gartner (Descriptive $\rightarrow$ Diagnostic $\rightarrow$ Predictive $\rightarrow$ Prescriptive)** kết hợp quy trình chuẩn **CRISP-DM** và các chỉ số thẩm định rủi ro ngân hàng (**WOE/IV, Decile Gain/Lift, Tiered ROI, Model Governance & Fairness**).

---

## 🏛 Bối cảnh Doanh nghiệp Giả định
* **Tổ chức:** BB Bank (Ngân hàng bán lẻ đa quốc gia tại Eurozone).
* **Thị trường khảo sát:** 10.000 khách hàng cá nhân tại Pháp (50.14%), Đức (25.09%) và Tây Ban Nha (24.77%).
* **Thực trạng dữ liệu:**
  * Tỷ lệ rời bỏ theo số lượng (**Headcount Churn Rate**): **20.38%** (2,038 / 10,000 khách hàng).
  * Quy mô tiền gửi rủi ro (**Deposit Volume at Risk**): **185.68 triệu EUR** / 764.86 triệu EUR (**24.28%** tổng nguồn vốn huy động).
  * Khách hàng rời bỏ có số dư trung bình **91,109 EUR** (cao hơn 25.2% so với khách hàng ở lại), cho thấy ngân hàng đang thất thoát nhóm khách hàng có giá trị tiền gửi cao (Affluent/VIP), đặc biệt tại chi nhánh Đức (tỷ lệ rời bỏ 32.44%, làm thất thoát 97.97M EUR).

---

## 🏗 Cấu trúc Thư mục Dự án

```text
Bank_Customer_Churn/
├── Project_Source_Code.ipynb# File Notebook DUY NHẤT chạy toàn bộ quy trình từ đầu đến cuối
├── Customer-Churn-Records.csv# Tập dữ liệu gốc 10,000 dòng
├── data/
│   ├── raw/                 # Dữ liệu gốc bất biến (Customer-Churn-Records.csv)
│   ├── interim/             # Dữ liệu sạch kỹ thuật (Giai đoạn 2)
│   └── processed/           # Dữ liệu Feature Engineering & chia 3 tập Train/Val/Test
├── notebooks/               # Chuỗi 8 Notebook phân tích chi tiết từng giai đoạn
│   └── Bank_Customer_Churn_Full_Pipeline.ipynb # Bản sao lưu của notebook duy nhất
├── src/
│   ├── data/                # Load và validate dữ liệu
│   ├── eda/                 # Kiểm định thống kê, Effect Size, WOE/IV, VIF
│   ├── preprocessing/       # Feature Engineering & Pipeline Scikit-Learn
│   ├── modeling/            # Huấn luyện, đánh giá, tối ưu ngưỡng & giải thích SHAP
│   └── business/            # Phân khúc Risk x Value, Tiered ROI & Gợi ý giữ chân
├── app/                     # Ứng dụng Streamlit GUI (5 phân hệ nghiệp vụ)
│   ├── Home.py              # Trang chủ và kiến trúc Gartner
│   ├── utils.py             # Bộ nạp mô hình và hàm dùng chung
│   └── pages/               # 5 phân hệ tác nghiệp
│       ├── 1_Executive_Dashboard.py
│       ├── 2_Customer_Retention_Advisor.py
│       ├── 3_Batch_Campaign_Scoring.py
│       ├── 4_Prescriptive_Strategy_ROI.py
│       └── 5_Model_Governance_SHAP.py
├── models/                  # Pipeline đã huấn luyện (.joblib) & metadata (.json)
├── reports/                 # 4 Báo cáo chuyên sâu (.md) & 18 biểu đồ phân tích (figures/)
├── tests/                   # 39 bài kiểm thử tự động pytest (39/39 PASSED)
├── requirements.txt         # Danh mục thư viện và phiên bản chuẩn
└── README.md                # Tài liệu hướng dẫn tổng quan
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu Môi trường
* Python 3.10 – 3.13 (Đã kiểm thử và chứng nhận hoạt động hoàn hảo trên Python 3.13.2).

### 2. Cài đặt Thư viện
```bash
pip install -r requirements.txt
```

### 3. Chạy Toàn bộ Quy trình Học máy (1 File Duy nhất)
Mở và bấm **"Run All"** trong file:
- **`Project_Source_Code.ipynb`** (nằm ngay tại thư mục gốc của dự án).
*(File đã được cấu hình đường dẫn tự động, tự nạp dữ liệu, tạo bảng `df_result`, `df_if_values`, SHAP, và chiến lược ROI 100% không lỗi).*

### 4. Kiểm thử Tự động Toàn bộ Dự án
```bash
python -m pytest
```
*(Hiện tại: **39/39 tests PASSED** trong ~7 giây).*

### 5. Khởi chạy Ứng dụng Giao diện Web (Streamlit DSS)
```bash
streamlit run app/Home.py
```
Giao diện sẽ tự động mở trên trình duyệt tại `http://localhost:8501` bao gồm:
1. **Executive Dashboard:** Báo cáo quản trị, đối chiếu 3 quốc gia, bản đồ nhiệt thất thoát tiền gửi.
2. **Customer Retention Advisor:** Tra cứu khách hàng 1-1, điểm rủi ro thời gian thực, SHAP top 3 động lực, đề xuất Next-Best-Action, sinh kịch bản gọi điện tiếng Việt, và mô phỏng What-If.
3. **Batch Campaign Scoring:** Tải file CSV hoặc chấm điểm toàn bộ danh mục, lọc theo phân khúc, tải file CSV can thiệp ưu tiên.
4. **Prescriptive Strategy & ROI:** Ma trận 4 góc phần tư và Bảng tính mô phỏng Lợi nhuận Ròng ROI thời gian thực với thanh trượt tùy biến.
5. **Model Governance & SHAP:** Quản trị phiên bản metadata, bảng Decile Lift, đối chiếu 4 kịch bản Ablation, biểu đồ SHAP và checklist tuân thủ Basel III / AI Ethics.

---

## 📋 Bảng Tiến độ Hoàn thành Tất cả Các Giai đoạn
- [x] **Giai đoạn 0:** Khởi tạo dự án, thiết lập quản trị dữ liệu & môi trường (Commit `dfdf09b`).
- [x] **Giai đoạn 1:** Business Understanding & Data Audit (Kiểm toán 18 thuộc tính, Tuyên bố Tích hợp Đơn nguồn) (Commit `7a73c22`).
- [x] **Giai đoạn 2:** Technical Data Cleansing & Validation trước EDA (`reports/01_data_quality_audit_report.md`) (Commit `26c2d10`).
- [x] **Giai đoạn 3:** EDA Chuẩn Ngân hàng (Đơn biến, Nhị biến + Kiểm định, WOE/IV, Đa biến + VIF, `reports/02_eda_diagnostic_report.md`) (Commit `5645cce`).
- [x] **Giai đoạn 4:** Domain Feature Engineering (6 đặc trưng) & Chia 3 tập `Train / Val / Test` (70/15/15) (Commit `a766656`).
- [x] **Giai đoạn 5:** Predictive Modeling (Pipeline 4 Models x 3 Scalers), Ablation Studies (4 kịch bản), Threshold Tuning ($T^*=0.45$), Test Holdout với 95% Bootstrap CI, Decile Lift (3.97x) & SHAP (`reports/03_model_evaluation_report.md`) (Commit `764362f`).
- [x] **Giai đoạn 6:** Prescriptive Analytics – Phân khúc `Value x Risk` (4 Góc phần tư), Động cơ Next-Best-Action, Kịch bản Cuộc gọi RM & Tiered ROI (Lợi nhuận ròng 3.54M EUR, ROI 1,164%, `reports/04_business_strategy_playbook.md`) (Commit `9edf0b5`).
- [x] **Giai đoạn 7:** Phần mềm Streamlit GUI Đa trang, File Notebook Duy nhất `Project_Source_Code.ipynb`, Kiểm thử toàn diện 39/39 Tests & Hoàn thiện Nghiệp thu (Commit `52d88d2` & `7f07d40`).
