# BÁO CÁO KIỂM TOÁN CHẤT LƯỢNG & LÀM SẠCH KỸ THUẬT DỮ LIỆU
## BB Bank – Customer Churn Analytics & Decision Support System
**Mã tài liệu:** `DATA-QUALITY-REPORT-V1.0`  
**Giai đoạn:** Giai đoạn 1 & Giai đoạn 2 (CRISP-DM: Data Understanding & Data Preparation)  
**Tập dữ liệu nguồn:** `data/raw/Customer-Churn-Records.csv`  
**Tập dữ liệu sau xử lý kỹ thuật:** `data/interim/churn_technical_cleaned.csv`

---

## 1. Tóm tắt Điều hành (Executive Summary)

Báo cáo này tài liệu hóa kết quả kiểm toán chất lượng dữ liệu thô và quy trình làm sạch kỹ thuật (Technical Data Cleansing) trên danh mục **10.000 khách hàng cá nhân** của **BB Bank** (tại 3 thị trường: Pháp, Đức và Tây Ban Nha).

### Các kết luận then chốt:
1. **Tính toàn vẹn kỹ thuật:** Bộ dữ liệu có chất lượng thu thập rất cao về mặt cấu trúc: **0% giá trị khuyết thiếu (`NaN`)**, **0 bản ghi trùng lặp**, và toàn bộ **10.000 mã định danh `CustomerId` là duy nhất**.
2. **Tích hợp dữ liệu (Data Integration):** Dữ liệu là bảng phẳng cắt ngang đơn nguồn (`single-source snapshot`) đã tiền tích hợp đầy đủ thông tin định danh, nhân khẩu học, số dư, thẻ và trải nghiệm. Do đó không phát sinh nhu cầu kết nối phức tạp từ các nguồn ngoài (`skip multi-source merge`), bảo toàn 100% tính nhất quán.
3. **Mỏ neo thiệt hại tài chính (Dual Baseline Benchmark):**
   * Tỷ lệ rời bỏ theo số lượng khách hàng (**Headcount Churn Rate**): **20,38%** (2.038 / 10.000 KH).
   * Tỷ lệ thất thoát nguồn vốn huy động (**Deposit Volume at Risk**): **24,28%** (**185,68 triệu EUR** bị rút đi trên tổng quy mô 764,86 triệu EUR).
   * Khách hàng rời bỏ có số dư trung bình **91.109,48 EUR**, cao hơn 25,2% so với khách hàng ở lại (72.742,75 EUR), chứng minh ngân hàng đang bị chảy máu nhóm khách hàng giàu có (Affluent/VIP).
4. **Bảo toàn phân phối gốc:** Giai đoạn này tuân thủ nguyên tắc chuẩn doanh nghiệp: **chỉ làm sạch kỹ thuật, không xóa ngoại lệ hợp lệ, không điền trung bình số dư bằng 0, và chưa tạo biến phái sinh** để dữ liệu bước vào EDA Giai đoạn 3 một cách khách quan nhất.

---

## 2. Từ điển Dữ liệu Kỹ thuật (Technical Data Dictionary)

Bảng dữ liệu sạch kỹ thuật tại `data/interim/churn_technical_cleaned.csv` gồm **10.000 dòng × 19 cột** (18 cột gốc đã chuẩn hóa tên + 1 cột cờ vết kỹ thuật):

