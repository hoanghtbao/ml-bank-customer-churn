# BÁO CÁO TIẾN ĐỘ TỔNG THỂ & NHẬT KÝ CÁC THAY ĐỔI SO VỚI KẾ HOẠCH DỰ ÁN (PROGRESS & CHANGELOG REPORT)

* **Dự án:** Hệ thống Cảnh báo Sớm Rời bỏ & Tư vấn Giữ chân Khách hàng Ngân hàng Bán lẻ (*EuroVanguard Bank Customer Churn Early-Warning & Retention DSS*)
* **Ngày cập nhật:** 19/11/2026
* **Trạng thái tổng thể:** **Hoàn thành 100% (8/8 Giai đoạn + Các hạng mục nâng cấp mở rộng)**
* **Quy tắc quản trị:** Mọi chỉnh sửa, nâng cấp hoặc điều chỉnh kiến trúc so với bản Kế hoạch gốc (`PROJECT_PLAN_BANK_CUSTOMER_CHURN.md`) đều được ghi nhận minh bạch tại báo cáo này để phục vụ tra cứu, bảo trì và bảo vệ đồ án.

---

## 1. BẢNG TỔNG HỢP TIẾN ĐỘ THỰC HIỆN THEO KẾ HOẠCH (STAGES 0 $\rightarrow$ 7)

| Giai đoạn | Hạng mục Công việc Cốt lõi | Trạng thái | Tệp Đầu ra / Minh chứng |
| :--- | :--- | :---: | :--- |
| **Giai đoạn 0** | Khởi tạo cấu trúc dự án Enterprise, kiểm tra môi trường & bảo toàn dữ liệu gốc | ✅ **100%** | `data/raw/Customer-Churn-Records.csv`, `tests/test_environment.py` |
| **Giai đoạn 1** | Business Understanding (Hồ sơ EuroVanguard Bank) & Kiểm toán Chất lượng Dữ liệu (18 cột) | ✅ **100%** | `src/data/load_data.py`, `reports/01_data_quality_audit_report.md` |
| **Giai đoạn 2** | Làm sạch Kỹ thuật (Chuẩn hóa tên cột, xử lý 92 lỗi font `?` ở `Surname` kèm cờ `Surname_Encoding_Issue`) | ✅ **100%** | `src/data/clean_data.py`, `data/interim/churn_technical_cleaned.csv` (19 cột) |
| **Giai đoạn 3** | EDA Chuẩn Ngân hàng (Đơn biến, Nhị biến, Đa biến, Kiểm định giả thuyết, Holm-Bonferroni, WoE/IV, VIF) | ✅ **100%** | `src/eda/statistical_tests.py`, `reports/02_eda_diagnostic_report.md`, `fig_01` $\rightarrow$ `fig_13` |
| **Giai đoạn 4** | Kỹ thuật Đặc trưng Nghiệp vụ (Feature Engineering) & Chia 3 tập Phân tầng (`70% Train / 15% Val / 15% Test`) | ✅ **100%** | `src/preprocessing/feature_engineering.py`, `data/processed/{train,val,test,full_engineered}.csv` |
| **Giai đoạn 5** | Huấn luyện 12 Tổ hợp (`4 Models × 3 Scalers`), 4 Kịch bản Ablation, Tối ưu Ngưỡng $T^*$, Bootstrap CI, Decile Lift & Giải thích SHAP | ✅ **100%** | `src/modeling/{train,evaluate,shap_explain}.py`, `models/churn_early_warning_pipeline.joblib`, `reports/03_model_evaluation_report.md`, `fig_14` $\rightarrow$ `fig_16` |
| **Giai đoạn 6** | Phân tích Đề xuất (Prescriptive Analytics): Ma trận 4 Quadrants, Động cơ Next-Best-Action, Kịch bản RM & Mô hình Tiered ROI | ✅ **100%** | `src/business/{segmentation,retention_advisor}.py`, `reports/04_business_strategy_playbook.md`, `fig_17` $\rightarrow$ `fig_18` |
| **Giai đoạn 7** | Triển khai Phần mềm Web Hỗ trợ Ra Quyết định (DSS GUI), Tích hợp Bản đồ GIS, Lưới Excel & Kiểm thử Tự động Toàn diện | ✅ **100%** | `api/`, `frontend/`, `Project_Source_Code.ipynb`, `tests/` (47/47 tests PASS) |

---

