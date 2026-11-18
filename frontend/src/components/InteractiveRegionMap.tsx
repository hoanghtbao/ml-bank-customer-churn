"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Globe2,
  ArrowRight,
  Compass,
  Database,
  Layers,
} from "lucide-react";
import Link from "next/link";
import {
  COUNTRIES_DATA,
  QuadrantBreakdown,
} from "@/lib/mapBranchesData";
import type { MapStyle } from "./LeafletMapInner";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[540px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin"></div>
      <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
        Đang khởi tạo Bản Đồ 3 Quốc Gia (OpenStreetMap &bull; GeoJSON)...
      </div>
    </div>
  ),
});

export default function InteractiveRegionMap() {
  const [mapStyle, setMapStyle] = useState<MapStyle>("osm");
  const [showGeoJson, setShowGeoJson] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("Germany");
  const [selectedQuadrantCode, setSelectedQuadrantCode] = useState<string>("Q1_VIP_At_Risk");
  const [targetView, setTargetView] = useState<{
    center: [number, number];
    zoom: number;
    timestamp: number;
  } | null>(null);

  const activeCountryKey = selectedCountry === "ALL" ? "Germany" : selectedCountry;
  const activeData = COUNTRIES_DATA[activeCountryKey] || COUNTRIES_DATA["Germany"];
  const activeQuadrant: QuadrantBreakdown =
    activeData.quadrants.find((q) => q.code === selectedQuadrantCode) ||
    activeData.quadrants[0];

  const handleSelectCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    if (countryKey === "ALL") {
      setTargetView({ center: [46.8, 4.2], zoom: 5, timestamp: Date.now() });
    } else {
      const c = COUNTRIES_DATA[countryKey];
      if (c) {
        setTargetView({ center: c.center, zoom: c.zoom, timestamp: Date.now() });
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#091426] border-2 border-slate-800 rounded-3xl p-6 sm:p-7 mb-8 text-white shadow-2xl">
      {/* Subtle Radar Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* HEADER BAR */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-800/90">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
              3 QUỐC GIA TRONG DATABASE (Geography: Germany &bull; France &bull; Spain)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] text-blue-300 font-mono font-bold">
              10,000 Khách Hàng Thực Tế
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Bản Đồ Địa Lý 3 Quốc Gia Hoạt Động (OpenStreetMap &amp; GeoJSON)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Hiển thị chính xác <b>3 vùng lãnh thổ quốc gia</b> tương ứng với 3 giá trị của cột{" "}
            <code>Geography</code> trong tệp <code>Customer-Churn-Records.csv</code>:{" "}
            <b>🇫🇷 France (5,014 KH)</b>, <b>🇩🇪 Germany (2,509 KH)</b> và{" "}
            <b>🇪🇸 Spain (2,477 KH)</b>. Click vào từng nước để xem thống kê chi tiết bên phải.
          </p>
        </div>

        {/* MAP TILE SWITCHER */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/95 p-1.5 rounded-2xl border border-slate-800 shadow-inner self-start xl:self-auto">
          {[
            { id: "osm", label: "🌍 OpenStreetMap" },
            { id: "voyager", label: "🗺️ Google Style" },
            { id: "satellite", label: "🛰️ Vệ Tinh" },
            { id: "dark", label: "🌙 FinTech Dark" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMapStyle(t.id as MapStyle)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mapStyle === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* COUNTRY SELECTION BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/90">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Chọn Quốc Gia (Cột Geography):</span>
          </span>
          {[
            { id: "ALL", label: "🌍 Toàn Cảnh 3 Nước (10,000 KH)" },
            { id: "Germany", label: "🇩🇪 Germany • 2,509 KH (Churn 32.44% - Tâm chấn)" },
            { id: "France", label: "🇫🇷 France • 5,014 KH (Churn 16.17%)" },
            { id: "Spain", label: "🇪🇸 Spain • 2,477 KH (Churn 16.67%)" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCountry(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedCountry === c.id
                  ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/25"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowGeoJson(!showGeoJson)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            showGeoJson
              ? "bg-indigo-950/70 border-indigo-500/60 text-indigo-300"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tô màu biên giới GeoJSON: {showGeoJson ? "BẬT" : "TẮT"}</span>
        </button>
      </div>

      {/* MAIN MAP CANVAS + RIGHT-SIDE COUNTRY & 4-QUADRANTS PANEL */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 7/8 COLS: REACT-LEAFLET MAP WITH ONLY 3 NATIONAL MARKERS */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl relative min-h-[540px] bg-slate-950 flex flex-col">
          <LeafletMapInner
            mapStyle={mapStyle}
            selectedCountry={selectedCountry}
            onSelectCountry={(c) => handleSelectCountry(c)}
            showGeoJson={showGeoJson}
            targetView={targetView}
          />

          {/* Bottom Map Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md text-[10px] text-slate-300 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              🇩🇪 Germany (2,509 KH • Churn 32.44%)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              🇫🇷 France (5,014 KH • Churn 16.17%)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              🇪🇸 Spain (2,477 KH • Churn 16.67%)
            </span>
          </div>
        </div>

        {/* RIGHT 5/4 COLS: COUNTRY SUMMARY & 4-QUADRANT BREAKDOWN */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              {/* 1. Selected Country Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{activeData.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                      {activeData.name}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Database: df[df[&apos;Geography&apos;] == &apos;{activeData.geographyValue}&apos;]
                    </span>
                  </div>
                </div>

                {activeData.isEpicenter && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold animate-pulse">
                    🚨 TÂM CHẤN
                  </span>
                )}
              </div>

              {/* Country Real CSV Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    QUY MÔ &amp; TỔNG TIỀN GỬI
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {activeData.customers.toLocaleString()} KH ({activeData.pctCustomers})
                  </div>
                  <div className="text-[10px] text-blue-400">
                    Vốn: {activeData.totalBalanceMEur} (TB: {activeData.avgBalanceEur})
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    TỶ LỆ CHURN &amp; VỐN RỦI RO
                  </div>
                  <div
                    className={`text-sm font-extrabold mt-0.5 ${
                      activeData.isEpicenter ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {activeData.churnRatePct} ({activeData.churners} KH)
                  </div>
                  <div className="text-[10px] text-amber-400">
                    Vốn rủi ro: {activeData.balanceAtRiskMEur}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    TÀI KHOẢN SỐ DƯ = 0 €
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {activeData.zeroBalanceCount.toLocaleString()} KH ({activeData.zeroBalancePct})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Active Member: {activeData.activeMemberPct}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    COMPLAIN &amp; BẪY 3–4 SP
                  </div>
                  <div className="text-sm font-extrabold text-rose-300 mt-0.5">
                    {activeData.complainCount} KH Complain
                  </div>
                  <div className="text-[10px] text-amber-300">
                    Giữ 3–4 SP: {activeData.products34Count} KH
                  </div>
                </div>
              </div>

              {/* 2. Breakdown of 4 Quadrants inside this Country */}
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    Cơ Cấu 4 Nhóm Khách Hàng Tại {activeData.shortName}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Tổng: {activeData.customers.toLocaleString()} KH
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
                            ? "bg-blue-600/20 border-blue-400 shadow-sm"
                            : "bg-slate-950/70 border-slate-800 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: q.badgeColor }}
                            ></span>
                            <span>{q.title}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-200">
                            {q.customers.toLocaleString()} KH ({q.pctOfCountry}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>Tiền gửi: {q.balanceMEur}M €</span>
                          <span
                            className={
                              q.actualChurnRatePct >= 50
                                ? "text-rose-400 font-bold"
                                : "text-emerald-400 font-bold"
                            }
                          >
                            Churn thực tế: {q.actualChurnRatePct}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Quadrant Strategy Recommendation Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <div className="font-bold text-white mb-0.5 flex items-center justify-between">
                    <span>🎯 Đề xuất cho {activeQuadrant.title}:</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeQuadrant.ruleDesc}
                    </span>
                  </div>
                  <div>{activeQuadrant.strategyAction}</div>
                </div>
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <span>Xem Biểu Đồ So Sánh 3 Quốc Gia Tại Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