| STT | Tên cột chuẩn hóa | Kiểu dữ liệu | Miền giá trị thực tế | Ý nghĩa nghiệp vụ ngân hàng | Vai trò phân tích |
| :-: | :--- | :---: | :--- | :--- | :--- |
| 1 | `RowNumber` | `int64` | `1` .. `10000` | Số thứ tự bản ghi | Loại bỏ khi phân tích ML |
| 2 | `CustomerId` | `int64` | `15565701` .. `15815690` | Mã định danh duy nhất của khách hàng | Khóa chính hiển thị GUI; cấm đưa vào ML |
| 3 | `Surname` | `string` | 2.932 họ khác nhau (đã làm sạch font) | Họ của khách hàng | Hiển thị phiếu tư vấn; cấm đưa vào ML |
| 4 | `CreditScore` | `int64` | `350` .. `850` (TB: `650,53`) | Điểm tín dụng uy tín tài chính | Feature (Biến số) |
| 5 | `Geography` | `string` | `France` (50,14%), `Germany` (25,09%), `Spain` (24,77%) | Quốc gia nơi mở tài khoản | Feature (Phân loại định danh) |
| 6 | `Gender` | `string` | `Male` (54,57%), `Female` (45,43%) | Giới tính khách hàng | Feature (Kiểm tra Fairness Ablation) |
| 7 | `Age` | `int64` | `18` .. `92` (TB: `38,92`, Trung vị: `37`) | Độ tuổi khách hàng | Feature (Biến số) |
| 8 | `Tenure` | `int64` | `0` .. `10` năm (TB: `5,01`; 413 KH mới `0` năm) | Số năm gắn bó với ngân hàng | Feature (Biến số) |
| 9 | `Balance` | `float64` | `0,00` .. `250.898,09` EUR | Số dư tài khoản tiền gửi hiện tại (EUR) | Feature (Biến số trọng tâm) |
| 10 | `NumOfProducts` | `int64` | `1` (50,84%), `2` (45,90%), `3` (2,66%), `4` (0,60%) | Số sản phẩm ngân hàng đang dùng | Feature (Rời rạc / Bẫy bán chéo) |
| 11 | `HasCrCard` | `int64` | `1` = Có (70,55%), `0` = Không (29,45%) | Sở hữu hạn mức thẻ tín dụng | Feature (Nhị phân) |
| 12 | `IsActiveMember`| `int64` | `1` = Hoạt động (51,51%), `0` = Không (48,49%) | Trạng thái giao dịch tích cực | Feature (Nhị phân) |
| 13 | `EstimatedSalary`| `float64`| `11,58` .. `199.992,48` EUR | Mức lương năm ước tính (EUR) | Feature (Biến số) |
| 14 | `Exited` | `int64` | `0` = Ở lại (79,62%), `1` = Rời bỏ (20,38%) | Trạng thái rời bỏ ngân hàng | **Target Label (`y`)** |
| 15 | `Complain` | `int64` | `0` = Không (7.956 KH), `1` = Có khiếu nại (2.044 KH) | Lịch sử gửi phàn nàn/khiếu nại | Biến cảnh báo Target Leakage |
| 16 | `Satisfaction_Score`| `int64`| `1`, `2`, `3`, `4`, `5` (TB: `3,01`) | Điểm hài lòng sau giải quyết vấn đề | Feature (Thứ bậc) |
| 17 | `Card_Type` | `string` | `DIAMOND` (25,07%), `GOLD` (25,02%), `SILVER` (24,96%), `PLATINUM` (24,95%) | Hạng thẻ thành viên/thanh toán | Feature (Thứ bậc) |
| 18 | `Point_Earned` | `int64` | `119` .. `1000` điểm (TB: `606,52`) | Điểm thưởng tích lũy | Feature (Biến số) |
| 19 | `Surname_Encoding_Issue`| `int64`| `1` = Có lỗi font ban đầu (92 KH), `0` = Bình thường | Cờ vết kỹ thuật kiểm toán font `?` | Cờ kỹ thuật nội bộ |

---

## 3. Chi tiết 5 Phát hiện Kiểm toán & Cách Xử lý Kỹ thuật

### 3.1. Phát hiện 1: Lỗi Font Mã hóa Ký tự `?` trong Cột `Surname` (92 bản ghi)
* **Bản chất lỗi:** Có 92 khách hàng mang các họ như `H?`, `Hs?`, `L?`, `Y?an`, `Hs?eh` do các ký tự có dấu âm/ký tự đặc biệt bị lỗi encode sang ASCII khi xuất CSV.
* **Xử lý:** 
  * Gắn cờ truy vết: `Surname_Encoding_Issue = 1` cho 92 dòng này.
  * Làm sạch chuỗi: Loại bỏ ký tự `?` để khi tra cứu trên giao diện Web DSS hiển thị trang trọng và không bị lỗi hiển thị rác.

### 3.2. Phát hiện 2: Mâu thuẫn Logic giữa `HasCrCard = 0` và `Card_Type` (2.945 bản ghi)
* **Bản chất:** Có 2.945 khách hàng không có thẻ tín dụng (`HasCrCard = 0`) nhưng vẫn mang hạng thẻ `DIAMOND / GOLD / PLATINUM / SILVER` và tích lũy điểm thưởng `Point_Earned`.
* **Căn cứ nghiệp vụ ngân hàng:** `Card_Type` phản ánh Hạng thẻ thành viên / thẻ ghi nợ (Debit/Membership Tier) chung của ngân hàng, trong khi `HasCrCard` chỉ phản ánh việc khách hàng có kích hoạt hạn mức thẻ tín dụng (Credit Card) hay không. Do đó, **giữ nguyên toàn bộ 2.945 bản ghi**, không xóa dòng.

