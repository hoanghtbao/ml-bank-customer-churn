"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import { formatInt, formatDecimal } from "@/lib/formatters";
import {
  FileSpreadsheet,
  Download,
  Search,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface ScoredCustomer {
  CustomerId: number;
  Surname: string;
  Geography: string;
  Gender: string;
  Age: number;
  Balance: number;
  NumOfProducts: number;
  IsActiveMember: number;
  Complain: number;
  Predicted_Probability: number;
  Risk_Tier: string;
  Quadrant: string;
  Recommended_Strategy: string;
  Channel: string;
  Estimated_Cost_EUR: number;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  Germany: "DE",
  France: "FR",
  Spain: "ES",
};

export default function BatchScoringPage() {
  const [records, setRecords] = useState<ScoredCustomer[]>([]);
  const [kpis, setKpis] = useState<any>({
    total_records: 10000,
    total_high_risk: 1530,
    total_balance_at_risk_m_eur: 185.68,
  });
  const [loading, setLoading] = useState(true);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof ScoredCustomer>("Predicted_Probability");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<string>("Sheet1");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: any }>({
    row: 1,
    col: "J",
    val: "82,5%",
  });
  const [conditionalFormatting, setConditionalFormatting] = useState(true);
  const [isExpandedView, setIsExpandedView] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchApi("/api/batch/portfolio-scored?limit=150&risk_only=false")
      .then((res) => {
        setRecords(res.records || []);
        if (res.total_records) {
          setKpis({
            total_records: res.total_records,
            total_high_risk: res.total_high_risk,
            total_balance_at_risk_m_eur: res.total_balance_at_risk_m_eur,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeSheet === "Sheet2" && !r.Quadrant.includes("Q1")) return false;
      if (activeSheet === "Sheet3" && r.Geography !== "Germany") return false;
      if (filterRiskOnly && r.Predicted_Probability < 0.45) return false;
      if (selectedCountry !== "ALL" && r.Geography !== selectedCountry) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.Surname.toLowerCase().includes(q) ||
          r.CustomerId.toString().includes(q) ||
          r.Geography.toLowerCase().includes(q) ||
          r.Risk_Tier.toLowerCase().includes(q) ||
          r.Quadrant.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [records, activeSheet, filterRiskOnly, selectedCountry, searchQuery]);

  const sortedRecords = useMemo(() => {
    const copy = [...filteredRecords];
    copy.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return copy;
  }, [filteredRecords, sortField, sortAsc]);

  const handleSort = (field: keyof ScoredCustomer) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalBalance = useMemo(() => {
    return sortedRecords.reduce((sum, r) => sum + r.Balance, 0);
  }, [sortedRecords]);

  const avgRisk = useMemo(() => {
    if (sortedRecords.length === 0) return 0;
    const sum = sortedRecords.reduce((s, r) => s + r.Predicted_Probability, 0);
    return (sum / sortedRecords.length) * 100;
  }, [sortedRecords]);

  const exportCsv = () => {
    if (sortedRecords.length === 0) return;
    const headers = [
      "CustomerId",
      "Surname",
      "Geography",
      "Gender",
      "Age",
      "Balance",
      "NumOfProducts",
      "IsActiveMember",
      "Complain",
      "Predicted_Probability",
      "Risk_Tier",
      "Quadrant",
      "Recommended_Strategy",
      "Channel",
      "Estimated_Cost_EUR",
    ];
    const rows = sortedRecords.map((r) => [
      r.CustomerId,
      `"${r.Surname}"`,
      r.Geography,
      r.Gender,
      r.Age,
      r.Balance,
      r.NumOfProducts,
      r.IsActiveMember,
      r.Complain,
      r.Predicted_Probability,
      r.Risk_Tier,
      r.Quadrant,
      `"${r.Recommended_Strategy}"`,
      `"${r.Channel}"`,
      r.Estimated_Cost_EUR,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BB_Bank_Scored_Portfolio_${activeSheet}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Batch Campaign Operations & Data Grid"
        title="Bảng Tính Chấm Điểm Danh Mục Khách Hàng (Excel Grid Simulator)"
        subtitle="Mô phỏng bảng tính Excel chuyên nghiệp: Lưới dữ liệu Top 150 khách hàng, thanh công thức fx, đóng băng tiêu đề, và xuất tệp call-list cho RM"
        action={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#107c41] hover:bg-[#0d6535] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel (.CSV)</span>
          </button>
        }
      />

      {/* 3 Executive Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 tabular-nums">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tổng Danh Mục Đã Chấm Điểm
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatInt(kpis.total_records || 0)} Khách Hàng
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
            Dữ liệu nạp từ kho data/processed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Số Lượng Rủi Ro Rời Bỏ Cao (&ge; T*)
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {formatInt(kpis.total_high_risk || 0)} Khách Hàng
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-semibold">
            Chiếm 15,30% tổng quy mô toàn ngân hàng
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tiền Gửi Rủi Ro Cần Can Thiệp
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatDecimal(kpis.total_balance_at_risk_m_eur || 0, 2)}M &euro;
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-semibold">
            Mục tiêu bảo vệ của chiến dịch giữ chân
          </div>
        </div>
      </div>

      {/* EXCEL SPREADSHEET WORKBOOK CONTAINER */}
      <div
        className={`bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
          isExpandedView ? "fixed inset-4 z-50 overflow-auto" : ""
        }`}
      >
        {/* EXCEL TITLE BAR */}
        <div className="bg-[#107c41] text-white px-4 py-2.5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/10 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-wide flex items-center gap-2">
                <span>BB_Bank_Scored_Portfolio_2026.xlsx</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-normal">
                  Đã lưu tự động
                </span>
              </div>
              <div className="text-[10px] text-emerald-100 font-mono">
                Mô hình: XGBoost Proactive &bull; Ngưỡng T* = 0,45 &bull; Chế độ Lưới Excel 60fps
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConditionalFormatting(!conditionalFormatting)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                conditionalFormatting ? "bg-white text-[#107c41]" : "bg-emerald-800 text-emerald-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{conditionalFormatting ? "Tô Màu: BẬT" : "Tô Màu: TẮT"}</span>
            </button>

            <button
              onClick={() => setIsExpandedView(!isExpandedView)}
              aria-label={isExpandedView ? "Thu nhỏ lưới" : "Xem toàn màn hình"}
              className="p-1.5 rounded-md hover:bg-white/10 text-emerald-100 transition-colors cursor-pointer"
            >
              {isExpandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* EXCEL FORMULA BAR */}
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 px-3 py-1.5 flex items-center gap-2 text-xs">
          <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded font-mono font-bold text-slate-800 dark:text-slate-100 min-w-16 text-center">
            {selectedCell.col}
            {selectedCell.row}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

          <div className="font-serif italic font-bold text-slate-500 dark:text-slate-400 text-sm px-1">fx</div>

          <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded font-mono text-slate-700 dark:text-slate-200 text-xs truncate">
            {typeof selectedCell.val === "number"
              ? `=VALUE(${selectedCell.val})`
              : `"${selectedCell.val}"`}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            (Nhấp chuột vào ô bất kỳ để chọn)
          </div>
        </div>

        {/* EXCEL FILTER & SEARCH BAR */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Lọc Họ, ID, Phân tầng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
              {[
                { label: "Tất cả", val: "ALL" },
                { label: "DE • Đức", val: "Germany" },
                { label: "FR • Pháp", val: "France" },
                { label: "ES • TBN", val: "Spain" },
              ].map((c) => (
                <button
                  key={c.val}
                  onClick={() => setSelectedCountry(c.val)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    selectedCountry === c.val
                      ? "bg-[#107c41] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300 ml-1">
              <input
                type="checkbox"
                checked={filterRiskOnly}
                onChange={(e) => setFilterRiskOnly(e.target.checked)}
                className="rounded text-[#107c41] focus:ring-[#107c41]"
              />
              <span>Chỉ khách nguy cơ cao (&ge; 0,45)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              aria-label="Nạp lại bảng tính"
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              Hiển thị: <b>{sortedRecords.length}</b> / 150 dòng
            </span>
          </div>
        </div>

        {/* EXCEL GRID TABLE */}
        <div className="overflow-x-auto overflow-y-auto max-h-[580px] bg-white dark:bg-slate-950 border-b border-slate-300 dark:border-slate-700">
          <table className="w-full border-collapse text-left font-sans text-xs tabular-nums">
            <thead className="sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono text-[11px] select-none shadow-xs">
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="w-12 border-r border-slate-300 dark:border-slate-700 bg-slate-300 dark:bg-slate-700 text-center p-1 text-[10px] text-slate-500 dark:text-slate-300 font-sans">
                  #
                </th>
                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"].map((col, idx) => (
                  <th
                    key={col}
                    className={`${idx < 13 ? "border-r border-slate-300 dark:border-slate-700" : ""} text-center px-2 py-1`}
                  >
                    {col}
                  </th>
                ))}
              </tr>

              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-300 dark:border-slate-700">
                <th className="border-r border-slate-300 dark:border-slate-700 text-center py-2 px-1 text-slate-400 font-mono">
                  STT
                </th>

                <th
                  onClick={() => handleSort("CustomerId")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Mã KH</span>
                    {sortField === "CustomerId" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("Surname")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Họ Tên Khách</span>
                    {sortField === "Surname" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("Geography")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Quốc Gia</span>
                    {sortField === "Geography" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th className="border-r border-slate-300 dark:border-slate-700 px-2 py-2 text-center">Giới Tính</th>

                <th
                  onClick={() => handleSort("Age")}
                  className="border-r border-slate-300 dark:border-slate-700 px-2 py-2 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tuổi</span>
                    {sortField === "Age" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("Balance")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Số Dư (&euro;)</span>
                    {sortField === "Balance" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th className="border-r border-slate-300 dark:border-slate-700 px-2 py-2 text-center">Số SP</th>
                <th className="border-r border-slate-300 dark:border-slate-700 px-2 py-2 text-center">Hoạt Động</th>
                <th className="border-r border-slate-300 dark:border-slate-700 px-2 py-2 text-center">Khiếu Nại</th>

                <th
                  onClick={() => handleSort("Predicted_Probability")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-w-36"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Xác Suất Churn (%)</span>
                    {sortField === "Predicted_Probability" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("Risk_Tier")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Phân Tầng Rủi Ro</span>
                    {sortField === "Risk_Tier" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("Quadrant")}
                  className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Ma Trận 4 Ô</span>
                    {sortField === "Quadrant" && (
                      <span className="text-emerald-600 dark:text-emerald-400">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th className="border-r border-slate-300 dark:border-slate-700 px-3 py-2 min-w-44">
                  Chiến Lược Gợi Ý (NBA)
                </th>

                <th className="px-3 py-2 text-right">Chi Phí (&euro;)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Không có dòng dữ liệu nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r, idx) => {
                  const rowNum = idx + 1;
                  const isHighRisk = r.Predicted_Probability >= 0.45;
                  const isCritical = r.Predicted_Probability >= 0.7;
                  const isSelectedRow = selectedCell.row === rowNum;

                  const cellBorder = "border-r border-slate-200 dark:border-slate-800";
                  const activeCellRing = "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/50 dark:bg-emerald-900/40";

                  return (
                    <tr
                      key={r.CustomerId}
                      className={`transition-colors font-medium ${
                        isSelectedRow
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30"
                          : idx % 2 === 0
                          ? "bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
                          : "bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "A", val: r.CustomerId })}
                        className={`border-r border-slate-300 dark:border-slate-700 text-center font-mono text-[10px] select-none py-1.5 px-1 cursor-pointer ${
                          isSelectedRow
                            ? "bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {rowNum}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "A", val: r.CustomerId })}
                        className={`${cellBorder} px-3 py-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "A" ? activeCellRing : ""
                        }`}
                      >
                        {r.CustomerId}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "B", val: r.Surname })}
                        className={`${cellBorder} px-3 py-1.5 font-bold text-slate-900 dark:text-white cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "B" ? activeCellRing : ""
                        }`}
                      >
                        {r.Surname}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "C", val: r.Geography })}
                        className={`${cellBorder} px-3 py-1.5 cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "C" ? activeCellRing : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {COUNTRY_CODE_MAP[r.Geography] || "EU"}
                          </span>
                          <span>{r.Geography}</span>
                        </span>
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "D", val: r.Gender })}
                        className={`${cellBorder} px-2 py-1.5 text-center text-slate-600 dark:text-slate-400 cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "D" ? activeCellRing : ""
                        }`}
                      >
                        {r.Gender}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "E", val: r.Age })}
                        className={`${cellBorder} px-2 py-1.5 text-right font-mono cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "E" ? activeCellRing : ""
                        }`}
                      >
                        {r.Age}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "F", val: r.Balance })}
                        className={`${cellBorder} px-3 py-1.5 text-right font-mono font-semibold cursor-pointer ${
                          r.Balance > 100000
                            ? "text-slate-900 dark:text-white font-bold"
                            : "text-slate-700 dark:text-slate-300"
                        } ${selectedCell.row === rowNum && selectedCell.col === "F" ? activeCellRing : ""}`}
                      >
                        {formatDecimal(r.Balance, 2)} &euro;
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "G", val: r.NumOfProducts })}
                        className={`${cellBorder} px-2 py-1.5 text-center font-mono cursor-pointer ${
                          r.NumOfProducts >= 3 ? "text-rose-600 dark:text-rose-400 font-bold" : ""
                        } ${selectedCell.row === rowNum && selectedCell.col === "G" ? activeCellRing : ""}`}
                      >
                        {r.NumOfProducts}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "H", val: r.IsActiveMember })}
                        className={`${cellBorder} px-2 py-1.5 text-center cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "H" ? activeCellRing : ""
                        }`}
                      >
                        {r.IsActiveMember === 1 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">1 (Active)</span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "I", val: r.Complain })}
                        className={`${cellBorder} px-2 py-1.5 text-center font-mono font-bold cursor-pointer ${
                          r.Complain === 1
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : "text-slate-400"
                        } ${selectedCell.row === rowNum && selectedCell.col === "I" ? activeCellRing : ""}`}
                      >
                        {r.Complain === 1 ? (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 1
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>

                      <td
                        onClick={() =>
                          setSelectedCell({
                            row: rowNum,
                            col: "J",
                            val: `${formatDecimal(r.Predicted_Probability * 100, 1)}%`,
                          })
                        }
                        className={`${cellBorder} px-2 py-1.5 text-right relative overflow-hidden cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "J" ? activeCellRing : ""
                        }`}
                      >
                        {conditionalFormatting && (
                          <div
                            className={`absolute left-0 top-0 bottom-0 opacity-20 pointer-events-none transition-all ${
                              isCritical ? "bg-rose-600" : isHighRisk ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(r.Predicted_Probability * 100, 100)}%` }}
                          />
                        )}

                        <span
                          className={`font-mono font-bold text-xs relative z-10 ${
                            isCritical
                              ? "text-rose-700 dark:text-rose-400 font-extrabold"
                              : isHighRisk
                              ? "text-amber-700 dark:text-amber-400 font-bold"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {formatDecimal(r.Predicted_Probability * 100, 1)}%
                        </span>
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "K", val: r.Risk_Tier })}
                        className={`${cellBorder} px-3 py-1.5 cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "K" ? activeCellRing : ""
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            r.Risk_Tier === "CRITICAL_RISK"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              : r.Risk_Tier === "HIGH_RISK"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {r.Risk_Tier}
                        </span>
                      </td>

                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "L", val: r.Quadrant })}
                        className={`${cellBorder} px-3 py-1.5 font-mono text-[10px] font-bold cursor-pointer ${
                          r.Quadrant.includes("Q1")
                            ? "text-rose-700 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20"
                            : r.Quadrant.includes("Q3")
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        } ${selectedCell.row === rowNum && selectedCell.col === "L" ? activeCellRing : ""}`}
                      >
                        {r.Quadrant}
                      </td>

                      <td
                        onClick={() =>
                          setSelectedCell({ row: rowNum, col: "M", val: r.Recommended_Strategy })
                        }
                        className={`${cellBorder} px-3 py-1.5 text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-xs cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "M" ? activeCellRing : ""
                        }`}
                        title={r.Recommended_Strategy}
                      >
                        {r.Recommended_Strategy}
                      </td>

                      <td
                        onClick={() =>
                          setSelectedCell({ row: rowNum, col: "N", val: `${r.Estimated_Cost_EUR} €` })
                        }
                        className={`px-3 py-1.5 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 cursor-pointer ${
                          selectedCell.row === rowNum && selectedCell.col === "N" ? activeCellRing : ""
                        }`}
                      >
                        {r.Estimated_Cost_EUR} &euro;
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* EXCEL SHEET TABS & BOTTOM STATUS BAR */}
        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center border-b sm:border-b-0 sm:border-r border-slate-300 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
            {[
              { id: "Sheet1", label: "Sheet1: Top 150 Khách Hàng" },
              { id: "Sheet2", label: "Sheet2: Q1 VIP At-Risk" },
              { id: "Sheet3", label: "Sheet3: Tâm Chấn Đức (DE)" },
            ].map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheet(sheet.id)}
                className={`px-4 py-2 text-xs font-bold border-r border-slate-300 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap ${
                  activeSheet === sheet.id
                    ? "bg-white dark:bg-slate-950 text-[#107c41] dark:text-emerald-400 border-t-2 border-t-[#107c41] dark:border-t-emerald-400 shadow-xs"
                    : "bg-slate-200/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {sheet.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 px-4 py-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-end tabular-nums">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#107c41] dark:bg-emerald-400" />
              SẴN SÀNG
            </span>
            <span className="border-l border-slate-300 dark:border-slate-700 pl-3">
              COUNT: <b>{formatInt(sortedRecords.length)}</b>
            </span>
            <span className="border-l border-slate-300 dark:border-slate-700 pl-3">
              SUM (&euro;): <b>{formatInt(totalBalance)} &euro;</b>
            </span>
            <span className="border-l border-slate-300 dark:border-slate-700 pl-3">
              AVG CHURN: <b>{formatDecimal(avgRisk, 1)}%</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
