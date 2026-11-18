"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import { Users, DollarSign, AlertTriangle, TrendingDown, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [kpis, setKpis] = useState({
    total_customers: 10000,
    total_balance_m_eur: 764.86,
    churn_headcount: 2038,
    churn_rate_pct: 20.38,
    balance_at_risk_m_eur: 185.68,
    balance_at_risk_pct: 24.28,
  });

  useEffect(() => {
    fetchApi("/api/dashboard/overview")
      .then((res) => {
        if (res && res.kpis) {
          setKpis(res.kpis);
        }
      })
      .catch((err) => console.log("Backend offline or loading defaults", err));
  }, []);

  return (
    <div>
      <PageHeader
        category="Hồ Sơ Doanh Nghiệp & Kiến Trúc Phân Tích"
        title="EuroVanguard Bank — Churn Analytics & Retention DSS"
        subtitle="Hệ thống quản trị rủi ro rời bỏ và ra quyết định giữ chân khách hàng (Thị trường: Pháp, Đức, Tây Ban Nha)"
      />

      {/* Dual Baseline KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Quy Mô Danh Mục</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.total_customers.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-blue-600 mt-2 flex items-center gap-1">
            <span>Pháp (50.1%), Đức (25.1%), TBN (24.8%)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Tiền Gửi Huy Động</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.total_balance_m_eur}M €
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            Nguồn vốn tiền gửi huy động
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Churn Đầu Người</span>
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
            {kpis.churn_rate_pct}%
          </div>
          <div className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
            <span>▼ 2,038 khách hàng rời bỏ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tiền Gửi Rủi Ro (At-Risk)</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
            {kpis.balance_at_risk_m_eur}M €
          </div>
          <div className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
            <span>▲ 24.28% tổng vốn (Chênh lệch +25.2%)</span>
          </div>
        </div>
      </div>

      {/* Gartner 4 Analytics Levels */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>Kiến Trúc 4 Tầng Phân Tích Doanh Nghiệp (Gartner Model)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                TẦNG 1 • DESCRIPTIVE
              </span>
              <span className="text-xs text-slate-400">Hiện tượng gì đang diễn ra?</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Phân Tích Mô Tả & Bẫy Tiền Gửi Hai Đỉnh</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Phát hiện cấu trúc bimodal đặc thù: <b>36.17% khách hàng (3,617 người) có số dư bằng 0 EUR</b>, tập trung chủ yếu ở Pháp và Tây Ban Nha. 
              Đặc biệt, khách hàng rời bỏ nắm giữ số dư trung bình <b>91,109 EUR</b>, cao hơn nhóm trung thành <b>+25.2%</b> (72,743 EUR).
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                TẦNG 2 • DIAGNOSTIC
              </span>
              <span className="text-xs text-slate-400">Tại sao hiện tượng này xảy ra?</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Chẩn Đoán Tâm Chấn Đức & Bẫy Bán Chéo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <b>Thị trường Đức là tâm chấn:</b> Tỷ lệ rời bỏ <b>32.44%</b>, 100% có số dư dương, gây thất thoát <b>97.97M EUR</b> (52.76% tổng vốn mất toàn ngân hàng). 
              <b>Đường cong chữ U ngược:</b> Khách dùng 2 sản phẩm là tối ưu nhất (churn 7.60%), nhưng khi ép lên 3-4 sản phẩm churn vọt lên <b>82.71% và 100.0%</b>!
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                TẦNG 3 • PREDICTIVE
              </span>
              <span className="text-xs text-slate-400">Ai sẽ rời bỏ tiếp theo?</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Mô Hình Cảnh Báo Sớm Proactive XGBoost</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khử triệt để rò rỉ nhãn <code>Complain</code> (tương quan 99.86%). 
              Kết quả kiểm thử độc lập 1 lần trên tập Test (1,500 khách): 
              Accuracy <b>84.67%</b>, ROC-AUC <b>0.8437</b> (95% CI: [0.8179, 0.8693]), F1 <b>0.5922</b> tại ngưỡng <b>T* = 0.45</b>. 
              <b>Decile 1 Lift 3.97x</b> (chặn đứng 39.67% lượng rời bỏ chỉ với 10% khách hàng rủi ro nhất).
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                TẦNG 4 • PRESCRIPTIVE
              </span>
              <span className="text-xs text-slate-400">Hành động gì để tối ưu ROI?</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Ma Trận 4 Quadrants & Mô Hình Tiered ROI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tập trung 90% nguồn lực vào <b>Q1 (VIP At-Risk)</b> — nhóm nắm giữ <b>242.81M EUR tiền gửi (31.75% toàn ngân hàng)</b>. 
              Chiến dịch giữ chân đầu tư ngân sách <b>303,700 EUR</b> giúp giữ lại <b>720 khách hàng</b>, bảo vệ <b>73.95M EUR</b> vốn tiền gửi, 
              mang lại lợi nhuận ròng <b>3.54 triệu EUR</b> (ROI <b>1,164.96%</b>).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Lối Tắt Truy Cập Nhanh Các Phân Hệ</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard"
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase mb-1">Báo Cáo Điều Hành</div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Khám phá Bảng Điều Hành
              </div>
              <div className="text-xs text-slate-500 mt-1">So sánh 3 quốc gia & đường cong chữ U</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/advisor"
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase mb-1">Tư Vấn Giữ Chân 1-1</div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Chấm Điểm & Kịch Bản RM
              </div>
              <div className="text-xs text-slate-500 mt-1">SLA 4 giờ, SHAP & Mô phỏng What-If</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/strategy"
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase mb-1">Chiến Lược & Tiered ROI</div>
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Máy Tính Lợi Nhuận Ròng
              </div>
              <div className="text-xs text-slate-500 mt-1">Ma trận 4 Quadrants & Mô phỏng tài chính</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