### 3.3. Phát hiện 3: Zero-Inflation ở Cột `Balance` (3.617 bản ghi có `Balance = 0`)
* **Bản chất:** `36,17%` khách hàng có số dư bằng 0. Đặc biệt:
  * Tại **Đức (Germany)**: **100% khách hàng đều có số dư dương (`Balance > 0`)**.
  * Tại **Pháp (France)**: **48,22%** khách hàng có `Balance = 0`.
  * Tại **Tây Ban Nha (Spain)**: **48,41%** khách hàng có `Balance = 0`.
* **Kết luận kỹ thuật:** Đây là trạng thái tài khoản thực tế (khách hàng nhận lương hoặc đã rút cạn tài khoản thanh toán CASA). Tuyệt đối **không coi là giá trị thiếu để điền trung bình**. Sẽ tạo biến cờ `IsZeroBalance` ở bước Feature Engineering Giai đoạn 4.

### 3.4. Phát hiện 4: Bẫy Rò rỉ Mục tiêu (Target Leakage) ở Biến `Complain` (Trùng khớp 99,86%)
* **Bản chất:**
  * Khách hàng `Complain = 0`: Có 7.952 người ở lại, chỉ 4 người rời bỏ.
  * Khách hàng `Complain = 1`: Có 2.034 người rời bỏ (**99,51%**), chỉ 10 người ở lại.
  * Hệ số tương quan $r = 0,995693$ (9.986 / 10.000 dòng trùng khớp).
* **Kết luận kỹ thuật:** Biến `Complain` phát sinh đồng thời với sự kiện rời bỏ. Trong Giai đoạn 5 sẽ loại bỏ `Complain` khỏi mô hình dự báo sớm chủ động (**Early-Warning Model**).

### 3.5. Phát hiện 5: Ngoại lệ Thống kê Hợp lệ ở Cột `Age` và `CreditScore`
* Cột `Age` có 424 khách hàng từ 62 đến 92 tuổi nằm ngoài dải IQR. Đây là nhóm người cao tuổi gửi tiết kiệm có thật trong ngân hàng.
* Cột `CreditScore` có 15 khách hàng có điểm dưới 383 (lịch sử nợ xấu có thật).
* **Quyết định:** Giữ nguyên 100% ngoại lệ hợp lệ, không xóa bỏ.

---

## 4. Bảng Đối chiếu Trước và Sau Làm sạch Kỹ thuật (Before vs. After Reconciliation)

| Tiêu chí Kiểm toán | Trước xử lý (`data/raw`) | Sau xử lý (`data/interim`) | Trạng thái Nghiệp vụ |
| :--- | :--- | :--- | :---: |
| **Tổng số dòng (Rows)** | 10.000 dòng | 10.000 dòng | **Bảo toàn 100%** |
| **Tổng số cột (Columns)** | 18 cột | 19 cột (+1 cờ `Surname_Encoding_Issue`) | **Chuẩn hóa schema** |
| **Tên cột có khoảng trắng** | 3 cột (`Satisfaction Score`, `Card Type`, `Point Earned`) | 0 cột (thay bằng dấu gạch dưới `_`) | **Đạt chuẩn mã hóa** |
| **Lỗi ký tự font `Surname`** | 92 dòng chứa dấu `?` | 0 dòng chứa dấu `?` | **Đã làm sạch hiển thị** |
| **Dữ liệu thiếu (NaN)** | 0 giá trị (0,00%) | 0 giá trị (0,00%) | **Hoàn hảo** |
| **Bản ghi trùng lặp** | 0 bản ghi trùng | 0 bản ghi trùng | **Hoàn hảo** |
| **Xác thực miền giá trị** | Chưa xác thực | Đạt 15/15 quy tắc nghiệp vụ | **Hoàn hảo** |
| **Bảo toàn phân phối gốc** | Headcount Churn: 20,38%<br>Balance Churn: 24,28% | Headcount Churn: 20,38%<br>Balance Churn: 24,28% | **Giữ nguyên 100%** |

---

## 5. Kết luận Chuyển giao sang Giai đoạn 3 (EDA)

Bộ dữ liệu tại `data/interim/churn_technical_cleaned.csv` đã đạt tiêu chuẩn chất lượng dữ liệu doanh nghiệp và sẵn sàng 100% cho **Giai đoạn 3: Exploratory Data Analysis (EDA Chuẩn Ngân hàng: Đơn biến $\rightarrow$ Nhị biến + Kiểm định $p$-value, Cramér's V, WOE/IV $\rightarrow$ Đa biến + VIF & Balance-at-Risk)**.
