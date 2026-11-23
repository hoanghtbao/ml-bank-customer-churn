"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Globe2,
  ArrowRight,
  Compass,
  Database,
  Layers,
  Map as MapIcon,
  Satellite,
  Moon,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { COUNTRIES_DATA, QuadrantBreakdown } from "@/lib/mapBranchesData";
import { useTheme } from "./AppShell";
import type { MapStyle } from "./LeafletMapInner";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[520px] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
      <div className="w-9 h-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
      <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400">
        Đang khởi tạo Bản Đồ 3 Quốc Gia (OpenStreetMap &bull; GeoJSON)...
      </div>
    </div>
  ),
});

export default function InteractiveRegionMap() {
  const { theme } = useTheme();
  const [mapStyle, setMapStyle] = useState<MapStyle>("voyager");
  const [manualMapStyle, setManualMapStyle] = useState(false);
  const [showGeoJson, setShowGeoJson] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("Germany");
  const [selectedQuadrantCode, setSelectedQuadrantCode] = useState<string>("Q1_VIP_At_Risk");
  const [targetView, setTargetView] = useState<{
    center: [number, number];
    zoom: number;
    timestamp: number;
  } | null>(null);

  // Sync map tiles seamlessly with global Light/Dark mode unless user manually chose Satellite/OSM
  useEffect(() => {
    if (!manualMapStyle) {
      setMapStyle(theme === "dark" ? "dark" : "voyager");
    }
  }, [theme, manualMapStyle]);

  const activeCountryKey = selectedCountry === "ALL" ? "Germany" : selectedCountry;
  const activeData = COUNTRIES_DATA[activeCountryKey] || COUNTRIES_DATA["Germany"];
  const activeQuadrant: QuadrantBreakdown =
    activeData.quadrants.find((q) => q.code === selectedQuadrantCode) ||
    activeData.quadrants[0];

  const handleSelectCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    if (countryKey === "ALL") {
      setTargetView({ center: [46.8, 3.8], zoom: 5, timestamp: Date.now() });
    } else {
      const c = COUNTRIES_DATA[countryKey];
      if (c) {
        setTargetView({ center: c.center, zoom: c.zoom, timestamp: Date.now() });
      }
    }
  };

  const handleMapStyleChange = (style: MapStyle) => {
    setManualMapStyle(true);
    setMapStyle(style);
  };

  return (
    <section
      aria-label="Bản đồ giám sát 3 thị trường Châu Âu"
      className="relative overflow-hidden bg-white dark:bg-[#091426] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 mb-7 text-slate-900 dark:text-white shadow-sm dark:shadow-2xl transition-colors duration-200"
    >
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e125_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e125_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* HEADER BAR */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-200/80 dark:border-slate-800/90">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase font-mono">
              3 QUỐC GIA TRONG DATABASE (GERMANY &bull; FRANCE &bull; SPAIN)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 text-[10px] text-blue-700 dark:text-blue-300 font-mono font-bold">
              10,000 Khách Hàng Thực Tế
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Bản Đồ Địa Lý 3 Quốc Gia Hoạt Động (OpenStreetMap &amp; GeoJSON)</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Hiển thị chính xác <b>3 vùng lãnh thổ quốc gia</b> tương ứng với cột{" "}
            <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              Geography
            </code>{" "}
            trong dữ liệu: <b>France (5,014 KH)</b>, <b>Germany (2,509 KH)</b> và{" "}
            <b>Spain (2,477 KH)</b>. Nhấp vào từng nước để xem phân tích chi tiết bên phải.
          </p>
        </div>

        {/* MAP TILE SWITCHER */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900/95 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start xl:self-auto">
          {[
            { id: "voyager", label: "Bản đồ Sáng", icon: MapIcon },
            { id: "osm", label: "OpenStreetMap", icon: Globe2 },
            { id: "satellite", label: "Vệ Tinh", icon: Satellite },
            { id: "dark", label: "Bản đồ Tối", icon: Moon },
          ].map((t) => {
            const Icon = t.icon;
            const active = mapStyle === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleMapStyleChange(t.id as MapStyle)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* COUNTRY SELECTION BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/90">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Chọn Quốc Gia:</span>
          </span>
          {[
            { id: "ALL", code: "EU", label: "Toàn Cảnh 3 Nước (10,000 KH)" },
            { id: "Germany", code: "DE", label: "Germany • 2,509 KH (Churn 32.44%)" },
            { id: "France", code: "FR", label: "France • 5,014 KH (Churn 16.17%)" },
            { id: "Spain", code: "ES", label: "Spain • 2,477 KH (Churn 16.67%)" },
          ].map((c) => {
            const isSelected = selectedCountry === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCountry(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {c.code}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectCountry("ALL")}
            title="Đặt lại góc nhìn Châu Âu"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Về Châu Âu</span>
          </button>

          <button
            onClick={() => setShowGeoJson(!showGeoJson)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              showGeoJson
                ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Biên giới GeoJSON: {showGeoJson ? "BẬT" : "TẮT"}</span>
          </button>
        </div>
      </div>

      {/* MAIN MAP CANVAS + RIGHT-SIDE COUNTRY & 4-QUADRANTS PANEL */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 7/8 COLS: REACT-LEAFLET MAP */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-md dark:shadow-2xl relative min-h-[520px] bg-slate-100 dark:bg-slate-950 flex flex-col">
          <LeafletMapInner
            mapStyle={mapStyle}
            selectedCountry={selectedCountry}
            onSelectCountry={(c) => handleSelectCountry(c)}
            showGeoJson={showGeoJson}
            targetView={targetView}
            theme={theme}
          />

          {/* Bottom Map Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md text-[10px] text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              DE: Germany (2,509 KH &bull; Churn 32.44%)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              FR: France (5,014 KH &bull; Churn 16.17%)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              ES: Spain (2,477 KH &bull; Churn 16.67%)
            </span>
          </div>
        </div>

        {/* RIGHT 5/4 COLS: COUNTRY SUMMARY & 4-QUADRANT BREAKDOWN */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between">
          <div className="bg-slate-50/70 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between transition-colors">
            <div>
              {/* 1. Selected Country Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: activeData.isEpicenter ? "#dc2626" : activeData.color }}
                  >
                    {activeData.code}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                      {activeData.name}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      Geography = &apos;{activeData.geographyValue}&apos;
                    </span>
                  </div>
                </div>

                {activeData.isEpicenter && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    TÂM CHẤN
                  </span>
                )}
              </div>

              {/* Country Real CSV Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4 tabular-nums">
                <div className="bg-white dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase">
                    QUY MÔ &amp; TỔNG TIỀN GỬI
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {activeData.customers.toLocaleString()} KH ({activeData.pctCustomers})
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Vốn: {activeData.totalBalanceMEur}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase">
                    TỶ LỆ CHURN &amp; VỐN RỦI RO
                  </div>
                  <div
                    className={`text-sm font-extrabold mt-0.5 ${
                      activeData.isEpicenter
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {activeData.churnRatePct} ({activeData.churners} KH)
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    Vốn rủi ro: {activeData.balanceAtRiskMEur}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase">
                    TÀI KHOẢN SỐ DƯ = 0 &euro;
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {activeData.zeroBalanceCount.toLocaleString()} KH ({activeData.zeroBalancePct})
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Active Member: {activeData.activeMemberPct}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase">
                    COMPLAIN &amp; BẪY 3–4 SP
                  </div>
                  <div className="text-sm font-extrabold text-rose-600 dark:text-rose-300 mt-0.5">
                    {activeData.complainCount} KH Complain
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-300 font-semibold">
                    Giữ 3–4 SP: {activeData.products34Count} KH
                  </div>
                </div>
              </div>

              {/* 2. Breakdown of 4 Quadrants inside this Country */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    Cơ Cấu 4 Nhóm Tại {activeData.shortName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {activeData.customers.toLocaleString()} KH
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {activeData.quadrants.map((q) => {
                    const isActiveQ = activeQuadrant.code === q.code;
                    return (
                      <button
                        key={q.code}
                        onClick={() => setSelectedQuadrantCode(q.code)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isActiveQ
                            ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 dark:border-blue-400 shadow-xs"
                            : "bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: q.badgeColor }}
                            />
                            <span>{q.title}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200 tabular-nums">
                            {q.customers.toLocaleString()} KH ({q.pctOfCountry}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                          <span>Tiền gửi: {q.balanceMEur}M &euro;</span>
                          <span
                            className={
                              q.actualChurnRatePct >= 50
                                ? "text-rose-600 dark:text-rose-400 font-bold"
                                : "text-emerald-600 dark:text-emerald-400 font-bold"
                            }
                          >
                            Churn thực tế: {q.actualChurnRatePct}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Quadrant Strategy Box */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-slate-900 dark:text-white mb-0.5 flex items-center justify-between gap-2">
                    <span>Đề xuất {activeQuadrant.title}:</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {activeQuadrant.ruleDesc}
                    </span>
                  </div>
                  <div>{activeQuadrant.strategyAction}</div>
                </div>
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>Xem Biểu Đồ So Sánh 3 Quốc Gia Tại Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
