# BB Bank – Customer Churn Analytics & Decision Support System (DSS)

## 📌 Giới thiệu Dự án
Hệ thống Phân tích Dữ liệu Đa tầng, Dự báo Sớm Khách hàng Rời bỏ và Ứng dụng Web Hỗ trợ Quyết định Giữ chân Khách hàng (**Full-Stack Next.js 16 + FastAPI**) ứng dụng Machine Learning tại Ngân hàng Bán lẻ Châu Âu (**BB Bank AG**).

Dự án áp dụng khung phân tích 4 cấp độ của **Gartner (Descriptive $\rightarrow$ Diagnostic $\rightarrow$ Predictive $\rightarrow$ Prescriptive)** kết hợp quy trình chuẩn **CRISP-DM** và các chỉ số thẩm định rủi ro ngân hàng (**WOE/IV, Decile Gain/Lift, Tiered ROI, Model Governance & SHAP**).

---

## 🏛 Bối cảnh Doanh nghiệp Giả định
* **Tổ chức:** BB Bank (`BB Bank AG` — Ngân hàng bán lẻ đa quốc gia tại Eurozone).
* **Thị trường khảo sát:** `10.000` khách hàng cá nhân tại Pháp (`50,14%`), Đức (`25,09%`) và Tây Ban Nha (`24,77%`).
* **Thực trạng dữ liệu:**
  * Tỷ lệ rời bỏ theo số lượng (**Headcount Churn Rate**): **`20,38%`** (`2.038 / 10.000` khách hàng).
  * Quy mô tiền gửi rủi ro (**Deposit Volume at Risk**): **`185,68 triệu EUR` / `764,86 triệu EUR`** (`24,28%` tổng nguồn vốn huy động).
  * Khách hàng rời bỏ có số dư trung bình **`91.109 EUR`** (cao hơn **`25,2%`** so với khách hàng ở lại), đặc biệt tại chi nhánh Đức (tỷ lệ rời bỏ **`32,44%`**, làm thất thoát **`97,97M EUR`**).

---

## 🏗 Cấu trúc Thư mục Dự án

```text
Bank_Customer_Churn/
├── Project_Source_Code.ipynb        # File Notebook tổng hợp chạy toàn bộ quy trình 161 cells
├── Customer-Churn-Records.csv       # Tập dữ liệu gốc 10.000 dòng
├── run_fullstack.py                 # Trình khởi chạy đồng thời FastAPI (:8000) & Next.js (:3000)
├── start_web.bat                    # Lối tắt khởi chạy nhanh trên Windows
├── api/                             # Backend REST API (FastAPI + Uvicorn)
│   ├── main.py                      # Điểm vào API & endpoint /health
│   ├── schemas.py                   # Pydantic request/response schemas
│   └── routes/                      # 5 router: dashboard, predict, batch, strategy, governance
├── frontend/                        # Frontend Web App (Next.js 16 + TypeScript + Tailwind CSS v4)
│   └── src/
│       ├── app/                     # 6 trang: /, /dashboard, /advisor, /batch, /strategy, /governance
│       ├── components/              # AppShell (Light/Dark), Sidebar, TopNavbar (Ctrl+K), GIS Map...
│       └── lib/                     # api.ts, formatters.ts (vi-VN), mapBranchesData.ts
├── design-system/                   # Chuẩn giao diện Fintech UI/UX Pro Max (MASTER.md)
├── data/
│   ├── raw/                         # Dữ liệu gốc bất biến (Customer-Churn-Records.csv)
│   ├── interim/                     # Dữ liệu sạch kỹ thuật (Giai đoạn 2)
│   └── processed/                   # Dữ liệu Feature Engineering & chia 3 tập Train/Val/Test
├── notebooks/                       # Chuỗi 8 Notebook phân tích chi tiết + bản sao lưu tổng hợp
├── src/
│   ├── data/                        # Load và validate dữ liệu
│   ├── eda/                         # Kiểm định thống kê, Effect Size, WOE/IV, VIF
│   ├── preprocessing/               # Feature Engineering & Pipeline Scikit-Learn
│   ├── modeling/                    # Huấn luyện, đánh giá, tối ưu ngưỡng & giải thích SHAP
│   └── business/                    # Phân khúc Risk x Value, Tiered ROI & Gợi ý giữ chân
├── models/                          # Pipeline đã huấn luyện (.joblib) & metadata (.json)
├── reports/                         # 5 Báo cáo chuyên sâu (.md) & 18 biểu đồ phân tích (figures/)
├── tests/                           # Bộ kiểm thử tự động pytest (48 test cases, gồm cả API)
├── requirements.txt                 # Danh mục thư viện Python chuẩn
└── README.md                        # Tài liệu hướng dẫn tổng quan
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu Môi trường
* Python 3.10 – 3.13 (Đã kiểm thử trên Python 3.13.2) & Node.js >= 20.

### 2. Cài đặt Thư viện
```bash
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

