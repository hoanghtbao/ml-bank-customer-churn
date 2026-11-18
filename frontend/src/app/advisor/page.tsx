"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { fetchApi } from "@/lib/api";
import {
  UserCheck, AlertTriangle, PhoneCall, ShieldAlert,
  Sparkles, Check, Copy, ArrowRight, RefreshCw, Sliders
} from "lucide-react";

const PRESET_PERSONAS = [
  {
    id: "preset1",
    label: "🇩🇪 VIP Đức Số dư lớn (German Wealth Outflow)",
    data: {
      CustomerId: 15700001, Surname: "Müller", Gender: "Male",
      Geography: "Germany", Age: 52, Tenure: 5, Balance: 145000.0,
      NumOfProducts: 1, HasCrCard: 1, IsActiveMember: 1,
      EstimatedSalary: 120000.0, Satisfaction_Score: 3,
      Card_Type: "DIAMOND", Point_Earned: 650, CreditScore: 680, Complain: 0
    }
  },
  {
    id: "preset2",
    label: "🇫🇷 Bẫy Bán chéo Quá mức (Over-bundled Trap)",
    data: {
      CustomerId: 15700002, Surname: "Dubois", Gender: "Female",
      Geography: "France", Age: 46, Tenure: 3, Balance: 75000.0,
      NumOfProducts: 4, HasCrCard: 1, IsActiveMember: 1,
      EstimatedSalary: 85000.0, Satisfaction_Score: 2,
      Card_Type: "GOLD", Point_Earned: 450, CreditScore: 610, Complain: 0
    }
  },
  {
    id: "preset3",
    label: "🚨 Khiếu nại Mở Khẩn cấp (SLA 4-Hour Escalation)",
    data: {
      CustomerId: 15700003, Surname: "Schneider", Gender: "Male",
      Geography: "Germany", Age: 44, Tenure: 4, Balance: 98000.0,
      NumOfProducts: 2, HasCrCard: 1, IsActiveMember: 1,
      EstimatedSalary: 95000.0, Satisfaction_Score: 1,
      Card_Type: "PLATINUM", Point_Earned: 520, CreditScore: 650, Complain: 1
    }
  },
  {
    id: "preset4",
    label: "🏆 Khách hàng Trung thành Điển hình (Optimal Loyal)",
    data: {
      CustomerId: 15700004, Surname: "Martin", Gender: "Female",
      Geography: "France", Age: 34, Tenure: 6, Balance: 45000.0,
      NumOfProducts: 2, HasCrCard: 1, IsActiveMember: 1,
      EstimatedSalary: 60000.0, Satisfaction_Score: 4,
      Card_Type: "SILVER", Point_Earned: 780, CreditScore: 720, Complain: 0
    }
  }
];

