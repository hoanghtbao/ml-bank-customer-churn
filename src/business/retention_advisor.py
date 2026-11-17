"""
Prescriptive Retention Advisor, Next-Best-Action (NBA) Engine,
Dynamic Call Script Generator, and Tiered ROI Calculator.
Roleplay: EuroVanguard Bank.
Standard: Gartner Prescriptive Analytics — Actionable Playbook.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np


def recommend_next_best_action(customer: Dict[str, Any]) -> Dict[str, Any]:
    """
    Determines the optimal Next-Best-Action (NBA) retention strategy
    based on customer behavioral drivers, country, balance, and complaint status.
    """
    complain = int(customer.get('Complain', 0))
    num_products = int(customer.get('NumOfProducts', 1))
    geography = str(customer.get('Geography', 'France'))
    balance = float(customer.get('Balance', 0.0))
    is_active = int(customer.get('IsActiveMember', 1))
    surname = str(customer.get('Surname', 'Khách hàng'))

    # Rule 1: Complaint Emergency Protocol
    if complain == 1:
        return {
            'strategy_code': 'S1_COMPLAINT_ESCALATION',
            'strategy_name': 'Ưu tiên Khẩn cấp Cấp 1: Xử lý Khiếu nại trong 4 Giờ (SLA 4-Hour Escalation)',
            'recommended_action': (
                f"Trưởng phòng Chăm sóc Khách hàng trực tiếp gọi điện tới khách hàng {surname} "
                "trong vòng 4 giờ làm việc. Lắng nghe, xác nhận lỗi vận hành, hoàn trả toàn bộ phí phát sinh "
                "(nếu có), và trao tặng gói miễn phí dịch vụ tài khoản cao cấp trong 6 tháng."
            ),
            'channel': 'Cuộc gọi Trực tiếp từ Cấp Quản lý Chi nhánh',
            'estimated_cost_eur': 200.0,
            'urgency': 'TỐI KHẨN (CRITICAL)'
        }

    # Rule 2: Over-bundling Trap (3-4 products)
    if num_products >= 3:
        return {
            'strategy_code': 'S2_PRODUCT_RATIONALIZATION',
            'strategy_name': 'Gỡ bẫy Bán chéo: Hợp nhất & Tinh gọn Gói Sản phẩm',
            'recommended_action': (
                f"Rà soát danh mục {num_products} sản phẩm của khách hàng {surname}. "
                "Chủ động đề xuất hủy các thẻ phụ hoặc tài khoản tiết kiệm không hoạt động để tránh phí thường niên, "
                "hoàn phí thường niên kỳ gần nhất, và tái cấu trúc về gói Combo 2 sản phẩm tối ưu "
                "(Tài khoản giao dịch chính + Thẻ tín dụng hoàn tiền)."
            ),
            'channel': 'Chuyên viên Khách hàng Cá nhân (Relationship Manager)',
            'estimated_cost_eur': 100.0,
            'urgency': 'CAO (HIGH)'
        }

    # Rule 3: German High-Balance Outflow
    if geography == 'Germany' and balance >= 80000.0:
        return {
            'strategy_code': 'S3_GERMAN_WEALTH_LOCK',
            'strategy_name': 'Đặc quyền Bảo toàn Vốn Chi nhánh Đức (German Wealth Protection)',
            'recommended_action': (
                f"Khách hàng {surname} đang duy trì số dư lớn ({balance:,.2f} EUR) tại chi nhánh Đức. "
                "Đề xuất gói tiền gửi kỳ hạn linh hoạt với lãi suất cộng thêm ưu đãi +0.50%/năm "
                "để cạnh tranh trực tiếp với ngân hàng nội địa, miễn phí dịch vụ chuyển tiền quốc tế, "
                "và chỉ định Private Banker quản lý riêng."
            ),
            'channel': 'Chuyên viên Quản lý Tài sản (Wealth Manager / Private Banker)',
            'estimated_cost_eur': 150.0,
            'urgency': 'CAO (HIGH)'
        }

    # Rule 4: Digital Inactivity
    if is_active == 0:
        return {
            'strategy_code': 'S4_DIGITAL_REENGAGEMENT',
            'strategy_name': 'Tái Kích hoạt Tài khoản & Tương tác Kênh số (Digital Re-engagement)',
            'recommended_action': (
                f"Kích hoạt chiến dịch tự động qua Ứng dụng Di động cho khách hàng {surname}. "
                "Gửi thông báo ưu đãi hoàn tiền 20 EUR cho 3 giao dịch thanh toán hóa đơn hoặc quẹt thẻ đầu tiên, "
                "hướng dẫn cài đặt tính năng quản lý chi tiêu thông minh trên ứng dụng."
            ),
            'channel': 'Push Notification App + Email Marketing Tự động',
            'estimated_cost_eur': 20.0,
            'urgency': 'TRUNG BÌNH (MEDIUM)'
        }

    # Rule 5: Standard Retention Care
    return {
        'strategy_code': 'S5_LOYALTY_MAINTENANCE',
        'strategy_name': 'Tri ân & Chăm sóc Khách hàng Thường niên (Loyalty Maintenance)',
        'recommended_action': (
            f"Tặng 500 điểm thưởng tích lũy (Reward Points) vào tài khoản khách hàng {surname}. "
            "Gửi thư điện tử tri ân và mời khách hàng đến chi nhánh gần nhất để rà soát danh mục tài chính định kỳ."
        ),
        'channel': 'Email Tự động + SMS CSKH',
        'estimated_cost_eur': 25.0,
        'urgency': 'TIÊU CHUẨN (STANDARD)'
    }


def generate_call_script(
    customer: Dict[str, Any],
    rm_name: str = "Nguyễn Văn A"
) -> str:
    """
    Generates a personalized, professional call script in Vietnamese
    for frontline relationship managers (RM), adhering strictly to customer privacy.
    (Never discloses internal AI churn risk scores to the customer).
    """
    surname = customer.get('Surname', 'Quý khách')
    gender = customer.get('Gender', 'Male')
    salutation = "Anh" if gender == 'Male' else "Chị"
    geography = customer.get('Geography', 'France')
    tenure = customer.get('Tenure', 0)
    balance = float(customer.get('Balance', 0.0))
    nba = recommend_next_best_action(customer)

    script = f"""================================================================================
