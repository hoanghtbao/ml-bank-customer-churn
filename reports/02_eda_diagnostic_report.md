# BÁO CÁO PHÂN TÍCH CHẨN ĐOÁN DỮ LIỆU RỜI BỎ KHÁCH HÀNG
## (EDA & Diagnostic Analytics Report: From Descriptive to Diagnostic Insights)
### Doanh nghiệp giả định: EuroVanguard Bank (France, Germany, Spain)
**Quy trình chuẩn:** CRISP-DM — Phase 2 & 3: Data Understanding & Diagnostic Analytics  
**Tập dữ liệu chuẩn hóa:** [churn_technical_cleaned.csv](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/data/interim/churn_technical_cleaned.csv) (10,000 khách hàng × 18 biến số)  
**Ngày thực hiện:** Tháng 11/2026 | **Phiên bản:** 1.0 (Production-Ready)

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Phân tích chẩn đoán chuyên sâu (Diagnostic Analytics) được thực hiện trên 10.000 hồ sơ khách hàng của EuroVanguard Bank nhằm xác định căn nguyên của hiện tượng khách hàng đóng tài khoản và rút vốn tiền gửi. Khác biệt với các tiếp cận học máy thông thường chỉ tập trung vào tỷ lệ rời bỏ theo số lượng đầu người (Headcount Churn), báo cáo này thiết lập **Hệ thống Mục tiêu Kép (Dual Baseline Framework)** gắn liền trực tiếp với dòng tiền và vốn huy động của ngân hàng:

| Chỉ số Cốt lõi (Core Metric) | Giá trị Toàn Ngân hàng | Phân khúc Khách hàng Rời bỏ (`Exited = 1`) | Phân khúc Khách hàng Giữ chân (`Exited = 0`) | Chênh lệch / Tác động Tài chính |
| :--- | :---: | :---: | :---: | :---: |
| **Quy mô Khách hàng (Headcount)** | 10,000 | **2,038 (20.38%)** | 7,962 (79.62%) | Churn Baseline: **20.38%** |
| **Tổng Tiền gửi Huy động (Deposit Volume)** | 764.86M EUR | **185.68M EUR (24.28%)** | 579.18M EUR (75.72%) | **Thất thoát 24.28% tổng vốn huy động** |
| **Số dư Tiền gửi Trung bình (Mean Balance)** | 76,486 EUR | **91,109 EUR** | 72,743 EUR | Khách rời bỏ giàu hơn **+25.2% (+18,366 EUR)** |
| **Số dư Tiền gửi Trung vị (Median Balance)** | 97,199 EUR | **109,344 EUR** | 92,063 EUR | Median lệch cao hơn **+17,281 EUR** |
| **Thị trường Tâm chấn (Epicenter)** | 3 Quốc gia | **Germany: 32.44% Churn** | France (16.17%), Spain (16.67%) | Đức thất thoát **97.97M EUR (52.76% tổng vốn mất)** |

> [!IMPORTANT]
> **Phát hiện Trọng yếu Cấp Ban điều hành (Board-Level Finding):**  
> Khách hàng rời bỏ không phải là nhóm khách hàng thu nhập thấp hay tài khoản rỗng. Trái lại, khách hàng rời bỏ có số dư trung bình cao hơn khách hàng ở lại tới **25.2%**. Ngân hàng đang đối mặt với cuộc khủng hoảng "Chảy máu dòng vốn lớn" (High-Value Capital Outflow), đặc biệt tập trung tại thị trường Đức.

---

## 2. PHÂN TÍCH CHẨN ĐOÁN CHI TIẾT THEO 6 TRỤ CỘT NGHIỆP VỤ

Mỗi phát hiện bên dưới được trình bày theo cấu trúc chuẩn mực 6 phần:
1. **Biểu đồ Trực quan**
2. **Câu hỏi Nghiệp vụ Chẩn đoán**
3. **Kiểm định Thống kê & Mức độ Tác động**
4. **Bản chất Hiện tượng Số liệu (Core Insight)**
5. **Tác động Dòng tiền & Vốn huy động (Bank Impact)**
6. **Hạn chế Phương pháp & Giả định (Limitations)**

---