## 2. CHI TIẾT CÁC THAY ĐỔI & NÂNG CẤP KHÁC VỚI KẾ HOẠCH DỰ ÁN BAN ĐẦU (PLAN DEVIATIONS & UPGRADES)

Trong quá trình triển khai thực tế và tối ưu hóa theo yêu cầu sử dụng cũng như phong cách chấm bài của giảng viên, dự án đã thực hiện **6 thay đổi/nâng cấp quan trọng** so với bản kế hoạch ban đầu:

---

### Thay đổi 1: Chuyển đổi Kiến trúc Giao diện từ Streamlit GUI sang Full-Stack Next.js 16 + FastAPI (Xóa bỏ hoàn toàn Streamlit)

* **Trong Kế hoạch gốc (Giai đoạn 7):**
  * Dự kiến xây dựng giao diện bằng **Streamlit** (`app/Home.py` và `app/pages/1..5`).
* **Thực tế triển khai & Lý do thay đổi:**
  * Giao diện Streamlit gặp hạn chế về tốc độ phản hồi (mỗi lần kéo thanh trượt phải chạy lại toàn bộ script gây giật/lag ~1 giây) và khả năng tùy biến giao diện hạn chế.
  * **Nâng cấp:** Chuyển sang kiến trúc Web Doanh nghiệp hiện đại gồm:
    1. **Backend REST API (`api/`):** Xây dựng bằng **FastAPI + Uvicorn** (chạy tại cổng `8000`), tách biệt hoàn toàn tầng tính toán ML với tầng hiển thị, thời gian phản hồi `< 15ms`.
    2. **Frontend Web App (`frontend/`):** Xây dựng bằng **Next.js 16 (App Router) + TypeScript + Tailwind CSS + Recharts + Lucide Icons** (chạy tại cổng `3000`).
    3. **Loại bỏ thư mục `app/` (Streamlit):** Đã xóa hoàn toàn thư mục `app/` (2,176 dòng code Streamlit cũ) để dự án gọn gàng, không bị trùng lặp 2 giao diện.
    4. **Tích hợp thanh điều hướng thu gọn (Collapsible Sidebar) & TopNavbar:** Cho phép đóng/mở thanh công cụ mượt mà 60fps, tự động lưu trạng thái vào `localStorage`, kèm đồng hồ giờ chuẩn thị trường Châu Âu (Frankfurt CET) và đèn báo kết nối FastAPI trực tiếp.

---

### Thay đổi 2: Bổ sung Bản đồ Địa lý Thực tế 3 Quốc gia (`React-Leaflet` + `OpenStreetMap` + `GeoJSON`) trên Trang chủ

* **Trong Kế hoạch gốc:**
  * Không có bản đồ địa lý tương tác trên trang chủ (chỉ có thẻ KPI và biểu đồ cột).
* **Nâng cấp đã thực hiện:**
  * Nhúng trực tiếp **Bản đồ Địa lý Thực tế (`React-Leaflet` + `OpenStreetMap`)** làm tâm điểm đầu tiên khi mở giao diện Web (`http://localhost:3000`).
  * Hỗ trợ 4 lớp bản đồ nền: **🌍 OpenStreetMap Chuẩn**, **🗺️ Google Voyager Style**, **🛰️ Vệ tinh thực tế (Esri World Imagery)** và **🌙 FinTech Dark**.
  * Sử dụng dữ liệu biên giới thật **GeoJSON (`frontend/public/geo/tri_market_countries.json`)** để tô màu chính xác lãnh thổ đất liền của 3 nước.
  * **Đồng nhất 100% với Database gốc (`Customer-Churn-Records.csv`):** Chỉ đặt **đúng 3 Trạm phát sáng Quốc gia duy nhất** đại diện cho 3 giá trị của cột `Geography` (`Germany: 2,509 KH - Churn 32.44%`, `France: 5,014 KH - Churn 16.17%`, `Spain: 2,477 KH - Churn 16.67%`), không tạo các chấm chi nhánh giả định gây hiểu nhầm. Khi click vào từng nước, bảng bên phải hiển thị đầy đủ thống kê từ CSV và cơ cấu 4 nhóm `Q1, Q2, Q3, Q4` của nước đó.

---

### Thay đổi 3: Nâng cấp Bảng Chấm điểm Hàng loạt (Top 150 Khách hàng) thành Bảng tính Lưới Mô phỏng Microsoft Excel

* **Trong Kế hoạch gốc (Trang 3 - Batch Campaign Scoring):**
  * Chỉ hiển thị bảng HTML cơ bản và nút tải CSV.
