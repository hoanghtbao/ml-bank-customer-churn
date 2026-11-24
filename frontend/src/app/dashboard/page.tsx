"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import ApiStatusState from "@/components/ApiStatusState";
import FigureGallery from "@/components/FigureGallery";
import { EDA_FIGURES } from "@/lib/chartCatalog";
import { useTheme } from "@/components/AppShell";
import { fetchApi } from "@/lib/api";
import { formatInt, formatDecimal, formatAuto } from "@/lib/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
  CartesianGrid,
} from "recharts";
import { Landmark, TrendingDown, AlertTriangle, Zap, LayoutDashboard, Images } from "lucide-react";

interface DashboardOverviewData {
  kpis: {
    total_customers: number;
    churn_rate_pct: number;
    churn_headcount: number;
    total_balance_m_eur: number;
    balance_at_risk_m_eur: number;
    balance_at_risk_pct: number;
  };
  country_distribution: Record<string, string | number>[];
  product_holding_curve: Record<string, string | number>[];
  age_lifecycle: Record<string, string | number>[];
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"executive" | "eda_gallery">("executive");
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    fetchApi("/api/dashboard/overview")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Dashboard API temporarily unavailable:", err?.message || err);
        setApiError(
          "Không thể tải dữ liệu từ http://127.0.0.1:8000/api/dashboard/overview. Hãy kiểm tra dịch vụ FastAPI (:8000)."
        );
        setLoading(false);
      });
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setApiError(null);
    fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpis = data?.kpis;
  const countryData = data?.country_distribution;
  const productData = data?.product_holding_curve;
  const ageData = data?.age_lifecycle;

  const gridStroke = isDark ? "#1e293b" : "#f1f5f9";
  const axisStroke = isDark ? "#94a3b8" : "#64748b";
  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    borderRadius: "12px",
    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  return (
    <div>
      <PageHeader
        category="Descriptive & Diagnostic Analytics"
        title="Báo Cáo Quản Trị Điều Hành (Executive Dashboard)"
        subtitle="Chẩn đoán thất thoát nguồn vốn tiền gửi, tâm chấn thị trường Đức và bẫy bán chéo sản phẩm"
      />

      {/* Segmented View Switcher: Executive View vs 13 EDA Defense Charts */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Chế độ xem Báo cáo Điều hành"
          className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "executive"}
            onClick={() => setActiveTab("executive")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap ${
              activeTab === "executive"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Bảng Điều Hành (Executive)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "eda_gallery"}
            onClick={() => setActiveTab("eda_gallery")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap ${
              activeTab === "eda_gallery"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>Kho Biểu Đồ Phân Tích EDA</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                activeTab === "eda_gallery"
                  ? "bg-blue-50 dark:bg-white/20 text-blue-700 dark:text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              13
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {activeTab === "executive"
            ? "Chế độ trình bày Ban Giám Đốc BB Bank"
            : "Bộ 13 biểu đồ EDA phục vụ giải thích chuyên sâu & phản biện"}
        </span>
      </div>

      {activeTab === "eda_gallery" ? (
        <FigureGallery figures={EDA_FIGURES} columns={3} enableFilter />
      ) : loading || !data || !kpis ? (
        <ApiStatusState
          loading={loading}
          error={apiError}
          loadingText="Đang tải số liệu Báo cáo Điều hành từ FastAPI..."
          onRetry={handleRetry}
        />
      ) : (
        <>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 tabular-nums">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tổng Danh Mục Quản Lý
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatInt(kpis.total_customers)} KH
          </div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2">
            100% Khách hàng cá nhân
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tỷ Lệ Rời Bỏ Đầu Người
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatDecimal(kpis.churn_rate_pct, 2)}%
          </div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
            {formatInt(kpis.churn_headcount)} khách rời bỏ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tổng Nguồn Vốn Tiền Gửi
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatDecimal(kpis.total_balance_m_eur, 2)}M &euro;
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            764,86M EUR toàn ngân hàng
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tiền Gửi Bị Thất Thoát
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatDecimal(kpis.balance_at_risk_m_eur, 2)}M &euro;
          </div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
            {formatDecimal(kpis.balance_at_risk_pct, 2)}% tổng vốn tiền gửi
          </div>
        </div>
      </div>

      {/* Chart Row 1: Country & Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                1. Tâm Chấn Quốc Gia: Tỷ Lệ Churn (%) vs Vốn Thất Thoát (M &euro;)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Đức là tâm điểm với tỷ lệ rời bỏ gấp đôi Pháp và Tây Ban Nha
              </p>
            </div>
            <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="country" stroke={axisStroke} fontSize={12} />
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} unit="%" tickFormatter={(v) => formatAuto(v)} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} unit="M" tickFormatter={(v) => formatAuto(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => (typeof val === "number" ? formatAuto(val) : val)} />
                <Legend />
                <Bar yAxisId="left" dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="lost_balance_m_eur" name="Vốn mất (M EUR)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 text-xs text-rose-800 dark:text-rose-200 leading-relaxed flex items-start gap-2">
            <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <b>Tâm chấn Đức:</b> Tỷ lệ rời bỏ tại Đức là <b>32,44%</b>, 100% khách hàng có tiền gửi dương (TB 119.730 EUR), làm thất thoát <b>97,97M EUR (52,76% tổng vốn mất toàn ngân hàng)</b>.
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                2. Bẫy Bán Chéo: Đường Cong Chữ U Ngược ở Số Sản Phẩm
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                2 sản phẩm là điểm vàng tối ưu (Sweet spot)
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="num_products" stroke={axisStroke} fontSize={12} unit=" SP" />
                <YAxis stroke={axisStroke} fontSize={12} unit="%" tickFormatter={(v) => formatAuto(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => (typeof val === "number" ? formatAuto(val) : val)} />
                <Bar dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/70 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b>Bẫy bán chéo:</b> Sở hữu 2 sản phẩm có tỷ lệ rời bỏ thấp nhất (chỉ <b>7,60%</b>). Khi ép bán chéo lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên <b>82,71% và 100,0%</b> do quá tải dịch vụ.
            </div>
          </div>
        </div>
      </div>

      {/* Age Lifecycle Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-1">
          3. Tỷ Lệ Rời Bỏ Theo Nhóm Tuổi &amp; Trạng Thái Tương Tác Kênh Số
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Nhóm trung niên (adult_mature: 45–59 tuổi) có tỷ lệ rời bỏ cao kỷ lục 49,45%
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="age_group" stroke={axisStroke} fontSize={12} />
              <YAxis stroke={axisStroke} fontSize={12} unit="%" tickFormatter={(v) => formatAuto(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => (typeof val === "number" ? formatAuto(val) : val)} />
              <Legend />
              <Bar dataKey="active_churn_rate_pct" name="Đang hoạt động (Active)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactive_churn_rate_pct" name="Bất hoạt (Inactive)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