### PHÁT HIỆN 1: MỤC TIÊU KÉP & BẪY PHÂN BỐ HAI ĐỈNH Ở SỐ DƯ (DUAL BASELINE & BIMODAL BALANCE TRAP)

![Phân bố Số dư và Độ tuổi](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_02_balance_age_distribution.png)
*(Xem thêm biểu đồ phân bố Target: [fig_01_target_distribution.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_01_target_distribution.png))*

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Có phải khách hàng không có số dư trong tài khoản là nhóm dễ rời bỏ ngân hàng nhất không? Phân bố số dư thực tế như thế nào?*

* **2. Kiểm định Thống kê & Mức độ Tác động:**
  * Kiểm định phân bố số dư giữa nhóm Giữ chân vs Rời bỏ:
    * Mann-Whitney U test: $U = 9,146,842.0$, $p = 7.15 \times 10^{-20}$ ($p_{adj} < 0.001$).
    * Welch's t-test: $t = -11.96$, $p = 2.45 \times 10^{-32}$, Effect Size (Cohen's d): $-0.29$ (Mức độ tác động trung bình, có ý nghĩa thống kê cao).
  * Kiểm định tỷ lệ số dư bằng 0: Có **3,617 khách hàng (36.17%)** có số dư chính xác bằng 0.0 EUR.
  * Tỷ lệ rời bỏ ở nhóm có số dư = 0: **13.82%** (500/3,617).
  * Tỷ lệ rời bỏ ở nhóm có số dư > 0: **24.09%** (1,538/6,383) — Cao hơn gần gấp đôi nhóm số dư bằng 0!

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * Biến `Balance` có phân bố hai đỉnh dị biệt (Bimodal Zero-Inflated Distribution). Đỉnh 1 nằm tại mức 0 EUR (36.17%), đỉnh 2 tuân theo phân bố chuẩn xoay quanh mức 110,000 - 130,000 EUR.
  * Nhóm khách hàng có số dư 0 EUR chủ yếu sử dụng tài khoản như một kênh thanh toán phụ (thẻ tín dụng, chuyển khoản lẻ) nên rủi ro đóng tài khoản thấp. Ngược lại, nhóm khách hàng gửi tiền tiết kiệm lớn (>100,000 EUR) lại là nhóm rời bỏ mạnh nhất để tìm kiếm lãi suất hấp dẫn hơn.

* **4. Tác động Dòng tiền & Vốn huy động (Bank Impact):**
  * Tổng tiền gửi bị rút đi là **185.68 triệu EUR**. Toàn bộ khoản thất thoát này đến từ 1,538 khách hàng có số dư dương rời bỏ (bình quân mỗi khách hàng mang đi **120,729 EUR**).
  * Nếu các mô hình chỉ chuẩn hóa `Balance` bằng Standard Scaler thông thường mà không tách cờ `IsZeroBalance`, mô hình sẽ bị thiên lệch nghiêm trọng và đánh giá sai rủi ro ở nhóm khách hàng giàu có.

* **5. Hạn chế & Giả định:**
  * Dữ liệu hiện tại là lát cắt thời điểm (Cross-sectional Snapshot), không thể hiện chuỗi thời gian biến động số dư theo tháng để biết tiền gửi bị rút cạn từ từ hay rút sạch một lần trước khi đóng tài khoản.

---

### PHÁT HIỆN 2: TÂM CHẤN ĐỨC & KHỦNG HOẢNG THẤT THOÁT VỐN HUY ĐỘNG (THE GERMAN EPICENTER)

![Phân tích Thị trường Đức](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_10_multivariate_germany_active.png)
*(Xem thêm biểu đồ nhị biến quốc gia: [fig_04_bivariate_geography.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_04_bivariate_geography.png) và Bản đồ Dòng tiền: [fig_13_balance_at_risk_matrix.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_13_balance_at_risk_matrix.png))*

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Tại sao tỷ lệ rời bỏ tại thị trường Đức lại cao gấp đôi Pháp và Tây Ban Nha? Mức độ thất thoát vốn tại chi nhánh Đức chiếm bao nhiêu trong toàn ngân hàng?*

