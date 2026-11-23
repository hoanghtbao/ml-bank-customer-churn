"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Maximize2,
  Minimize2,
  Table,
  SlidersHorizontal,
  Sparkles,
  Info
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
    val: "82.5%",
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

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Sheet tab quick filters
      if (activeSheet === "Sheet2" && !r.Quadrant.includes("Q1")) return false;
      if (activeSheet === "Sheet3" && r.Geography !== "Germany") return false;

      // Risk only toggle
      if (filterRiskOnly && r.Predicted_Probability < 0.45) return false;

      // Country filter
      if (selectedCountry !== "ALL" && r.Geography !== selectedCountry) return false;

      // Search query
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

  // Sort logic
  const sortedRecords = useMemo(() => {
    const copy = [...filteredRecords];
    copy.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
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
      setSortAsc(false); // default descending
    }
  };

  // Excel Status Bar calculations
  const totalBalance = useMemo(() => {
    return sortedRecords.reduce((sum, r) => sum + r.Balance, 0);
  }, [sortedRecords]);

  const avgRisk = useMemo(() => {
    if (sortedRecords.length === 0) return 0;
    const sum = sortedRecords.reduce((s, r) => s + r.Predicted_Probability, 0);
    return (sum / sortedRecords.length) * 100;
  }, [sortedRecords]);

  // Export CSV
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
        subtitle="Mô phỏng bảng tính Excel chuyên nghiệp: Lưới dữ liệu Top 150 khách hàng, thanh công thức fx, đóng băng tiêu đề, và xuất tệp call-list cho Giám đốc Quan hệ Khách hàng (RM)"
        action={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#107c41] hover:bg-[#0d6535] text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel (.CSV)</span>
          </button>
        }
      />

      {/* 3 Executive Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Danh Mục Đã Chấm Điểm
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpis.total_records?.toLocaleString()} Khách Hàng
          </div>
          <div className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
            <span>Dữ liệu nạp từ kho data/processed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Số Lượng Rủi Ro Rời Bỏ Cao (≥ T*)
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {kpis.total_high_risk?.toLocaleString()} Khách Hàng
          </div>
          <div className="text-xs text-rose-600 mt-2 font-semibold">
            Chiếm 15.30% tổng quy mô toàn ngân hàng
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tiền Gửi Rủi Ro Cần Can Thiệp
          </div>
          <div className="text-2xl font-extrabold text-amber-500 tracking-tight">
            {kpis.total_balance_at_risk_m_eur}M €
          </div>
          <div className="text-xs text-amber-600 mt-2 font-semibold">
            Mục tiêu bảo vệ của chiến dịch giữ chân
          </div>
        </div>
      </div>

      {/* EXCEL SPREADSHEET WORKBOOK CONTAINER */}
      <div
        className={`bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          isExpandedView ? "fixed inset-4 z-50 overflow-auto bg-white" : ""
        }`}
      >
        {/* EXCEL TITLE BAR & RIBBON HEADER */}
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
                Mô hình: XGBoost Proactive &bull; Ngưỡng T* = 0.45 &bull; Chế độ Lưới Excel 60fps
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConditionalFormatting(!conditionalFormatting)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                conditionalFormatting ? "bg-white text-[#107c41]" : "bg-emerald-800 text-emerald-200"
              }`}
              title="Bật/Tắt thanh dữ liệu trực quan Data Bars"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{conditionalFormatting ? "Tô Màu: BẬT" : "Tô Màu: TẮT"}</span>
            </button>

            <button
              onClick={() => setIsExpandedView(!isExpandedView)}
              className="p-1.5 rounded-md hover:bg-white/10 text-emerald-100 transition-colors"
              title={isExpandedView ? "Thu nhỏ lưới" : "Xem toàn màn hình"}
            >
              {isExpandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* EXCEL FORMULA BAR (Thanh công thức fx) */}
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center gap-2 text-xs">
          {/* Name Box (Ô địa chỉ tọa độ) */}
          <div className="bg-white border border-slate-300 px-2.5 py-1 rounded font-mono font-bold text-slate-800 min-w-16 text-center shadow-inner">
            {selectedCell.col}
            {selectedCell.row}
          </div>

          <div className="h-4 w-px bg-slate-300"></div>

          {/* fx symbol */}
          <div className="font-serif italic font-bold text-slate-500 text-sm px-1">fx</div>

          {/* Formula Display Box */}
          <div className="flex-1 bg-white border border-slate-300 px-3 py-1 rounded font-mono text-slate-700 text-xs shadow-inner truncate">
            {typeof selectedCell.val === "number"
              ? `=VALUE(${selectedCell.val})`
              : `"${selectedCell.val}"`}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            (Nhấp chuột vào ô bất kỳ để chọn)
          </div>
        </div>

        {/* EXCEL QUICK FILTER / SEARCH BAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Box */}
            <div className="relative min-w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Lọc Họ, ID, Phân tầng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
              {[
                { label: "Tất cả", val: "ALL" },
                { label: "🇩🇪 Đức", val: "Germany" },
                { label: "🇫🇷 Pháp", val: "France" },
                { label: "🇪🇸 TBN", val: "Spain" },
              ].map((c) => (
                <button
                  key={c.val}
                  onClick={() => setSelectedCountry(c.val)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    selectedCountry === c.val
                      ? "bg-[#107c41] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Risk Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 ml-1">
              <input
                type="checkbox"
                checked={filterRiskOnly}
                onChange={(e) => setFilterRiskOnly(e.target.checked)}
                className="rounded text-[#107c41] focus:ring-[#107c41]"
              />
              <span>Chỉ khách nguy cơ cao (≥ 0.45)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              title="Nạp lại bảng tính"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <span className="text-[11px] font-mono text-slate-500">
              Hiển thị: <b>{sortedRecords.length}</b> / 150 dòng
            </span>
          </div>
        </div>

        {/* EXCEL GRID TABLE (Scrollable with Sticky Header) */}
        <div className="overflow-x-auto overflow-y-auto max-h-[580px] bg-white border-b border-slate-300">
          <table className="w-full border-collapse text-left font-sans text-xs">
            {/* 1. COLUMN LETTERS HEADER ROW (A, B, C, D... like Excel) */}
            <thead className="sticky top-0 z-20 bg-[#e2e8f0] text-slate-600 font-bold font-mono text-[11px] select-none shadow-xs">
              <tr className="border-b border-slate-300">
                {/* Top-left Corner Select All Cell */}
                <th className="w-12 border-r border-slate-300 bg-[#cbd5e1] text-center p-1 text-[10px] text-slate-500 font-sans">
                  ◢
                </th>
                <th className="border-r border-slate-300 text-center px-2 py-1">A</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">B</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">C</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">D</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">E</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">F</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">G</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">H</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">I</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">J</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">K</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">L</th>
                <th className="border-r border-slate-300 text-center px-2 py-1">M</th>
                <th className="text-center px-2 py-1">N</th>
              </tr>

              {/* 2. FIELD LABELS HEADER ROW */}
              <tr className="bg-[#f1f5f9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                <th className="border-r border-slate-300 text-center py-2 px-1 text-slate-400 font-mono">
                  #
                </th>

                {/* Column A: CustomerId */}
                <th
                  onClick={() => handleSort("CustomerId")}
                  className="border-r border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Mã KH</span>
                    {sortField === "CustomerId" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column B: Surname */}
                <th
                  onClick={() => handleSort("Surname")}
                  className="border-r border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Họ Tên Khách</span>
                    {sortField === "Surname" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column C: Geography */}
                <th
                  onClick={() => handleSort("Geography")}
                  className="border-r border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Quốc Gia</span>
                    {sortField === "Geography" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column D: Gender */}
                <th className="border-r border-slate-300 px-2 py-2 text-center">Giới Tính</th>

                {/* Column E: Age */}
                <th
                  onClick={() => handleSort("Age")}
                  className="border-r border-slate-300 px-2 py-2 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tuổi</span>
                    {sortField === "Age" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column F: Balance */}
                <th
                  onClick={() => handleSort("Balance")}
                  className="border-r border-slate-300 px-3 py-2 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Số Dư Tiền Gửi (€)</span>
                    {sortField === "Balance" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column G: NumOfProducts */}
                <th className="border-r border-slate-300 px-2 py-2 text-center">Số SP</th>

                {/* Column H: IsActiveMember */}
                <th className="border-r border-slate-300 px-2 py-2 text-center">Hoạt Động</th>

                {/* Column I: Complain */}
                <th className="border-r border-slate-300 px-2 py-2 text-center">Khiếu Nại</th>

                {/* Column J: Predicted Probability */}
                <th
                  onClick={() => handleSort("Predicted_Probability")}
                  className="border-r border-slate-300 px-3 py-2 text-right cursor-pointer hover:bg-slate-200 transition-colors min-w-36"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Xác Suất Churn (%)</span>
                    {sortField === "Predicted_Probability" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column K: Risk Tier */}
                <th
                  onClick={() => handleSort("Risk_Tier")}
                  className="border-r border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Phân Tầng Rủi Ro</span>
                    {sortField === "Risk_Tier" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column L: Quadrant */}
                <th
                  onClick={() => handleSort("Quadrant")}
                  className="border-r border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Ma Trận 4 Ô</span>
                    {sortField === "Quadrant" && (
                      <span className="text-emerald-700">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                {/* Column M: Recommended Strategy */}
                <th className="border-r border-slate-300 px-3 py-2 min-w-44">Chiến Lược Gợi Ý (NBA)</th>

                {/* Column N: Estimated Cost */}
                <th className="px-3 py-2 text-right">Chi Phí (€)</th>
              </tr>
            </thead>

            {/* 3. TABLE BODY (Excel Rows with crisp grid lines) */}
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400 bg-slate-50/50">
                    Không có dòng dữ liệu nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r, idx) => {
                  const rowNum = idx + 1;
                  const isHighRisk = r.Predicted_Probability >= 0.45;
                  const isCritical = r.Predicted_Probability >= 0.7;
                  const isSelectedRow = selectedCell.row === rowNum;

                  return (
                    <tr
                      key={r.CustomerId}
                      className={`transition-colors font-medium ${
                        isSelectedRow
                          ? "bg-emerald-50/70"
                          : idx % 2 === 0
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50/40 hover:bg-slate-100/60"
                      }`}
                    >
                      {/* Row Number Column (Sticky like Excel) */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "A", val: r.CustomerId })}
                        className={`border-r border-slate-300 text-center font-mono text-[10px] text-slate-500 select-none py-1.5 px-1 ${
                          isSelectedRow ? "bg-emerald-200/60 font-bold text-emerald-900" : "bg-slate-100"
                        }`}
                      >
                        {rowNum}
                      </td>

                      {/* Col A: CustomerId */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "A", val: r.CustomerId })}
                        className={`border-r border-slate-200 px-3 py-1.5 font-mono text-[11px] text-slate-600 ${
                          selectedCell.row === rowNum && selectedCell.col === "A"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.CustomerId}
                      </td>

                      {/* Col B: Surname */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "B", val: r.Surname })}
                        className={`border-r border-slate-200 px-3 py-1.5 font-bold text-slate-900 ${
                          selectedCell.row === rowNum && selectedCell.col === "B"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Surname}
                      </td>

                      {/* Col C: Geography */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "C", val: r.Geography })}
                        className={`border-r border-slate-200 px-3 py-1.5 ${
                          selectedCell.row === rowNum && selectedCell.col === "C"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>
                            {r.Geography === "Germany"
                              ? "🇩🇪"
                              : r.Geography === "France"
                              ? "🇫🇷"
                              : "🇪🇸"}
                          </span>
                          <span>{r.Geography}</span>
                        </span>
                      </td>

                      {/* Col D: Gender */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "D", val: r.Gender })}
                        className={`border-r border-slate-200 px-2 py-1.5 text-center text-slate-600 ${
                          selectedCell.row === rowNum && selectedCell.col === "D"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Gender}
                      </td>

                      {/* Col E: Age */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "E", val: r.Age })}
                        className={`border-r border-slate-200 px-2 py-1.5 text-right font-mono ${
                          selectedCell.row === rowNum && selectedCell.col === "E"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Age}
                      </td>

                      {/* Col F: Balance */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "F", val: r.Balance })}
                        className={`border-r border-slate-200 px-3 py-1.5 text-right font-mono font-semibold ${
                          r.Balance > 100000 ? "text-slate-900 font-bold" : "text-slate-700"
                        } ${
                          selectedCell.row === rowNum && selectedCell.col === "F"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>

                      {/* Col G: NumOfProducts */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "G", val: r.NumOfProducts })}
                        className={`border-r border-slate-200 px-2 py-1.5 text-center font-mono ${
                          r.NumOfProducts >= 3 ? "text-rose-600 font-bold" : ""
                        } ${
                          selectedCell.row === rowNum && selectedCell.col === "G"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.NumOfProducts}
                      </td>

                      {/* Col H: IsActiveMember */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "H", val: r.IsActiveMember })}
                        className={`border-r border-slate-200 px-2 py-1.5 text-center ${
                          selectedCell.row === rowNum && selectedCell.col === "H"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.IsActiveMember === 1 ? (
                          <span className="text-emerald-700 font-bold font-mono">1 (Active)</span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      {/* Col I: Complain */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "I", val: r.Complain })}
                        className={`border-r border-slate-200 px-2 py-1.5 text-center font-mono font-bold ${
                          r.Complain === 1 ? "bg-rose-100 text-rose-700" : "text-slate-400"
                        } ${
                          selectedCell.row === rowNum && selectedCell.col === "I"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px]"
                            : ""
                        }`}
                      >
                        {r.Complain === 1 ? "🚨 1" : "0"}
                      </td>

                      {/* Col J: Predicted Probability with Excel Data Bar */}
                      <td
                        onClick={() =>
                          setSelectedCell({
                            row: rowNum,
                            col: "J",
                            val: `${(r.Predicted_Probability * 100).toFixed(1)}%`,
                          })
                        }
                        className={`border-r border-slate-200 px-2 py-1.5 text-right relative overflow-hidden ${
                          selectedCell.row === rowNum && selectedCell.col === "J"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {/* Conditional Formatting Excel Data Bar Background */}
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
                              ? "text-rose-700 font-extrabold"
                              : isHighRisk
                              ? "text-amber-700 font-bold"
                              : "text-emerald-700"
                          }`}
                        >
                          {(r.Predicted_Probability * 100).toFixed(1)}%
                        </span>
                      </td>

                      {/* Col K: Risk Tier */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "K", val: r.Risk_Tier })}
                        className={`border-r border-slate-200 px-3 py-1.5 ${
                          selectedCell.row === rowNum && selectedCell.col === "K"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            r.Risk_Tier === "CRITICAL_RISK"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : r.Risk_Tier === "HIGH_RISK"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {r.Risk_Tier}
                        </span>
                      </td>

                      {/* Col L: Quadrant */}
                      <td
                        onClick={() => setSelectedCell({ row: rowNum, col: "L", val: r.Quadrant })}
                        className={`border-r border-slate-200 px-3 py-1.5 font-mono text-[10px] font-bold ${
                          r.Quadrant.includes("Q1")
                            ? "text-rose-700 bg-rose-50/30"
                            : r.Quadrant.includes("Q3")
                            ? "text-blue-700"
                            : "text-slate-700"
                        } ${
                          selectedCell.row === rowNum && selectedCell.col === "L"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Quadrant}
                      </td>

                      {/* Col M: Recommended Strategy */}
                      <td
                        onClick={() =>
                          setSelectedCell({ row: rowNum, col: "M", val: r.Recommended_Strategy })
                        }
                        className={`border-r border-slate-200 px-3 py-1.5 text-slate-800 text-[11px] truncate max-w-xs ${
                          selectedCell.row === rowNum && selectedCell.col === "M"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                        title={r.Recommended_Strategy}
                      >
                        {r.Recommended_Strategy}
                      </td>

                      {/* Col N: Estimated Cost */}
                      <td
                        onClick={() =>
                          setSelectedCell({ row: rowNum, col: "N", val: `${r.Estimated_Cost_EUR} €` })
                        }
                        className={`px-3 py-1.5 text-right font-mono font-semibold text-slate-700 ${
                          selectedCell.row === rowNum && selectedCell.col === "N"
                            ? "outline-2 outline-[#107c41] outline-offset-[-2px] bg-emerald-100/40"
                            : ""
                        }`}
                      >
                        {r.Estimated_Cost_EUR} €
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* EXCEL SHEET TABS & BOTTOM STATUS BAR */}
        <div className="bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
          {/* Left: Sheet Tabs (Sheet1, Sheet2, Sheet3) */}
          <div className="flex items-center border-b sm:border-b-0 sm:border-r border-slate-300 w-full sm:w-auto">
            {[
              { id: "Sheet1", label: "Sheet1: Top 150 Khách Hàng", icon: "📊" },
              { id: "Sheet2", label: "Sheet2: Q1 VIP At-Risk", icon: "⭐" },
              { id: "Sheet3", label: "Sheet3: Tâm Chấn Đức 🇩🇪", icon: "📍" },
            ].map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheet(sheet.id)}
                className={`px-4 py-2 text-xs font-bold border-r border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSheet === sheet.id
                    ? "bg-white text-[#107c41] border-t-2 border-t-[#107c41] shadow-xs"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{sheet.icon}</span>
                <span>{sheet.label}</span>
              </button>
            ))}
          </div>

          {/* Right: Excel Status Bar Metrics (Ready, Count, Sum, Average) */}
          <div className="flex items-center gap-4 px-4 py-1.5 font-mono text-[11px] text-slate-600 w-full sm:w-auto justify-end">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#107c41]"></span>
              SẴN SÀNG (READY)
            </span>
            <span className="border-l border-slate-300 pl-3">
              COUNT: <b>{sortedRecords.length}</b>
            </span>
            <span className="border-l border-slate-300 pl-3">
              SUM (€): <b>{totalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })} €</b>
            </span>
            <span className="border-l border-slate-300 pl-3">
              AVG CHURN: <b>{avgRisk.toFixed(1)}%</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