### 3. Chạy Toàn bộ Quy trình Học máy (1 File Notebook Duy nhất)
Mở và bấm **"Run All"** trong file **`Project_Source_Code.ipynb`** ngay tại thư mục gốc.

### 4. Kiểm thử Tự động Toàn bộ Dự án
```bash
python -m pytest -v
```
*(Gồm **48 test cases** phủ dữ liệu, EDA, Feature Engineering, Modeling, Business Strategy và toàn bộ FastAPI REST endpoints).*

### 5. Khởi chạy Hệ thống Full-Stack Web DSS (Next.js 16 + FastAPI)
```bash
python run_fullstack.py
```
*(Mặc định chạy chế độ **Auto-Reload Dev Mode** giúp tự cập nhật UI/API khi sửa code; dùng `python run_fullstack.py --prod` để chạy bản Production build).*

Sau khi khởi chạy thành công:
* **Giao diện Web:** `http://localhost:3000` (hỗ trợ **Chế độ Sáng/Tối** đồng bộ, tìm kiếm nhanh **`Ctrl+K`** trên `10.000` khách hàng)
* **Tài liệu API tương tác:** `http://127.0.0.1:8000/docs`

6 phân hệ chính trên giao diện Web:
1. **Tổng Quan Hồ Sơ (`/`):** Bản đồ địa lý thực tế 3 quốc gia (`React-Leaflet` + `GeoJSON` Tây Âu) và kiến trúc 4 tầng Gartner.
2. **Báo Cáo Điều Hành (`/dashboard`):** Dual Baseline KPI, tâm chấn Đức, đường cong chữ U ngược theo số sản phẩm và nhóm tuổi.
3. **Tư Vấn Giữ Chân 1-1 (`/advisor`):** Tra cứu & chấm điểm từng khách hàng, luật cứng SLA 4h cho khiếu nại, kịch bản thoại RM và mô phỏng What-If.
4. **Chấm Điểm Danh Mục (`/batch`):** Mô phỏng lưới bảng tính Excel (`BB_Bank_Scored_Portfolio_2026.xlsx`), thanh công thức `fx`, lọc rủi ro và xuất CSV.
5. **Chiến Lược & ROI (`/strategy`):** Ma trận 4 góc phần tư (`Value × Risk`) và máy tính mô phỏng lợi nhuận ròng Tiered ROI thời gian thực.
6. **Quản Trị Mô Hình AI (`/governance`):** Siêu dữ liệu xuất xưởng từ `model_metadata.json`, bảng Decile Lift (`3,97x`), 4 kịch bản Ablation và checklist Basel III / GDPR.

---

## 📋 Bảng Tiến độ Hoàn thành Các Giai đoạn
- [x] **Giai đoạn 0:** Khởi tạo dự án, thiết lập quản trị dữ liệu & môi trường.
- [x] **Giai đoạn 1:** Business Understanding & Data Audit (Kiểm toán 18 thuộc tính).
- [x] **Giai đoạn 2:** Technical Data Cleansing & Validation trước EDA ([01_data_quality_audit_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/01_data_quality_audit_report.md)).
- [x] **Giai đoạn 3:** EDA Chuẩn Ngân hàng — Đơn biến, Nhị biến + Kiểm định, WOE/IV, Đa biến + VIF ([02_eda_diagnostic_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/02_eda_diagnostic_report.md)).
- [x] **Giai đoạn 4:** Domain Feature Engineering (6 đặc trưng mới) & Chia 3 tập `Train / Val / Test` (`7.000 / 1.500 / 1.500`).
- [x] **Giai đoạn 5:** Predictive Modeling (`XGBoost + StandardScaler`), Ablation Studies (4 kịch bản, loại `Complain` chống Target Leakage), Threshold Tuning (`T* = 0,45`), Test Holdout Accuracy `84,67%` & ROC-AUC `0,8437` (`95% CI: [0,8179; 0,8693]`), Decile 1 Lift `3,97x` & SHAP ([03_model_evaluation_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/03_model_evaluation_report.md)).
- [x] **Giai đoạn 6:** Prescriptive Analytics — Phân khúc `Value × Risk`, Next-Best-Action, Kịch bản RM & Tiered ROI (Lợi nhuận ròng `3,54 triệu EUR`, ROI `1.164,96%`, [04_business_strategy_playbook.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/04_business_strategy_playbook.md)).
- [x] **Giai đoạn 7:** Nâng cấp kiến trúc Full-Stack **Next.js 16 + FastAPI**, chuẩn hóa thương hiệu **`BB Bank`**, áp dụng **UI/UX Pro Max** (Light/Dark Mode đồng bộ, tìm kiếm `Ctrl+K`, định dạng số `vi-VN`) và hoàn thiện bộ báo cáo tiến độ ([05_progress_and_changelog_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/05_progress_and_changelog_report.md)).