* **2. Kiểm định Thống kê & Mức độ Tác động:**
  * Chi-square test: $\chi^2 = 305.45$, $df = 2$, $p = 4.70 \times 10^{-67}$ ($p_{adj} < 0.001$).
  * Cramér's V: $0.175$ (Mức độ liên kết trung bình-mạnh).
  * Information Value (IV): $IV = 0.1679$ (Đặc trưng dự báo rất mạnh - Strong Predictor).
  * Thống kê chi tiết theo quốc gia:
    * **France:** 5,014 khách (50.14%), Churn Rate = **16.17%** (810 khách), Tiền gửi mất = 56.19M EUR.
    * **Spain:** 2,477 khách (24.77%), Churn Rate = **16.67%** (413 khách), Tiền gửi mất = 31.52M EUR.
    * **Germany:** 2,509 khách (25.09%), Churn Rate = **32.44%** (814 khách), Tiền gửi mất = **97.97M EUR**.

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * Thị trường Đức là một ngoại lệ cấu trúc: **100% khách hàng Đức đều có số dư dương** (0 khách hàng nào có số dư bằng 0!), với số dư trung bình đạt **119,730 EUR** (gần gấp đôi mức trung bình của Pháp là 62,094 EUR).
  * Khi phân tích đa chiều kết hợp với `IsActiveMember`: Khách hàng Đức không hoạt động (`IsActiveMember = 0`) có tỷ lệ rời bỏ kỷ lục **39.47%**. Ngay cả khách hàng Đức đang hoạt động tích cực (`IsActiveMember = 1`) vẫn rời bỏ tới **25.48%** (cao hơn cả nhóm không hoạt động ở Pháp là 21.32%).

* **4. Tác động Dòng tiền & Vốn huy động (Bank Impact):**
  * Dù chỉ chiếm 25.09% tổng số lượng khách hàng, thị trường Đức gây ra **52.76% tổng số tiền gửi bị rút khỏi ngân hàng (97.97 triệu EUR trên 185.68M EUR)**.
  * Cả 4 hạng thẻ (Diamond, Platinum, Gold, Silver) tại Đức đều thất thoát đều đặn từ 24 đến 26 triệu EUR mỗi hạng, cho thấy đây là vấn đề mang tính hệ thống của chi nhánh (lãi suất cạnh tranh kém, dịch vụ chăm sóc khách hàng VIP kém, hoặc đối thủ fintech/ngân hàng nội địa Đức đang hút vốn).

* **5. Hạn chế & Giả định:**
  * Tập dữ liệu không ghi nhận tên đối thủ cạnh tranh hay mức chênh lệch lãi suất huy động giữa EuroVanguard và các ngân hàng Đức (Deutsche Bank, Commerzbank, N26).

---

### PHÁT HIỆN 3: ĐẶC TRƯNG NHÂN KHẨU HỌC — NỮ GIỚI, ĐỘ TUỔI TRUNG NIÊN & SỰ BẤT HOẠT

![Bivariate Age & Activity](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_07_bivariate_age_active.png)
*(Xem thêm biểu đồ giới tính: [fig_05_bivariate_gender.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_05_bivariate_gender.png))*

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Độ tuổi, giới tính và tần suất tương tác giao dịch ảnh hưởng như thế nào đến quyết định rời bỏ?*

* **2. Kiểm định Thống kê & Mức độ Tác động:**
  * **Biến Độ tuổi (`Age`):**
    * Mann-Whitney U test: $U = 11,878,815.0$, $p = 2.78 \times 10^{-230}$ ($p_{adj} < 0.001$).
    * Cohen's d: $0.78$ (Tác động rất lớn - Large Effect Size).
    * Tuổi trung bình nhóm Giữ chân: **37.41 tuổi** (Median = 36).
    * Tuổi trung bình nhóm Rời bỏ: **44.84 tuổi** (Median = 45). Chênh lệch **+7.43 tuổi**.
    * Information Value: $IV = 0.7430$ (Đặc trưng phân loại mạnh nhất trong toàn bộ tập dữ liệu).
  * **Biến Trạng thái Hoạt động (`IsActiveMember`):**
    * $\chi^2 = 242.99$, $p = 9.07 \times 10^{-55}$ ($p_{adj} < 0.001$), $IV = 0.1535$.
    * Nhóm Không hoạt động (`0`): Churn Rate = **26.87%**.
    * Nhóm Có hoạt động (`1`): Churn Rate = **14.27%** (Giảm gần 50% rủi ro).
  * **Biến Giới tính (`Gender`):**
    * $\chi^2 = 112.92$, $p = 2.24 \times 10^{-26}$ ($p_{adj} < 0.001$), $IV = 0.0694$.
    * Nữ giới (Female): Churn Rate = **25.07%** (1,139/4,543).
    * Nam giới (Male): Churn Rate = **16.47%** (899/5,457). Nữ giới có rủi ro rời bỏ cao hơn 1.52 lần nam giới.

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * Khách hàng trung niên từ **45 đến 60 tuổi** là phân khúc có rủi ro cao nhất (tỷ lệ rời bỏ trên 50%). Đây là độ tuổi tích lũy tài sản đạt đỉnh, đòi hỏi các dịch vụ quản lý tài sản (Wealth Management) và tư vấn đầu tư chuyên biệt mà ngân hàng dường như chưa đáp ứng tốt.
  * Tương tác tích cực (`IsActiveMember = 1`) là lá chắn tự nhiên giúp giảm tỷ lệ rời bỏ ở mọi nhóm tuổi và giới tính.