KỊCH BẢN CHĂM SÓC KHÁCH HÀNG CÁ NHÂN HÓA (FRONT-LINE RETENTION CALL SCRIPT)
Ngân hàng: EuroVanguard Bank | Khách hàng: {salutation} {surname} | Chi nhánh: {geography}
Chuyên viên phụ trách: {rm_name} | Mã chiến lược: {nba['strategy_code']}
Mức độ ưu tiên: {nba['urgency']} | Kênh thực hiện: {nba['channel']}
================================================================================

[BƯỚC 1: LỜI CHÀO & TẠO SỰ GẮN KẾT ẤM ÁP]
"Dạ, em chào {salutation} {surname}! Em là {rm_name}, Chuyên viên Quản lý Quan hệ Khách hàng tại EuroVanguard Bank chi nhánh {geography}.
Trước hết, thay mặt ban lãnh đạo ngân hàng, em xin chân thành cảm ơn {salutation} đã đồng hành và tin tưởng gắn bó cùng EuroVanguard trong suốt {tenure} năm qua.
Hôm nay em liên hệ trực tiếp để kiểm tra xem quá trình trải nghiệm dịch vụ tài khoản của {salutation} có điều gì cần ngân hàng hỗ trợ thêm hay không ạ?"

[BƯỚC 2: TIẾP CẬN TẾ NHỊ DỰA TRÊN ĐẶC TRƯNG HÀNH VI]
"""
    if customer.get('Complain', 0) == 1:
        script += f"""\"Dạ thưa {salutation}, hệ thống ghi nhận gần đây {salutation} có phản ánh một vấn đề về dịch vụ tại chi nhánh. 
Em xin được đại diện ban điều hành chân thành gửi lời xin lỗi sâu sắc tới {salutation} vì sự bất tiện này. Em đang theo dõi trực tiếp hồ sơ của {salutation} và xin phép được xử lý dứt điểm ngay trong ngày hôm nay...\"
"""
    elif customer.get('NumOfProducts', 1) >= 3:
        script += f"""\"Dạ thưa {salutation}, em nhận thấy hiện tại {salutation} đang quản lý nhiều sản phẩm tài khoản và thẻ cùng lúc. 
Để giúp {salutation} tối ưu hóa chi phí phí thường niên và quản lý dòng tiền thuận tiện hơn, ngân hàng đang có chương trình 'Hợp nhất Sản phẩm Thông minh' giúp tiết kiệm phí quản lý định kỳ...\"
"""
    elif geography == 'Germany' and balance >= 80000.0:
        script += f"""\"Dạ thưa {salutation}, với tư cách là một trong những khách hàng tiền gửi tiêu biểu tại chi nhánh Đức, ngân hàng chúng em trân trọng mời {salutation} tham gia gói đặc quyền 'Bảo toàn & Tăng trưởng Vốn 2026' với chính sách lãi suất linh hoạt ưu đãi riêng biệt...\"
"""
    elif customer.get('IsActiveMember', 1) == 0:
        script += f"""\"Dạ thưa {salutation}, đợt này ứng dụng ngân hàng số EuroVanguard Mobile vừa nâng cấp nhiều tính năng chuyển tiền tự động và thanh toán không tiếp xúc rất tiện ích. 
Em muốn hỗ trợ {salutation} kích hoạt lại để nhận ngay các gói voucher ưu đãi dành riêng cho tài khoản của mình ạ...\"
"""
    else:
        script += f"""\"Dạ thưa {salutation}, nhân dịp tri ân khách hàng thân thiết, ngân hàng em có một số gói ưu đãi tích lũy điểm thưởng và miễn phí giao dịch muốn gửi trực tiếp tới {salutation}...\"
"""

    script += f"""
[BƯỚC 3: GIỚI THIỆU GÓI GIẢI PHÁP GIỮ CHÂN (NEXT-BEST-ACTION OFFER)]
"{nba['recommended_action']}"