export default function RetentionAdvisorPage() {
  const [formData, setFormData] = useState(PRESET_PERSONAS[0].data);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // What-If state
  const [whatIfActive, setWhatIfActive] = useState(1);
  const [whatIfProducts, setWhatIfProducts] = useState(1);
  const [whatIfBalance, setWhatIfBalance] = useState(145000);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  const handleScore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi("/api/predict/single", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setPrediction(res);
      setWhatIfActive(formData.IsActiveMember);
      setWhatIfProducts(formData.NumOfProducts);
      setWhatIfBalance(formData.Balance);
      setWhatIfResult(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết nối với FastAPI Backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIfSimulate = async () => {
    setWhatIfLoading(true);
    try {
      const res = await fetchApi("/api/predict/what-If".replace("/what-If", "/what-if"), {
        method: "POST",
        body: JSON.stringify({
          customer: formData,
          sim_is_active: whatIfActive,
          sim_num_products: whatIfProducts,
          sim_balance: whatIfBalance,
        }),
      });
      setWhatIfResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setWhatIfLoading(false);
    }
  };

  const copyScript = () => {
    if (prediction?.call_script) {
      navigator.clipboard.writeText(prediction.call_script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <PageHeader
        category="1-on-1 Retention Advisory System"
        title="Tư Vấn Giữ Chân Khách Hàng Cá Nhân (Retention Advisor)"
        subtitle="Chấm điểm rủi ro thời gian thực, bóc tách giá trị tài chính, đề xuất Next-Best-Action và tạo kịch bản gọi điện"
      />

      {/* Preset Persona Quick Selectors */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          🎯 Nạp Nhanh Hồ Sơ Điển Hình Để Khảo Sát
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setFormData(p.data);
                setPrediction(null);
                setWhatIfResult(null);
              }}
              className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                formData.CustomerId === p.data.CustomerId
                  ? "bg-blue-50 border-blue-400 text-blue-900 shadow-sm"
                  : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Input Form (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            Hồ Sơ Khách Hàng
          </h2>

          <form onSubmit={handleScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Họ Tên</label>
                <input
                  type="text"
                  value={formData.Surname}
                  onChange={(e) => setFormData({ ...formData, Surname: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Quốc Gia</label>
                <select
                  value={formData.Geography}
                  onChange={(e) => setFormData({ ...formData, Geography: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="France">Pháp (France)</option>
                  <option value="Germany">Đức (Germany)</option>
                  <option value="Spain">Tây Ban Nha (Spain)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Độ Tuổi</label>
                <input
                  type="number"
                  value={formData.Age}
                  onChange={(e) => setFormData({ ...formData, Age: parseInt(e.target.value) || 18 })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Gắn Bó (Năm)</label>
                <input
                  type="number"
                  value={formData.Tenure}
                  onChange={(e) => setFormData({ ...formData, Tenure: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Credit Score</label>
                <input
                  type="number"
                  value={formData.CreditScore}
                  onChange={(e) => setFormData({ ...formData, CreditScore: parseInt(e.target.value) || 350 })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Số Dư Tiền Gửi (EUR)</label>
                <input
                  type="number"
                  value={formData.Balance}
                  onChange={(e) => setFormData({ ...formData, Balance: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Số Sản Phẩm (1-4)</label>
                <select
                  value={formData.NumOfProducts}
                  onChange={(e) => setFormData({ ...formData, NumOfProducts: parseInt(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value={1}>1 Sản phẩm</option>
                  <option value={2}>2 Sản phẩm (Sweet spot)</option>
                  <option value={3}>3 Sản phẩm</option>
                  <option value={4}>4 Sản phẩm</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Tương Tác Kênh Số</label>
                <select
                  value={formData.IsActiveMember}
                  onChange={(e) => setFormData({ ...formData, IsActiveMember: parseInt(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value={1}>Đang hoạt động (1)</option>
                  <option value={0}>Bất hoạt (0)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Khiếu Nại Mở</label>
                <select
                  value={formData.Complain}
                  onChange={(e) => setFormData({ ...formData, Complain: parseInt(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-rose-600 font-bold"
                >
                  <option value={0}>Không (0)</option>
                  <option value={1}>🚨 CÓ KHIẾU NẠI (1)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Chấm Điểm AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Đánh Giá Rủi Ro & Đề Xuất Giữ Chân</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Output & Decision Slip (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!prediction ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">Chưa có kết quả chấm điểm</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Nhấn nút &ldquo;Đánh Giá Rủi Ro & Đề Xuất Giữ Chân&rdquo; ở cột bên trái để mô hình AI phân tích và tạo kịch bản chăm sóc.
              </p>
            </div>
          ) : (
            <>
              {/* Emergency Alert if SLA complaint rule triggered */}
              {prediction.rule_override_applied && (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 animate-pulse flex items-start gap-3">
                  <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                      🚨 KÍCH HOẠT QUY TRÌNH KHẨN CẤP SLA 4-HOUR ESCALATION!
                    </h3>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      <b>Hard Business Rule:</b> Khách hàng đang có khiếu nại mở chưa giải quyết. Dữ liệu chứng minh <b>99.86%</b> khách hàng khiếu nại sẽ rời bỏ ngân hàng. 
                      Hồ sơ đã được chuyển tiếp khẩn cấp tới Trưởng phòng CSKH Chi nhánh để gọi điện trong vòng 4 giờ!
                    </p>
                  </div>
                </div>
              )}

              {/* Score Slip Header */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Khách Hàng: {prediction.Surname} (#{prediction.CustomerId})
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {(prediction.churn_probability * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          prediction.churn_probability >= 0.45
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {prediction.risk_tier}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="text-right text-xs space-y-1">
                    <div className="text-slate-500">Giá trị KH (V_annual): <b className="text-slate-800">{prediction.annual_customer_value_eur.toLocaleString()} €</b></div>
                    <div className="text-slate-500">Chi phí can thiệp (C_action): <b className="text-slate-800">{prediction.action_cost_eur} €</b></div>
                    <div className="text-slate-500">Ngưỡng hòa vốn T*: <b className="text-blue-600">{(prediction.break_even_threshold * 100).toFixed(1)}%</b></div>
                    <div className="font-bold text-emerald-600">
                      Lợi ích ròng kỳ vọng: {prediction.expected_net_gain_eur > 0 ? `+${prediction.expected_net_gain_eur.toLocaleString()} €` : `${prediction.expected_net_gain_eur.toLocaleString()} €`}
                    </div>
                  </div>
                </div>

                {/* NBA Strategy Box */}
                <div className="mt-5 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                    🎯 CHIẾN LƯỢC CAN THIỆP NEXT-BEST-ACTION (NBA)
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                    {prediction.next_best_action.strategy_name}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {prediction.next_best_action.recommended_action}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-blue-800">
                    <span>📞 Kênh: {prediction.next_best_action.channel}</span>
                    <span>💶 Ngân sách: {prediction.next_best_action.estimated_cost_eur} EUR</span>
                  </div>
                </div>

                {/* Call Script Box */}
                <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                      Kịch Bản Thoại RM Chuẩn Ngân Hàng
                    </span>
                    <button
                      onClick={copyScript}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto bg-slate-50/40">
                    {prediction.call_script}
                  </pre>
                </div>
              </div>

              {/* What-If Sensitivity Simulator */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Bộ Mô Phỏng Độ Nhạy Hành Vi (What-If Simulator)
                  </h3>
                  <button
                    onClick={handleWhatIfSimulate}
                    disabled={whatIfLoading}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                  >
                    {whatIfLoading ? "Đang tính..." : "Mô Phỏng Lại"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Giả định Tương tác</label>
                    <select
                      value={whatIfActive}
                      onChange={(e) => setWhatIfActive(parseInt(e.target.value))}
                      className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={1}>Hoạt động (Active = 1)</option>
                      <option value={0}>Bất hoạt (Inactive = 0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Giả định Số SP</label>
                    <select
                      value={whatIfProducts}
                      onChange={(e) => setWhatIfProducts(parseInt(e.target.value))}
                      className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={1}>1 Sản phẩm</option>
                      <option value={2}>2 Sản phẩm (Optimal)</option>
                      <option value={3}>3 Sản phẩm</option>
                      <option value={4}>4 Sản phẩm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Giả định Tiền gửi (€)</label>
                    <input
                      type="number"
                      step={5000}
                      value={whatIfBalance}
                      onChange={(e) => setWhatIfBalance(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {whatIfResult && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Xác suất Rời bỏ Mới:</div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {(whatIfResult.simulated_probability * 100).toFixed(1)}%{" "}
                        <span className={`text-xs font-bold ${whatIfResult.delta_probability < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ({whatIfResult.delta_probability > 0 ? `+${(whatIfResult.delta_probability * 100).toFixed(1)}%` : `${(whatIfResult.delta_probability * 100).toFixed(1)}%`})
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold max-w-xs text-right">
                      {whatIfResult.recommendation_note}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