* **4. Tác động Dòng tiền & Vốn huy động (Bank Impact):**
  * Nhóm khách hàng nữ giới mang lại khoản thất thoát tiền gửi **102.57 triệu EUR (chiếm 55.24% tổng vốn mất)**.
  * Nhóm không hoạt động (`IsActiveMember = 0`) làm thất thoát **109.84 triệu EUR (chiếm 59.16% tổng vốn mất)**.

* **5. Hạn chế & Giả định:**
  * Cần tuân thủ đạo đức AI (Fairness & Bias): Biến `Gender` không được sử dụng để định giá lãi suất phân biệt hoặc từ chối dịch vụ của khách hàng. Trong mô hình học máy, kịch bản Ablation Study A2 sẽ đánh giá tác động khi loại bỏ biến `Gender`.

---

### PHÁT HIỆN 4: BẪY BÁN CHÉO SẢN PHẨM & ĐƯỜNG CONG CHỮ U NGƯỢC (OVER-BUNDLING TRAP)

![Ma trận Tuổi x Số lượng Sản phẩm](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_11_multivariate_age_products.png)
*(Xem thêm biểu đồ nhị biến sản phẩm: [fig_06_bivariate_products.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_06_bivariate_products.png))*

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Có phải khách hàng sở hữu càng nhiều sản phẩm của ngân hàng thì càng trung thành không?*

* **2. Kiểm định Thống kê & Mức độ Tác động:**
  * $\chi^2 = 1,490.54$, $df = 3$, $p = 1.05 \times 10^{-322}$ ($p_{adj} < 0.001$).
  * Cramér's V: $0.386$ (Mức độ liên kết rất mạnh).
  * Information Value: $IV = 0.9833$ (Đặc trưng mang tính quyết định - Suspicious/Strong Predictor).
  * Chi tiết tỷ lệ rời bỏ theo số lượng sản phẩm:
    * **1 Sản phẩm:** 5,084 khách, Churn Rate = **27.71%** (1,409 khách).
    * **2 Sản phẩm:** 4,590 khách, Churn Rate = **7.60%** (349 khách) — **Vùng tối ưu (Sweet Spot)**!
    * **3 Sản phẩm:** 266 khách, Churn Rate = **82.71%** (220 khách) — Vùng rủi ro cực hạn.
    * **4 Sản phẩm:** 60 khách, Churn Rate = **100.00%** (60/60 khách đều rời bỏ)!

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * Tỷ lệ rời bỏ không tỷ lệ nghịch với số lượng sản phẩm mà vận động theo **Đường cong chữ U ngược (Inverted U-Curve)**:
    * Chuyển từ 1 sản phẩm lên 2 sản phẩm giúp giảm tỷ lệ rời bỏ từ 27.71% xuống 7.60% (giảm gần 4 lần rủi ro). Đây là bằng chứng cho thấy mối quan hệ gắn kết tài chính tốt (ví dụ: Tài khoản lương + Thẻ tín dụng/Thấu chi).
    * Tuy nhiên, khi nâng lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên 82.7% và 100%. Khi kết hợp với độ tuổi (Biểu đồ `fig_11`), khách hàng độ tuổi 41–60 sở hữu 3–4 sản phẩm có tỷ lệ rời bỏ tuyệt đối.
  * Nguyên nhân nghiệp vụ: Hiện tượng "Bán chéo cưỡng ép" (Aggressive Cross-Selling / Fee Churn). Việc ép mở quá nhiều tài khoản, gói bảo hiểm kèm theo, hoặc thẻ phụ phát sinh phí thường niên vô lý khiến khách hàng bức xúc và hủy toàn bộ dịch vụ.