* **Nâng cấp đã thực hiện (`frontend/src/app/batch/page.tsx`):**
  * Thiết kế lại thành **Bảng tính Lưới Excel Tương tác (Interactive Excel Grid Simulator)**:
    * Có khung tiêu đề màu xanh chuẩn Excel (`#107c41`), thanh công thức **$f_x$ (Formula Bar)** và **Ô tọa độ (Name Box)** cập nhật theo từng ô người dùng nhấp chọn (`A1`, `F12`, `J4`...).
    * Có hàng chữ cái định danh cột **`A` $\rightarrow$ `N`**, cột số thứ tự dòng **`1` $\rightarrow$ `150`**, đóng băng tiêu đề (**Freeze Panes**) khi cuộn dọc, và sắp xếp tăng/giảm dần khi click vào tiêu đề cột.
    * Tích hợp **Tô màu có điều kiện (Excel Data Bars)** ngay trên cột Xác suất Churn (%) và **3 Sheet Tabs** ở chân bảng (`Sheet1: Top 150 Khách Hàng`, `Sheet2: Q1 VIP At-Risk`, `Sheet3: Tâm Chấn Đức`) cùng thanh trạng thái tự động tính `COUNT`, `SUM (€)` và `AVG CHURN`.

---

### Thay đổi 4: Gộp 8 File Notebook Thành Phần vào 1 File Tổng Hợp Duy Nhất (`Project_Source_Code.ipynb`) Chuẩn Phong Cách Giảng Viên

* **Trong Kế hoạch gốc:**
  * Dự kiến tách rời thành các file notebook riêng biệt theo từng giai đoạn trong thư mục `notebooks/` (`01` $\rightarrow$ `08`).
* **Thực tế triển khai & Chuẩn hóa:**
  * Để khớp với cách trình bày trên 1 file duy nhất của giảng viên nhưng **tuyệt đối không bỏ sót bất kỳ nội dung nào của 8 file thành phần**:
    1. **Bảo toàn 100% nội dung của 8 file Notebook (`156/156 cells`)** và bổ sung thêm **5 cells theo mẫu của thầy** (`categorize_age`, `plot_categorical_analysis_3subfigs`, `kdeplot` theo `age_groups`) $\rightarrow$ tạo thành tệp tổng hợp **[Project_Source_Code.ipynb](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/Project_Source_Code.ipynb)** gồm **161 cells** (*98 Markdown cells + 63 Code cells*).
    2. **Đầy đủ 18/18 biểu đồ trong báo cáo (`fig_01` $\rightarrow$ `fig_18`)** cộng với các biểu đồ 3-subfigs của thầy (tổng cộng **24 biểu đồ PNG**) đều có đầy đủ code vẽ và hiển thị trực tiếp ngay bên trong `Project_Source_Code.ipynb`.
    3. **Gom toàn bộ lệnh `import` về duy nhất Ô Code Đầu Tiên (`Cell #4` — `In [1]`):** Xóa bỏ toàn bộ các khối `import` lặp lại ở đầu các giai đoạn 2 $\rightarrow$ 6, giúp mạch code chạy xuyên suốt như một bài viết liền mạch.
    4. **Khử triệt để 100% cảnh báo thư viện (`FutureWarning` / `UserWarning`):** Cập nhật cú pháp Seaborn v0.13+ (`shade=True` $\rightarrow$ `fill=True`, bổ sung `hue=...` và `legend=False` khi dùng `palette`, thêm `set_xticks` trước `set_xticklabels`) và xóa sạch các hộp cảnh báo màu hồng trong Output.

---

### Thay đổi 5: Bổ sung Đặc trưng Nhóm tuổi `age_groups` (`categorize_age`) & Làm rõ Quy tắc Số lượng Cột (18 $\rightarrow$ 19 $\rightarrow$ 26 $\rightarrow$ 19)

* **Trong Kế hoạch gốc (Giai đoạn 4):**
  * Dự kiến tạo 6 đặc trưng nghiệp vụ mới.