[BƯỚC 4: LỜI KẾT & XÁC NHẬN HÀNH ĐỘNG]
"Dạ, em xin phép gửi thông tin chi tiết qua email và tin nhắn riêng của {salutation} ngay sau cuộc gọi này. 
Số điện thoại trực tiếp của em là [SĐT Nội bộ/Di động]. Bất kỳ lúc nào {salutation} cần hỗ trợ về tài khoản, {salutation} cứ gọi thẳng cho em nhé ạ! 
Em chúc {salutation} {surname} một ngày làm việc thật nhiều niềm vui và thành công ạ!"
================================================================================"""
    return script


def calculate_tiered_roi(
    df_scored: pd.DataFrame,
    vip_cost: float = 150.0,
    std_cost: float = 25.0,
    vip_save_rate: float = 0.40,
    std_save_rate: float = 0.25,
    margin_rate: float = 0.05,
    base_service_fee: float = 200.0
) -> Dict[str, Any]:
    """
    Calculates Tiered Financial ROI for customer retention campaign:
    - Tier Q1 (VIP At-Risk): High cost (personal banker), high success rate.
    - Tier Q2 (Standard At-Risk): Low cost (digital/app outreach), standard success rate.
    """
    if 'Quadrant' not in df_scored.columns:
        raise KeyError("Column 'Quadrant' must be present in DataFrame.")

    q1_mask = df_scored['Quadrant'] == 'Q1_VIP_At_Risk'
    q2_mask = df_scored['Quadrant'] == 'Q2_Standard_At_Risk'

    q1_df = df_scored[q1_mask]
    q2_df = df_scored[q2_mask]

    # Q1 Metrics
    q1_count = len(q1_df)
    q1_cost = q1_count * vip_cost
    q1_churners = q1_df['Exited'].sum() if 'Exited' in q1_df.columns else int(q1_df['Predicted_Probability'].sum())
    q1_saved_customers = q1_churners * vip_save_rate
    q1_balance_saved = (q1_df['Balance'].sum() / q1_count * q1_saved_customers) if q1_count > 0 else 0.0
    q1_clv_saved = q1_balance_saved * margin_rate + (q1_saved_customers * base_service_fee)
    q1_net_gain = q1_clv_saved - q1_cost
    q1_roi_pct = (q1_net_gain / q1_cost) * 100.0 if q1_cost > 0 else 0.0

    # Q2 Metrics
    q2_count = len(q2_df)
    q2_cost = q2_count * std_cost
    q2_churners = q2_df['Exited'].sum() if 'Exited' in q2_df.columns else int(q2_df['Predicted_Probability'].sum())
    q2_saved_customers = q2_churners * std_save_rate
    q2_balance_saved = (q2_df['Balance'].sum() / q2_count * q2_saved_customers) if q2_count > 0 else 0.0
    q2_clv_saved = q2_balance_saved * margin_rate + (q2_saved_customers * base_service_fee)
    q2_net_gain = q2_clv_saved - q2_cost
    q2_roi_pct = (q2_net_gain / q2_cost) * 100.0 if q2_cost > 0 else 0.0

    # Combined Total Metrics
    tot_targeted = q1_count + q2_count
    tot_cost = q1_cost + q2_cost
    tot_saved_customers = q1_saved_customers + q2_saved_customers
    tot_balance_saved = q1_balance_saved + q2_balance_saved
    tot_clv_saved = q1_clv_saved + q2_clv_saved
    tot_net_gain = tot_clv_saved - tot_cost
    tot_roi_pct = (tot_net_gain / tot_cost) * 100.0 if tot_cost > 0 else 0.0

    return {
        'Q1_VIP': {
            'targeted_count': q1_count,
            'intervention_cost_eur': round(q1_cost, 2),
            'expected_customers_saved': round(q1_saved_customers, 1),
            'deposit_volume_saved_m_eur': round(q1_balance_saved / 1e6, 2),
            'clv_value_saved_eur': round(q1_clv_saved, 2),
            'net_profit_eur': round(q1_net_gain, 2),
            'roi_pct': round(q1_roi_pct, 2)
        },
        'Q2_Standard': {
            'targeted_count': q2_count,
            'intervention_cost_eur': round(q2_cost, 2),
            'expected_customers_saved': round(q2_saved_customers, 1),
            'deposit_volume_saved_m_eur': round(q2_balance_saved / 1e6, 2),
            'clv_value_saved_eur': round(q2_clv_saved, 2),
            'net_profit_eur': round(q2_net_gain, 2),
            'roi_pct': round(q2_roi_pct, 2)
        },
        'Total_Campaign': {
            'total_targeted_count': tot_targeted,
            'total_intervention_cost_eur': round(tot_cost, 2),
            'total_customers_saved': round(tot_saved_customers, 1),
            'total_deposit_saved_m_eur': round(tot_balance_saved / 1e6, 2),
            'total_clv_saved_eur': round(tot_clv_saved, 2),
            'total_net_profit_eur': round(tot_net_gain, 2),
            'total_roi_pct': round(tot_roi_pct, 2)
        }
    }
