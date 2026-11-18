"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Line, ComposedChart, Legend, CartesianGrid
} from "recharts";
import { Landmark, TrendingDown, DollarSign, AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
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
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Đang tải số liệu Báo cáo Điều hành từ FastAPI...</span>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;
  const countryData = data.country_distribution;
  const productData = data.product_holding_curve;
  const ageData = data.age_lifecycle;

  return (
    <div>
      <PageHeader
        category="Descriptive & Diagnostic Analytics"
        title="Báo Cáo Quản Trị Điều Hành (Executive Dashboard)"
        subtitle="Chẩn đoán thất thoát nguồn vốn tiền gửi, tâm chấn thị trường Đức và bẫy bán chéo sản phẩm"
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Danh Mục Quản Lý
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpis.total_customers.toLocaleString()} KH
          </div>
          <div className="text-xs font-semibold text-blue-600 mt-2">
            100% Khách hàng cá nhân
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tỷ Lệ Rời Bỏ Đầu Người
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {kpis.churn_rate_pct}%
          </div>
          <div className="text-xs font-semibold text-rose-600 mt-2">
            ▼ {kpis.churn_headcount.toLocaleString()} khách rời bỏ
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Nguồn Vốn Tiền Gửi
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpis.total_balance_m_eur}M €
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            764.86M EUR toàn ngân hàng
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tiền Gửi Bị Thất Thoát
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {kpis.balance_at_risk_m_eur}M €
          </div>
          <div className="text-xs font-semibold text-rose-600 mt-2">
            ▲ {kpis.balance_at_risk_pct}% tổng vốn tiền gửi
          </div>
        </div>
      </div>

      {/* Chart Row 1: Country & Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Country Breakdown Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Tâm Chấn Quốc Gia: Tỷ Lệ Churn (%) vs Vốn Thất Thoát (Triệu EUR)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đức là tâm điểm với tỷ lệ rời bỏ gấp đôi Pháp và Tây Ban Nha
              </p>
            </div>
            <Landmark className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="country" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#2563eb" fontSize={12} unit="M" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="lost_balance_m_eur" name="Vốn mất (M EUR)" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800 leading-relaxed">
            ⚡ <b>Tâm chấn Đức:</b> Tỷ lệ rời bỏ tại Đức là <b>32.44%</b>, 100% khách hàng có tiền gửi dương (TB 119,730 EUR), làm thất thoát <b>97.97M EUR (52.76% tổng vốn mất toàn ngân hàng)</b>.
          </div>
        </div>

        {/* Product Holding Curve Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Bẫy Bán Chéo: Đường Cong Chữ U Ngược ở Số Lượng Sản Phẩm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                2 sản phẩm là điểm vàng tối ưu (Sweet spot)
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="num_products" stroke="#64748b" fontSize={12} unit=" Sản phẩm" />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="churn_rate_pct" name="Tỷ lệ Churn (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 leading-relaxed">
            ⚠️ <b>Bẫy bán chéo:</b> Sở hữu 2 sản phẩm có tỷ lệ rời bỏ thấp nhất (chỉ <b>7.60%</b>). Khi ép bán chéo lên 3 hoặc 4 sản phẩm, tỷ lệ rời bỏ tăng vọt lên <b>82.71% và 100.0%</b> do quá tải dịch vụ.
          </div>
        </div>
      </div>

      {/* Age Lifecycle Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
          3. Tỷ Lệ Rời Bỏ Theo Nhóm Tuổi & Trạng Thái Tương Tác Kênh Số
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Nhóm trung niên (adult_mature: 45–59 tuổi) có tỷ lệ rời bỏ cao kỷ lục 49.45%
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="age_group" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
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