* **4. Tác động Dòng tiền & Vốn huy động (Bank Impact):**
  * Nhóm 1 sản phẩm gây thất thoát **128.25 triệu EUR (69.07% tổng thất thoát)**.
  * Dù chỉ có 326 khách hàng dùng 3–4 sản phẩm, họ gây thất thoát tới **23.18 triệu EUR** tiền gửi huy động.

* **5. Hạn chế & Giả định:**
  * Dữ liệu không ghi nhận chi tiết loại sản phẩm cụ thể (Khoản vay mua nhà, Thấu chi, Bảo hiểm nhân thọ hay Tài khoản chứng khoán) mà chỉ có tổng số lượng 1, 2, 3, 4.

---

### PHÁT HIỆN 5: XẾP HẠNG GIÁ TRỊ THÔNG TIN (IV) & THANH LỌC BIẾN NHIỄU (NOISE FEATURE AUDIT)

![Xếp hạng WOE và IV](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_08_woe_iv_ranking.png)
*(Xem thêm ma trận tương quan: [fig_09_correlation_heatmap.png](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_09_correlation_heatmap.png))*

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Những biến số nào thực sự có năng lực giải thích quyết định rời bỏ, và những biến nào chỉ là nhiễu ngẫu nhiên (noise)?*

* **2. Bảng Xếp hạng Sức mạnh Dự báo (Information Value & Hypothesis Testing Ranking):**

| Biến số (Feature) | Information Value (IV) | Kiểm định Thống kê | P-value Hiệu chỉnh ($p_{adj}$) | Đánh giá Sức mạnh & Quyết định Pipeline |
| :--- | :---: | :---: | :---: | :--- |
| `Complain` | **12.6989** | $\chi^2 = 9,908.4$ | $< 10^{-300}$ | **Rò rỉ dữ liệu (Target Leakage)** — Phải loại khỏi mô hình sớm |
| `NumOfProducts` | **0.9833** | $\chi^2 = 1,490.5$ | $< 10^{-300}$ | **Cực kỳ mạnh (Decisive Driver)** — Giữ lại |
| `Age` (binned) | **0.7430** | Mann-Whitney U | $< 10^{-200}$ | **Rất mạnh (Strong Driver)** — Giữ lại & Tạo Feature vòng đời |
| `Geography` | **0.1679** | $\chi^2 = 305.5$ | $< 10^{-60}$ | **Mạnh (Strong Driver)** — Giữ lại (One-Hot Encoded) |
| `IsActiveMember` | **0.1535** | $\chi^2 = 243.0$ | $< 10^{-50}$ | **Mạnh (Strong Driver)** — Giữ lại |
| `Balance` (binned) | **0.0922** | Mann-Whitney U | $< 10^{-19}$ | **Trung bình (Medium Driver)** — Giữ lại & Tạo cờ `IsZeroBalance` |
| `Gender` | **0.0694** | $\chi^2 = 112.9$ | $< 10^{-25}$ | **Yếu-Trung bình (Weak-Medium)** — Giữ lại cho A, loại ở A2 (Fairness) |
| `Tenure` | **0.0087** | Mann-Whitney U | $0.852$ (Không có ý nghĩa) | **Nhiễu / Vô nghĩa (Uninformative)** — $IV < 0.02$ |
| `Card_Type` | **0.0031** | $\chi^2 = 2.11$ | $0.550$ (Không có ý nghĩa) | **Nhiễu / Vô nghĩa (Uninformative)** — $IV < 0.02$ |
| `Satisfaction_Score` | **0.0023** | Mann-Whitney U | $0.627$ (Không có ý nghĩa) | **Nhiễu / Nghịch lý (Uninformative)** — Loại ở kịch bản A1 |
| `CreditScore` | **0.0019** | Mann-Whitney U | $0.071$ (Không có ý nghĩa) | **Nhiễu / Rất yếu (Uninformative)** — $IV < 0.02$ |
| `Point_Earned` | **0.0012** | Mann-Whitney U | $0.742$ (Không có ý nghĩa) | **Nhiễu / Vô nghĩa (Uninformative)** — $IV < 0.02$ |
| `HasCrCard` | **0.0003** | $\chi^2 = 0.51$ | $0.476$ (Không có ý nghĩa) | **Nhiễu / Vô nghĩa (Uninformative)** — $IV < 0.02$ |
| `EstimatedSalary` | **0.0001** | Mann-Whitney U | $0.697$ (Không có ý nghĩa) | **Nhiễu / Vô nghĩa (Uninformative)** — $IV < 0.02$ |

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * Các biến thường được coi là trọng tâm như `CreditScore`, `EstimatedSalary`, `HasCrCard`, `Point_Earned` hoàn toàn không có sự khác biệt giữa hai nhóm khách hàng ở lại và rời bỏ ($p > 0.05$, $IV < 0.02$).
  * Điều này chứng minh hành vi rời bỏ tại EuroVanguard Bank không chịu ảnh hưởng bởi mức lương hay uy tín tín dụng, mà chịu tác động trực tiếp bởi **Tuổi tác, Sản phẩm, Chi nhánh Quốc gia và Trạng thái tương tác**.

