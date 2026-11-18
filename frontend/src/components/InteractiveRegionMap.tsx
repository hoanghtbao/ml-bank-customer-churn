"use client";

import { useState } from "react";
import {
  Globe2,
  AlertTriangle,
  TrendingDown,
  Users,
  DollarSign,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Activity
} from "lucide-react";
import Link from "next/link";

interface CountryStat {
  code: string;
  name: string;
  flag: string;
  customers: number;
  pctCustomers: string;
  totalBalanceMEur: string;
  churnRatePct: string;
  churners: number;
  balanceAtRiskMEur: string;
  riskStatus: string;
  isEpicenter: boolean;
  color: string;
  hubs: { name: string; x: number; y: number; role: string; isMain?: boolean }[];
}

const COUNTRIES_DATA: Record<string, CountryStat> = {
  Germany: {
    code: "DE",
    name: "Cộng Hòa Liên Bang Đức (Germany)",
    flag: "🇩🇪",
    customers: 2509,
    pctCustomers: "25.09%",
    totalBalanceMEur: "300.40M €",
    churnRatePct: "32.44%",
    churners: 814,
    balanceAtRiskMEur: "97.97M €",
    riskStatus: "TÂM CHẤN NGUY CƠ CAO (Chiếm 52.76% tổng vốn thoát)",
    isEpicenter: true,
    color: "#f59e0b",
    hubs: [
      { name: "Frankfurt am Main", x: 575, y: 225, role: "EuroVanguard HQ & ECB Hub", isMain: true },
      { name: "Berlin", x: 675, y: 135, role: "Retail Analytics Center" },
      { name: "Munich", x: 635, y: 275, role: "Bavaria Wealth Management" },
      { name: "Hamburg", x: 595, y: 110, role: "Northern Trade Hub" }
    ]
  },
  France: {
    code: "FR",
    name: "Cộng Hòa Pháp (France)",
    flag: "🇫🇷",
    customers: 5014,
    pctCustomers: "50.14%",
    totalBalanceMEur: "311.30M €",
    churnRatePct: "16.17%",
    churners: 811,
    balanceAtRiskMEur: "55.82M €",
    riskStatus: "THỊ TRƯỜNG LỚN NHẤT & TỶ LỆ RỜI BỎ ỔN ĐỊNH",
    isEpicenter: false,
    color: "#3b82f6",
    hubs: [
      { name: "Paris", x: 425, y: 225, role: "France National Retail HQ", isMain: true },
      { name: "Lyon", x: 475, y: 310, role: "Rhône-Alpes Commercial Hub" },
      { name: "Marseille", x: 470, y: 385, role: "Mediterranean Financial Center" },
      { name: "Bordeaux", x: 355, y: 330, role: "Atlantic Wealth Division" }
    ]
  },
  Spain: {
    code: "ES",
    name: "Vương Quốc Tây Ban Nha (Spain)",
    flag: "🇪🇸",
    customers: 2477,
    pctCustomers: "24.77%",
    totalBalanceMEur: "153.16M €",
    churnRatePct: "16.67%",
    churners: 413,
    balanceAtRiskMEur: "31.89M €",
    riskStatus: "THỊ TRƯỜNG TIỀM NĂNG & THANH KHOẢN TĂNG TRƯỞNG",
    isEpicenter: false,
    color: "#10b981",
    hubs: [
      { name: "Madrid", x: 320, y: 465, role: "Iberian Peninsula HQ", isMain: true },
      { name: "Barcelona", x: 425, y: 435, role: "Catalonia Digital Payments" },
      { name: "Seville", x: 275, y: 545, role: "Andalusia Regional Center" },
      { name: "Valencia", x: 395, y: 490, role: "Mediterranean Operations" }
    ]
  }
};