* **Thực tế triển khai:**
  * Bổ sung thêm đặc trưng thứ 7 là **`age_groups`** (`youth`, `adult_prime`, `adult_mature`, `senior`) từ hàm `categorize_age(row)` theo phong cách của giảng viên.
  * **Làm rõ lộ trình biến đổi số lượng cột qua từng giai đoạn (để giải trình rõ ràng khi bảo vệ):**
    * **Dữ liệu thô (`Customer-Churn-Records.csv`):** **18 cột gốc**.
    * **Sau Giai đoạn 2 (Làm sạch kỹ thuật - `churn_technical_cleaned.csv`):** Thêm 1 cột cờ kỹ thuật `Surname_Encoding_Issue` đánh dấu 92 dòng lỗi font họ tên $\rightarrow$ **19 cột**.
    * **Sau Giai đoạn 4 (Feature Engineering - `full_engineered.csv`):** Thêm 7 cột đặc trưng mới (`IsZeroBalance`, `Balance_To_Salary_Ratio`, `Products_Per_Tenure`, `Product_Holding_Risk_Tier`, `Age_Lifecycle_Stage`, `Engagement_Score`, `age_groups`) $\rightarrow$ **26 cột**.
    * **Khi đưa vào Huấn luyện Mô hình ML (Giai đoạn 5 - `feature_columns`):** Từ 26 cột loại bỏ 7 cột không đưa vào học máy (`Exited` là biến mục tiêu $y$, `RowNumber`, `CustomerId`, `Surname`, `Surname_Encoding_Issue`, biến rò rỉ `Complain`, và `Age_Lifecycle_Stage` do đã dùng `age_groups`) $\rightarrow$ còn lại đúng **19 đặc trưng đầu vào sạch** (*13 cột gốc hợp lệ + 6 cột đặc trưng mới trong đó có cờ `IsZeroBalance`*).

---

### Thay đổi 6: Tách Rời Bộ Nạp Mô Hình (Decoupled Loaders) & Mở Rộng Kiểm Thử Tự Động Lên 47 Tests

* **Trong Kế hoạch gốc:**
  * Các hàm nạp mô hình nằm trong `app/utils.py` (phụ thuộc vào `@st.cache_resource` của Streamlit) và bộ test có 39 unit tests.
* **Nâng cấp đã thực hiện:**
  * Chuyển các hàm nạp dữ liệu và mô hình (`load_champion_pipeline`, `load_metadata`, `load_full_dataset`, `get_pre_scored_data`) về module lõi [src/modeling/predict.py](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/src/modeling/predict.py) thuần Python, không phụ thuộc vào bất kỳ framework giao diện nào.
  * Bổ sung thêm tệp kiểm thử [tests/test_api_endpoints.py](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/tests/test_api_endpoints.py) gồm 8 bài kiểm thử tích hợp cho toàn bộ hệ thống FastAPI REST Endpoints $\rightarrow$ Nâng tổng số bài kiểm thử tự động lên **47/47 tests đạt 100% (`PASSED`)**.

---

## 3. DANH MỤC TỆP BÁO CÁO & TÀI LIỆU HIỆN CÓ TRONG DỰ ÁN

Để thuận tiện tra cứu khi viết báo cáo Word hoặc làm Slide thuyết trình, toàn bộ hệ thống báo cáo được lưu tại:
1. [PROJECT_PLAN_BANK_CUSTOMER_CHURN.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/PROJECT_PLAN_BANK_CUSTOMER_CHURN.md): Kế hoạch tổng thể & Kiến trúc hệ thống.
2. [Project_Source_Code.ipynb](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/Project_Source_Code.ipynb): Tệp Jupyter Notebook tổng hợp duy nhất (161 cells, 24 biểu đồ, chạy xuyên suốt từ đầu đến cuối).
3. [reports/01_data_quality_audit_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/01_data_quality_audit_report.md): Báo cáo Kiểm toán Chất lượng Dữ liệu & Làm sạch Kỹ thuật.
4. [reports/02_eda_diagnostic_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/02_eda_diagnostic_report.md): Báo cáo Phân tích Khám phá (EDA), Kiểm định Thống kê & Chẩn đoán Đa biến.
5. [reports/03_model_evaluation_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/03_model_evaluation_report.md): Báo cáo Đánh giá Mô hình Học máy, Ablation Study, Tối ưu Ngưỡng $T^*$ & Giải thích SHAP.
6. [reports/04_business_strategy_playbook.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/04_business_strategy_playbook.md): Cẩm nang Chiến lược Giữ chân 4 Quadrants, Next-Best-Action & Mô hình Kinh tế Tiered ROI.
7. [reports/05_progress_and_changelog_report.md](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/05_progress_and_changelog_report.md): Báo cáo Tiến độ & Nhật ký Thay đổi so với Kế hoạch Dự án (tệp này).