* **4. Tác động Mô hình hóa & Kiến trúc Pipeline:**
  * Việc áp dụng thuật toán chọn đặc trưng tự động `SelectKBest(f_classif)` trong Scikit-learn Pipeline (tương ứng với phong cách của Notebook mẫu) sẽ giúp loại bỏ các biến nhiễu này, ngăn chặn hiện tượng quá khớp (Overfitting) và tăng cường độ vững cáp khi triển khai thực tế.

* **5. Hạn chế & Giả định:**
  * IV tính trên biến liên tục phụ thuộc vào số lượng phân khoảng (Quantile Bins = 5). Kết quả xếp hạng giữ nguyên tính nhất quán ngay cả khi thay đổi số khoảng từ 4 đến 10.

---

### PHÁT HIỆN 6: NGHỊCH LÝ DỊCH VỤ KHÁCH HÀNG & BẪY RÒ RỈ DỮ LIỆU CỦA BIẾN `COMPLAIN`

![Nghịch lý Khiếu nại và Hài lòng](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_12_complain_satisfaction_paradox.png)

* **1. Câu hỏi Nghiệp vụ Chẩn đoán:**  
  *Biến `Complain` và `Satisfaction_Score` có vai trò như thế nào? Tại sao điểm hài lòng cao vẫn không giữ được khách hàng đã khiếu nại?*

* **2. Kiểm định Thống kê & Mức độ Rò rỉ Dữ liệu:**
  * Bảng chéo tương quan giữa `Complain` và `Exited`:
    * Khách hàng **không khiếu nại (`Complain = 0`)**: 7,956 khách $\rightarrow$ 7,952 người ở lại, chỉ 4 người rời bỏ (**0.05% churn**).
    * Khách hàng **có khiếu nại (`Complain = 1`)**: 2,044 khách $\rightarrow$ 2,034 người rời bỏ (**99.51% churn**), chỉ 10 người ở lại.
    * Tỷ lệ đồng thuận (Concordance): **99.86%** (9,986/10,000 dòng trùng khớp hoàn toàn).
    * Hệ số tương quan Pearson: $r = 0.9957$.
  * Phân tích Nghịch lý Điểm Hài lòng (`Complain` × `Satisfaction_Score`):
    * Đối với khách hàng đã khiếu nại, dù họ chấm điểm giải quyết khiếu nại là 1 sao (99.5%), 2 sao (99.3%), 3 sao (99.5%), 4 sao (99.8%) hay 5 sao (99.2%), **tỷ lệ rời bỏ không hề thay đổi và đều tiệm cận 100%**!

