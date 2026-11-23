"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/components/AppShell";
import { fetchApi } from "@/lib/api";
import { formatInt, formatDecimal, formatAuto, formatViDisplay } from "@/lib/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Sliders, ShieldAlert, RefreshCw, Gem, Smartphone, Landmark } from "lucide-react";

export default function StrategyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [quadrantData, setQuadrantData] = useState<any>(null);
  const [roiResult, setRoiResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [vipCost, setVipCost] = useState(150);
  const [stdCost, setStdCost] = useState(25);
  const [vipSaveRate, setVipSaveRate] = useState(40);
  const [stdSaveRate, setStdSaveRate] = useState(25);
  const [marginRate, setMarginRate] = useState(5.0);
  const [baseFee, setBaseFee] = useState(200);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchApi("/api/strategy/quadrants"),
      fetchApi("/api/strategy/roi-simulate", {
        method: "POST",
        body: JSON.stringify({
          vip_cost: vipCost,
          std_cost: stdCost,
          vip_save_rate: vipSaveRate / 100.0,
          std_save_rate: stdSaveRate / 100.0,
          margin_rate: marginRate / 100.0,
          base_service_fee: baseFee,
        }),
      }),
    ])
      .then(([qData, rData]) => {
        setQuadrantData(qData);
        setRoiResult(rData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await fetchApi("/api/strategy/roi-simulate", {
        method: "POST",
        body: JSON.stringify({
          vip_cost: vipCost,
          std_cost: stdCost,
          vip_save_rate: vipSaveRate / 100.0,
          std_save_rate: stdSaveRate / 100.0,
          margin_rate: marginRate / 100.0,
          base_service_fee: baseFee,
        }),
      });
      setRoiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading || !quadrantData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Đang tải Ma trận 4 Quadrants &amp; Mô hình ROI từ FastAPI...</span>
        </div>
      </div>
    );
  }

  const chartRoiData = roiResult
    ? [
        {
          name: "Q1: VIP At-Risk",
          "Chi phí (k €)": Math.round(roiResult.Q1_VIP.intervention_cost_eur / 1000),
          "Giá trị cứu (k €)": Math.round(roiResult.Q1_VIP.clv_value_saved_eur / 1000),
          "Lợi nhuận ròng (k €)": Math.round(roiResult.Q1_VIP.net_profit_eur / 1000),
        },
        {
          name: "Q2: Standard At-Risk",
          "Chi phí (k €)": Math.round(roiResult.Q2_Standard.intervention_cost_eur / 1000),
          "Giá trị cứu (k €)": Math.round(roiResult.Q2_Standard.clv_value_saved_eur / 1000),
          "Lợi nhuận ròng (k €)": Math.round(roiResult.Q2_Standard.net_profit_eur / 1000),
        },
        {
          name: "Toàn Chiến Dịch",
          "Chi phí (k €)": Math.round(roiResult.Total_Campaign.total_intervention_cost_eur / 1000),
          "Giá trị cứu (k €)": Math.round(roiResult.Total_Campaign.total_clv_saved_eur / 1000),
          "Lợi nhuận ròng (k €)": Math.round(roiResult.Total_Campaign.total_net_profit_eur / 1000),
        },
      ]
    : [];

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
        category="Prescriptive Strategy & Economic ROI"
        title="Chiến Lược Đề Xuất & Mô Phỏng Lợi Nhuận Ròng (Tiered ROI)"
        subtitle="Ma trận phân khúc 4 góc phần tư (Value × Risk) và bộ mô phỏng tính toán hiệu quả kinh tế chiến dịch thời gian thực"
      />

      {/* 4 Quadrants Table & Key Takeaway */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Bản Đồ Phân Khúc 4 Góc Phần Tư (Value &times; Risk Matrix)
        </h2>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">Phân Khúc</th>
                <th className="p-3">Mã</th>
                <th className="p-3">Số Lượng KH</th>
                <th className="p-3">Tỷ Trọng (%)</th>
                <th className="p-3">Tổng Tiền Gửi (M &euro;)</th>
                <th className="p-3">Tỷ Trọng Tiền Gửi (%)</th>
                <th className="p-3">Tỷ Lệ Churn Thực Tế (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {quadrantData.summary.map((q: any) => (
                <tr key={q.Quadrant_Code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{q.Quadrant_Name}</td>
                  <td className="p-3 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.Quadrant_Code === "Q1"
                          ? "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300"
                          : q.Quadrant_Code === "Q2"
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : q.Quadrant_Code === "Q3"
                          ? "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300"
                          : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {q.Quadrant_Code}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{formatInt(q.Customer_Count)}</td>
                  <td className="p-3">{formatViDisplay(q.Customer_Pct)}%</td>
                  <td className="p-3 font-mono font-semibold">{formatViDisplay(q.Total_Balance_M_EUR)}M &euro;</td>
                  <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">{formatViDisplay(q.Balance_Pct)}%</td>
                  <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{formatViDisplay(q.Actual_Churn_Pct)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 text-xs text-rose-800 dark:text-rose-200 leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <b>Tâm điểm sống còn Q1 (VIP At-Risk):</b> Nắm giữ <b>31,75% tổng vốn tiền gửi ngân hàng (242,81M EUR)</b> nhưng có tỷ lệ rời bỏ thực tế lên tới <b>74,14%</b>! Mọi chiến dịch tiếp cận 1-1 phải dồn 90% chi phí vào phân khúc này.
          </div>
        </div>
      </div>

      {/* Tiered ROI Simulator Cockpit */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Bộ Mô Phỏng Lợi Nhuận Ròng Thời Gian Thực (Tiered ROI Simulator)
          </h2>
          <button
            onClick={handleSimulate}
            disabled={simLoading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            {simLoading ? "Đang tính..." : "Cập Nhật Dòng Tiền"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 tabular-nums">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Phân Khúc Q1: VIP At-Risk</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Chi phí can thiệp Q1:</span>
                <b className="font-mono text-slate-900 dark:text-white">{vipCost} &euro;/KH</b>
              </div>
              <input
                type="range"
                aria-label="Chi phí can thiệp Q1"
                min={50}
                max={500}
                step={10}
                value={vipCost}
                onChange={(e) => setVipCost(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Tỷ lệ giữ chân Q1:</span>
                <b className="font-mono text-slate-900 dark:text-white">{vipSaveRate}%</b>
              </div>
              <input
                type="range"
                aria-label="Tỷ lệ giữ chân Q1"
                min={10}
                max={80}
                step={5}
                value={vipSaveRate}
                onChange={(e) => setVipSaveRate(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Phân Khúc Q2: Standard At-Risk</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Chi phí can thiệp Q2:</span>
                <b className="font-mono text-slate-900 dark:text-white">{stdCost} &euro;/KH</b>
              </div>
              <input
                type="range"
                aria-label="Chi phí can thiệp Q2"
                min={5}
                max={100}
                step={5}
                value={stdCost}
                onChange={(e) => setStdCost(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Tỷ lệ giữ chân Q2:</span>
                <b className="font-mono text-slate-900 dark:text-white">{stdSaveRate}%</b>
              </div>
              <input
                type="range"
                aria-label="Tỷ lệ giữ chân Q2"
                min={5}
                max={60}
                step={5}
                value={stdSaveRate}
                onChange={(e) => setStdSaveRate(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Biên Lãi Ròng Ngân Hàng</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Biên lãi NIM trên tiền gửi:</span>
                <b className="font-mono text-slate-900 dark:text-white">{formatDecimal(marginRate, 1)}%/năm</b>
              </div>
              <input
                type="range"
                aria-label="Biên lãi NIM trên tiền gửi"
                min={1.0}
                max={10.0}
                step={0.5}
                value={marginRate}
                onChange={(e) => setMarginRate(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Phí dịch vụ cơ sở:</span>
                <b className="font-mono text-slate-900 dark:text-white">{formatInt(baseFee)} &euro;/năm</b>
              </div>
              <input
                type="range"
                aria-label="Phí dịch vụ cơ sở"
                min={50}
                max={1000}
                step={50}
                value={baseFee}
                onChange={(e) => setBaseFee(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* Dynamic ROI Metrics */}
        {roiResult && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 tabular-nums">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng Chi Phí Đầu Tư</div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatInt(roiResult.Total_Campaign.total_intervention_cost_eur)} &euro;
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Khách Hàng Cứu Được</div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {formatInt(roiResult.Total_Campaign.total_customers_saved)} KH
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tiền Gửi Bảo Toàn</div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatDecimal(roiResult.Total_Campaign.total_deposit_saved_m_eur, 2)}M &euro;
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Lợi Nhuận Ròng (Net Gain)</div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  +{formatInt(roiResult.Total_Campaign.total_net_profit_eur)} &euro;
                </div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Tỷ suất ROI: {formatDecimal(roiResult.Total_Campaign.total_roi_pct, 1)}%
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRoiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke={axisStroke} fontSize={12} />
                  <YAxis stroke={axisStroke} fontSize={12} unit="k €" tickFormatter={(v) => formatAuto(v)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => (typeof val === "number" ? formatAuto(val) : val)} />
                  <Legend />
                  <Bar dataKey="Chi phí (k €)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Giá trị cứu (k €)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lợi nhuận ròng (k €)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