export default function InteractiveRegionMap() {
  const [selectedCountry, setSelectedCountry] = useState<string>("Germany");
  const [hoveredHub, setHoveredHub] = useState<any>(null);

  const activeData = COUNTRIES_DATA[selectedCountry] || COUNTRIES_DATA["Germany"];

  return (
    <div className="relative overflow-hidden bg-[#091426] border-2 border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-2xl">
      {/* Background Subtle Radar Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      
      {/* Dynamic ambient background glow based on selected country */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
        style={{
          background:
            selectedCountry === "Germany"
              ? "radial-gradient(circle, #f59e0b 0%, transparent 70%)"
              : selectedCountry === "France"
              ? "radial-gradient(circle, #3b82f6 0%, transparent 70%)"
              : "radial-gradient(circle, #10b981 0%, transparent 70%)",
        }}
      ></div>

      {/* COMMAND CENTER HEADER BAR */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
              TRI-MARKET SURVEILLANCE RADAR &bull; LIVE TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] text-slate-300 font-mono">
              3 Vùng Hoạt Động Cốt Lõi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Bản Đồ Vùng Hoạt Động & Tâm Chấn Rủi Ro Châu Âu</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Giám sát mạng lưới 10,000 khách hàng và 764.86M € tiền gửi tại Pháp, Đức và Tây Ban Nha.
            Nhấp chuột vào từng quốc gia hoặc thành phố để kiểm tra số liệu hoạt động tức thời.
          </p>
        </div>

        {/* Country Quick Switchers */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-shrink-0">
          {[
            { id: "Germany", label: "🇩🇪 Đức (Tâm chấn)", highlight: "text-amber-400" },
            { id: "France", label: "🇫🇷 Pháp (50.1%)", highlight: "text-blue-400" },
            { id: "Spain", label: "🇪🇸 Tây Ban Nha", highlight: "text-emerald-400" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountry === c.id
                  ? "bg-slate-800 text-white shadow-md border border-slate-700 " + c.highlight
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAP AND TELEMETRY HUD GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* INTERACTIVE VECTOR MAP CANVAS (8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2 sm:p-4 relative overflow-hidden flex items-center justify-center min-h-[460px]">
          {/* Coordinate Watermarks */}
          <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-600 select-none">
            LAT: 36°N - 55°N &bull; LON: -10°W - 15°E (WESTERN EUROPE)
          </div>
          <div className="absolute bottom-3 right-4 text-[9px] font-mono text-slate-600 select-none">
            EUROVANGUARD SECURE GIS v2.4
          </div>

          <svg
            viewBox="120 70 650 530"
            className="w-full h-auto max-h-[500px] select-none"
            style={{ filter: "drop-shadow(0 0 25px rgba(15, 23, 42, 0.8))" }}
          >
            <defs>
              {/* Country Gradients */}
              <linearGradient id="grad-germany" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grad-france" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grad-spain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* CONTEXTUAL NEIGHBOR OUTLINES (Subtle slate paths) */}
            {/* United Kingdom */}
            <path
              d="M 340 140 L 380 90 L 410 80 L 420 120 L 380 150 L 330 160 Z"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Portugal */}
            <path
              d="M 200 400 L 240 440 L 250 500 L 260 560 L 240 570 L 210 550 L 205 480 L 200 400 Z"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Italy */}
            <path
              d="M 520 370 L 560 380 L 590 420 L 640 490 L 620 520 L 570 450 L 525 390 Z"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Switzerland / Austria */}
            <path
              d="M 525 250 L 565 295 L 620 295 L 670 280 L 680 310 L 580 330 L 510 290 Z"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Belgium / Netherlands */}
            <path
              d="M 480 195 L 440 170 L 470 140 L 515 130 L 535 160 L 520 220 Z"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* 1. SPAIN POLYGON (Southwest) */}
            <path
              d="M 350 390 L 420 410 L 435 435 L 425 465 L 410 490 L 390 530 L 350 560 L 310 580 L 270 580 L 260 560 L 250 500 L 240 440 L 200 400 L 205 375 L 260 375 L 310 375 Z"
              fill={selectedCountry === "Spain" ? "url(#grad-spain)" : "#10b98115"}
              stroke="#10b981"
              strokeWidth={selectedCountry === "Spain" ? "2.5" : "1.5"}
              className="transition-all duration-300 cursor-pointer hover:fill-emerald-500/30"
              onClick={() => setSelectedCountry("Spain")}
            />

            {/* 2. FRANCE POLYGON (Center) */}
            <path
              d="M 290 225 L 340 215 L 380 180 L 440 170 L 480 195 L 520 220 L 515 260 L 510 290 L 485 330 L 520 370 L 470 395 L 420 410 L 370 405 L 350 390 L 340 330 L 330 260 Z"
              fill={selectedCountry === "France" ? "url(#grad-france)" : "#3b82f615"}
              stroke="#3b82f6"
              strokeWidth={selectedCountry === "France" ? "2.5" : "1.5"}
              className="transition-all duration-300 cursor-pointer hover:fill-blue-500/30"
              onClick={() => setSelectedCountry("France")}
            />

            {/* 3. GERMANY POLYGON (Northeast - EPICENTER) */}
            <path
              d="M 520 220 L 530 180 L 535 160 L 570 90 L 610 85 L 640 85 L 670 110 L 700 130 L 690 180 L 690 210 L 655 240 L 670 280 L 620 295 L 565 295 L 525 250 Z"
              fill={selectedCountry === "Germany" ? "url(#grad-germany)" : "#f59e0b15"}
              stroke="#f59e0b"
              strokeWidth={selectedCountry === "Germany" ? "3" : "1.5"}
              strokeDasharray={selectedCountry === "Germany" ? "none" : "none"}
              className="transition-all duration-300 cursor-pointer hover:fill-amber-500/30"
              onClick={() => setSelectedCountry("Germany")}
            />

            {/* ANIMATED TELEMETRY INTER-HUB ARCS */}
            {/* Frankfurt <-> Paris */}
            <path
              d="M 575 225 Q 500 195 425 225"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-dash-flow opacity-80"
            />
            {/* Frankfurt <-> Madrid */}
            <path
              d="M 575 225 Q 460 350 320 465"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-dash-flow opacity-80"
            />
            {/* Paris <-> Madrid */}
            <path
              d="M 425 225 Q 360 340 320 465"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-dash-flow opacity-80"
            />

            {/* COUNTRY BADGE LABELS */}
            <text x="310" y="440" fill="#34d399" fontSize="12" fontWeight="bold" letterSpacing="1">
              ESPAÑA
            </text>
            <text x="400" y="300" fill="#60a5fa" fontSize="12" fontWeight="bold" letterSpacing="1">
              FRANCE
            </text>
            <text x="615" y="190" fill="#fbbf24" fontSize="12" fontWeight="bold" letterSpacing="1">
              DEUTSCHLAND
            </text>

            {/* GLOWING PULSING CITY HUBS (All 3 Countries) */}
            {Object.values(COUNTRIES_DATA).flatMap((country) =>
              country.hubs.map((hub) => {
                const isCurrentCountry = country.name.includes(selectedCountry);
                return (
                  <g
                    key={hub.name}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredHub({ ...hub, country: country.name, color: country.color })}
                    onMouseLeave={() => setHoveredHub(null)}
                    onClick={() => {
                      if (country.code === "DE") setSelectedCountry("Germany");
                      if (country.code === "FR") setSelectedCountry("France");
                      if (country.code === "ES") setSelectedCountry("Spain");
                    }}
                  >
                    {/* Outer Radar Pulse Ring */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hub.isMain ? "20" : "12"}
                      fill="none"
                      stroke={country.color}
                      strokeWidth="1.5"
                      className="animate-pulse-glow"
                    />

                    {/* Secondary Ping Wave */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hub.isMain ? "12" : "8"}
                      fill={country.color}
                      className="animate-ping opacity-35"
                    />

                    {/* Core Glowing Dot */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hub.isMain ? "5" : "3.5"}
                      fill="#ffffff"
                      stroke={country.color}
                      strokeWidth={hub.isMain ? "3" : "2"}
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* City Name Label */}
                    <text
                      x={hub.x + 8}
                      y={hub.y + 4}
                      fill={isCurrentCountry ? "#ffffff" : "#94a3b8"}
                      fontSize={hub.isMain ? "11" : "9"}
                      fontWeight={hub.isMain ? "bold" : "normal"}
                      className="transition-colors group-hover:fill-white font-sans"
                    >
                      {hub.name}
                    </text>
                  </g>
                );
              })
            )}
          </svg>

          {/* Floating Hover Card for City Hubs */}
          {hoveredHub && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in">
              <div className="text-xs font-extrabold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredHub.color }}></span>
                <span>{hoveredHub.name}</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">{hoveredHub.role}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{hoveredHub.country}</div>
            </div>
          )}
        </div>

        {/* REGIONAL TELEMETRY HUD CARD (4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Header Card for Selected Country */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeData.color }}
            ></div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeData.flag}</span>
                <div>
                  <h3 className="font-extrabold text-base text-white">{activeData.name}</h3>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Mã Quốc Gia: {activeData.code}
                  </span>
                </div>
              </div>

              {activeData.isEpicenter && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold animate-pulse">
                  🚨 TÂM CHẤN
                </span>
              )}
            </div>

            {/* Risk Status Pill */}
            <div
              className={`p-2.5 rounded-xl border text-xs font-bold leading-snug mb-4 ${
                activeData.isEpicenter
                  ? "bg-rose-950/40 border-rose-800/80 text-rose-300"
                  : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
              }`}
            >
              {activeData.riskStatus}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Quy Mô Khách</span>
                </div>
                <div className="text-lg font-extrabold text-white mt-1">
                  {activeData.customers.toLocaleString()}
                </div>
                <div className="text-[10px] text-blue-400 font-semibold">{activeData.pctCustomers} danh mục</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tổng Tiền Gửi</span>
                </div>
                <div className="text-lg font-extrabold text-white mt-1">
                  {activeData.totalBalanceMEur}
                </div>
                <div className="text-[10px] text-slate-400">Nguồn vốn huy động</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tỷ Lệ Churn</span>
                </div>
                <div
                  className={`text-lg font-extrabold mt-1 ${
                    activeData.isEpicenter ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {activeData.churnRatePct}
                </div>
                <div className="text-[10px] text-rose-300 font-semibold">{activeData.churners} khách rời bỏ</div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vốn Bị Đe Dọa</span>
                </div>
                <div className="text-lg font-extrabold text-amber-400 mt-1">
                  {activeData.balanceAtRiskMEur}
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">Cần giữ chân khẩn</div>
              </div>
            </div>

            {/* Operating Hubs in Country */}
            <div className="border-t border-slate-800/80 pt-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Các Chi Nhánh Đang Hoạt Động</span>
                <span className="text-emerald-400 text-[10px] font-mono">● {activeData.hubs.length} Hubs Online</span>
              </div>
              <div className="space-y-1.5">
                {activeData.hubs.map((hub) => (
                  <div
                    key={hub.name}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeData.color }}></span>
                      {hub.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{hub.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <span>Xem Báo Cáo Chẩn Đoán Chi Tiết Tại Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