* **3. Bản chất Hiện tượng Số liệu (Core Insight):**
  * **Về mặt Khoa học Dữ liệu (Target Leakage):** Biến `Complain` trong tập dữ liệu này thực chất là một biến đồng phát sinh hoặc được ghi nhận đồng thời với việc khách hàng đóng tài khoản (Hậu quả / Triệu chứng cuối cùng). Nếu đưa `Complain` vào mô hình dự báo sớm, mô hình sẽ bị "tê liệt học máy" (học vẹt quy tắc `If Complain == 1 Then Churn`), đạt AUC 0.99 nhưng vô dụng hoàn toàn trong việc cảnh báo sớm khi khách hàng chưa phát sinh khiếu nại.
  * **Về mặt Vận hành Ngân hàng (Operational Paradox):** Khảo sát `Satisfaction_Score` (1-5 sao) hiện tại chỉ là thủ tục hành chính hình thức ("khảo sát sau khi sự việc đã rồi"). Khi khách hàng đã phải bức xúc gửi đơn khiếu nại chính thức, họ đã sẵn sàng đóng tài khoản.

* **4. Giải pháp Kiến trúc Hệ thống (Dual Architecture Solution):**
  * **Mô hình Dự báo Sớm (Proactive Early-Warning ML Model):** Loại bỏ hoàn toàn `Complain` khỏi ma trận đặc trưng huấn luyện. Mô hình học cách nhận diện rủi ro dựa trên hành vi, dòng tiền, độ tuổi và mức độ gắn kết.
  * **Quy tắc Nghiệp vụ Cứng (Hard Business Rule Override):** Nếu hệ thống ghi nhận một khiếu nại phát sinh trong thực tế (`Complain == 1`), hệ thống tự động ghi đè điểm rủi ro lên **100% (Critical Alert)** và kích hoạt Quy trình Phản ứng Nhanh trong 4 giờ (**SLA 4-Hour Escalation Protocol**).

* **5. Hạn chế & Giả định:**
  * Tập dữ liệu không có nhãn chi tiết về nội dung khiếu nại (khiếu nại lỗi thẻ, mất tiền, thái độ nhân viên hay phí dịch vụ).

---

## 3. KIỂM ĐỊNH HIỆN TƯỢNG ĐA CỘNG TUYẾN (VIF ASSESSMENT)

Để chuẩn bị vững chắc cho giai đoạn Huấn luyện Mô hình Học máy (Giai đoạn 5), kiểm tra Hệ số Phóng đại Phương sai (Variance Inflation Factor - VIF) được thực hiện trên toàn bộ các biến số độc lập liên tục:

| Biến số (Feature) | Hệ số VIF ($VIF_i = 1 / (1 - R_i^2)$) | Ngưỡng Cảnh báo Chuẩn | Đánh giá Đa cộng tuyến |
| :--- | :---: | :---: | :--- |
| `NumOfProducts` | **1.104** | $< 5.0$ | Hoàn hảo — Không có đa cộng tuyến |
| `Balance` | **1.103** | $< 5.0$ | Hoàn hảo — Không có đa cộng tuyến |
| `Tenure` | **1.001** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |
| `Age` | **1.001** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |
| `Satisfaction_Score` | **1.001** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |
| `EstimatedSalary` | **1.001** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |
| `Point_Earned` | **1.001** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |
| `CreditScore` | **1.000** | $< 5.0$ | Hoàn hảo — Độc lập tuyến tính cao |

> [!NOTE]
> Tất cả các giá trị VIF đều xấp xỉ 1.0 (nhỏ hơn rất nhiều so với ngưỡng khắt khe 2.5 và ngưỡng cảnh báo 5.0). Điều này bảo đảm ma trận hiệp phương sai của các thuật toán tuyến tính (Logistic Regression) và thuật toán dựa trên cây (Random Forest, XGBoost) sẽ không bị bất ổn định do tương quan đa biến.

---

## 4. CHIẾN LƯỢC BÀN GIAO SANG GIAI ĐOẠN 4: KỸ THUẬT ĐẶC TRƯNG (FEATURE ENGINEERING)

Từ các bằng chứng thống kê vững chắc ở trên, 6 đặc trưng nghiệp vụ mới được thiết kế để giải quyết triệt để các cấu trúc phi tuyến tính đã phát hiện:

