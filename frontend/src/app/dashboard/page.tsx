"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/components/AppShell";
import { fetchApi } from "@/lib/api";
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
import { Landmark, TrendingDown, AlertTriangle, RefreshCw, Zap } from "lucide-react";

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/api/dashboard/overview")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Đang tải số liệu Báo cáo Điều hành từ FastAPI...</span>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;
  const countryData = data.country_distribution;
  const productData = data.product_holding_curve;
  const ageData = data.age_lifecycle;

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

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 tabular-nums">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tổng Danh Mục Quản Lý
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {kpis.total_customers.toLocaleString()} KH
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
            {kpis.churn_rate_pct}%
          </div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
            {kpis.churn_headcount.toLocaleString()} khách rời bỏ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tổng Nguồn Vốn Tiền Gửi
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {kpis.total_balance_m_eur}M &euro;
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            764.86M EUR toàn ngân hàng
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tiền Gửi Bị Thất Thoát
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {kpis.balance_at_risk_m_eur}M &euro;
          </div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
            {kpis.balance_at_risk_pct}% tổng vốn tiền gửi
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
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} unit="M" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="lost_balance_m_eur" name="Vốn mất (M EUR)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 text-xs text-rose-800 dark:text-rose-200 leading-relaxed flex items-start gap-2">
            <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <b>Tâm chấn Đức:</b> Tỷ lệ rời bỏ tại Đức là <b>32.44%</b>, 100% khách hàng có tiền gửi dương (TB 119,730 EUR), làm thất thoát <b>97.97M EUR (52.76% tổng vốn mất toàn ngân hàng)</b>.
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
                <YAxis stroke={axisStroke} fontSize={12} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/70 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <b>Bẫy bán chéo:</b> Sở hữu 2 sản phẩm có tỷ lệ rời bỏ thấp nhất (chỉ <b>7.60%</b>). Khi ép bán chéo lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên <b>82.71% và 100.0%</b> do quá tải dịch vụ.
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
          Nhóm trung niên (adult_mature: 45–59 tuổi) có tỷ lệ rời bỏ cao kỷ lục 49.45%
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="age_group" stroke={axisStroke} fontSize={12} />
              <YAxis stroke={axisStroke} fontSize={12} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="active_churn_rate_pct" name="Đang hoạt động (Active)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactive_churn_rate_pct" name="Bất hoạt (Inactive)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
