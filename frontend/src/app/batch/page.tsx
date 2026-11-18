"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import { FileSpreadsheet, Download, Filter, Search, RefreshCw, Upload, CheckCircle2 } from "lucide-react";

export default function BatchScoringPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ total_records: 10000, total_high_risk: 1530, total_balance_at_risk_m_eur: 145.2 });
  const [loading, setLoading] = useState(true);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const loadData = (riskOnly: boolean) => {
    setLoading(true);
    fetchApi(`/api/batch/portfolio-scored?limit=150&risk_only=${riskOnly}`)
      .then((res) => {
        setRecords(res.records || []);
        setKpis({
          total_records: res.total_records,
          total_high_risk: res.total_high_risk,
          total_balance_at_risk_m_eur: res.total_balance_at_risk_m_eur,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData(filterRiskOnly);
  }, [filterRiskOnly]);

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.Surname.toLowerCase().includes(q) ||
      r.CustomerId.toString().includes(q) ||
      r.Geography.toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      "CustomerId", "Surname", "Geography", "Gender", "Age", "Balance",
      "NumOfProducts", "IsActiveMember", "Complain", "Predicted_Probability",
      "Risk_Tier", "Quadrant", "Recommended_Strategy", "Channel", "Estimated_Cost_EUR"
    ];
    const rows = filteredRecords.map((r) => [
      r.CustomerId, `"${r.Surname}"`, r.Geography, r.Gender, r.Age, r.Balance,
      r.NumOfProducts, r.IsActiveMember, r.Complain, r.Predicted_Probability,
      r.Risk_Tier, r.Quadrant, `"${r.Recommended_Strategy}"`, `"${r.Channel}"`, r.Estimated_Cost_EUR
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "eurovanguard_retention_call_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        category="Batch Operational Workflow"
        title="Chấm Điểm & Phân Luồng Chiến Dịch Hàng Loạt (Batch Campaign Scoring)"
        subtitle="Xử lý danh sách khách hàng số lượng lớn, phân tầng rủi ro tự động và trích xuất danh sách gọi điện (Call-list) cho RM"
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Hồ Sơ Danh Mục
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpis.total_records?.toLocaleString()} Khách Hàng
          </div>
          <div className="text-xs text-slate-500 mt-2">Dữ liệu toàn ngân hàng đã nạp</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Khách Hàng Nguy Cơ Cao (≥ T*)
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {kpis.total_high_risk?.toLocaleString()} Khách
          </div>
          <div className="text-xs text-rose-600 mt-2 font-semibold">
            Chiếm ~15.3% toàn bộ danh mục
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Vốn Tiền Gửi Rủi Ro
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {kpis.total_balance_at_risk_m_eur}M €
          </div>
          <div className="text-xs text-amber-600 mt-2 font-semibold">
            Cần bảo toàn khẩn cấp
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo ID, Họ tên, Quốc gia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={filterRiskOnly}
              onChange={(e) => setFilterRiskOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Chỉ xem Nguy cơ cao (≥ 0.45)</span>
          </label>
        </div>

        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Call-List CSV Cho RM ({filteredRecords.length} KH)</span>
        </button>
      </div>

      {/* Scored Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Danh Sách Hồ Sơ Đã Chấm Điểm AI (Hiển thị Top {filteredRecords.length} khách)
          </div>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Mã KH</th>
                <th className="p-3.5">Họ Tên</th>
                <th className="p-3.5">Quốc Gia</th>
                <th className="p-3.5">Tuổi</th>
                <th className="p-3.5">Số Dư (€)</th>
                <th className="p-3.5">Số SP</th>
                <th className="p-3.5">Xác Suất Churn</th>
                <th className="p-3.5">Phân Tầng</th>
                <th className="p-3.5">Chiến Lược Gợi Ý</th>
                <th className="p-3.5">Kênh Can Thiệp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.CustomerId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500">{r.CustomerId}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.Surname}</td>
                    <td className="p-3.5">{r.Geography}</td>
                    <td className="p-3.5">{r.Age}</td>
                    <td className="p-3.5 font-mono font-semibold">{r.Balance.toLocaleString()} €</td>
                    <td className="p-3.5">{r.NumOfProducts}</td>
                    <td className="p-3.5">
                      <span className={`font-bold font-mono ${r.Predicted_Probability >= 0.45 ? "text-rose-600" : "text-emerald-600"}`}>
                        {(r.Predicted_Probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.Risk_Tier === "CRITICAL_RISK"
                          ? "bg-rose-100 text-rose-800"
                          : r.Risk_Tier === "HIGH_RISK"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {r.Risk_Tier}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-800 text-[11px] max-w-xs truncate" title={r.Recommended_Strategy}>
                      {r.Recommended_Strategy}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{r.Channel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