1. **`IsZeroBalance` (Cờ Tài khoản Số dư Không):**  
   *Công thức:* `Balance == 0 ? 1 : 0`  
   *Căn cứ:* Giải quyết bẫy phân bố 2 đỉnh (Bimodal Trap), tách biệt khách hàng chỉ dùng thẻ/thanh toán lẻ với khách hàng gửi tiết kiệm.
2. **`Balance_To_Salary_Ratio` (Tỷ lệ Số dư trên Thu nhập):**  
   *Công thức:* `Balance / (EstimatedSalary + 1)`  
   *Căn cứ:* Đo lường "độ sâu ví tiền" (Share of Wallet). Khách hàng có số dư vượt trội so với lương là nhóm có giá trị tiền gửi cao nhưng nhạy cảm với lãi suất.
3. **`Products_Per_Tenure` (Cường độ Mở rộng Sản phẩm):**  
   *Công thức:* `NumOfProducts / (Tenure + 1)` (cộng 1 để tránh lỗi chia cho 0 khi khách hàng mới có `Tenure = 0`).  
   *Căn cứ:* Phát hiện hiện tượng bị ép bán chéo quá nhanh trong thời gian ngắn.
4. **`Product_Holding_Risk_Tier` (Phân tầng Rủi ro Bán chéo):**  
   *Công thức:* Phân loại `Optimal (2 sản phẩm)`, `Moderate Risk (1 sản phẩm)`, `Extreme Danger (3-4 sản phẩm)`.  
   *Căn cứ:* Bắt trọn vẹn hiện tượng phi tuyến tính của đường cong chữ U ngược.
5. **`Age_Lifecycle_Stage` (Giai đoạn Vòng đời Khách hàng):**  
   *Công thức:* Phân nhóm `<30`, `30-40`, `41-50`, `51-60`, `>60`.  
   *Căn cứ:* Nắm bắt điểm gãy tâm lý và tích lũy tài sản tuổi trung niên.
6. **`Engagement_Score` (Chỉ số Tương tác Tổng hợp):**  
   *Công thức:* Điểm tích hợp từ `IsActiveMember`, `HasCrCard`, và tương tác sản phẩm.  
   *Căn cứ:* Củng cố khả năng dự báo của nhóm tương tác thấp.

---

## 5. KẾT LUẬN & DANH MỤC BIỂU ĐỒ BÁO CÁO

Toàn bộ 13 biểu đồ chuẩn độ phân giải cao (300 DPI) đã được khởi tạo và lưu trữ an toàn phục vụ công tác báo cáo và tích hợp lên Dashboard:
- `fig_01`: [Phân bố Target Exited](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_01_target_distribution.png)
- `fig_02`: [Phân bố Số dư & Tuổi (Zero-Inflation)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_02_balance_age_distribution.png)
- `fig_03`: [Tổng quan Biến Định tính (Demographics)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_03_demographics_univariate.png)
- `fig_04`: [Tỷ lệ Rời bỏ theo Quốc gia (Geography)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_04_bivariate_geography.png)
- `fig_05`: [Tỷ lệ Rời bỏ theo Giới tính (Gender)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_05_bivariate_gender.png)
- `fig_06`: [Tỷ lệ Rời bỏ theo Số lượng Sản phẩm (NumOfProducts)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_06_bivariate_products.png)
- `fig_07`: [Tương tác Độ tuổi & Trạng thái Hoạt động](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_07_bivariate_age_active.png)
- `fig_08`: [Xếp hạng Information Value (IV) & WOE](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_08_woe_iv_ranking.png)
- `fig_09`: [Ma trận Tương quan Tuyến tính Pearson](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_09_correlation_heatmap.png)
- `fig_10`: [Tâm chấn Đa biến Thị trường Đức (Germany x Active)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_10_multivariate_germany_active.png)
- `fig_11`: [Ma trận Bẫy Bán chéo (Age x NumOfProducts)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_11_multivariate_age_products.png)
- `fig_12`: [Nghịch lý Dịch vụ Khiếu nại (Complain x Satisfaction)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_12_complain_satisfaction_paradox.png)
- `fig_13`: [Bản đồ Nhiệt Dòng tiền Tiền gửi Thất thoát (Balance-at-Risk)](file:///D:/Machine_Learning_UDA/Bank_Customer_Churn/reports/figures/fig_13_balance_at_risk_matrix.png)
