"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Globe2,
  AlertTriangle,
  TrendingDown,
  Users,
  DollarSign,
  ArrowRight,
  Compass,
  Layers,
  MapPin,
  Filter,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  COUNTRIES_DATA,
  BANK_BRANCHES,
  BankBranch,
} from "@/lib/mapBranchesData";
import type { MapStyle } from "./LeafletMapInner";

// Dynamically load React-Leaflet component on client-side only
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[540px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin"></div>
      <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
        Đang khởi tạo React-Leaflet &bull; OpenStreetMap &bull; GeoJSON...
      </div>
    </div>
  ),
});

export default function InteractiveRegionMap() {
  // Stage 1: Base Map Tile Style (Default to OpenStreetMap / Voyager)
  const [mapStyle, setMapStyle] = useState<MapStyle>("osm");

  // Stage 2: Clustering & Branch Tier Filters
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  // Stage 3: GeoJSON Coloring, Country Filter, Risk Filter & Selected Branch Inspector
  const [showGeoJson, setShowGeoJson] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [selectedBranch, setSelectedBranch] = useState<BankBranch>(BANK_BRANCHES[0]);
  const [targetView, setTargetView] = useState<{
    center: [number, number];
    zoom: number;
    timestamp: number;
  } | null>(null);

  // Filter branches based on Country, Tier, and Risk Level
  const filteredBranches = useMemo(() => {
    return BANK_BRANCHES.filter((b) => {
      if (selectedCountry !== "ALL" && b.country !== selectedCountry) return false;
      if (tierFilter !== "ALL" && b.tier !== tierFilter) return false;
      if (riskFilter !== "ALL" && b.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [selectedCountry, tierFilter, riskFilter]);

  // Active Country Summary Data (defaults to Germany when ALL is selected so HUD has rich info)
  const activeCountryKey = selectedCountry === "ALL" ? selectedBranch.country : selectedCountry;
  const activeData = COUNTRIES_DATA[activeCountryKey] || COUNTRIES_DATA["Germany"];

  // Camera FlyTo Country
  const handleSelectCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    if (countryKey === "ALL") {
      setTargetView({ center: [46.8, 4.2], zoom: 5, timestamp: Date.now() });
    } else {
      const c = COUNTRIES_DATA[countryKey];
      if (c) {
        setTargetView({ center: c.center, zoom: c.zoom, timestamp: Date.now() });
        const firstBranch = BANK_BRANCHES.find((b) => b.country === countryKey);
        if (firstBranch) setSelectedBranch(firstBranch);
      }
    }
  };

  // Camera FlyTo Specific Branch (Street-level zoom)
  const handleFocusBranch = (branch: BankBranch) => {
    setSelectedBranch(branch);
    setTargetView({
      center: [branch.lat, branch.lng],
      zoom: 12,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="relative overflow-hidden bg-[#091426] border-2 border-slate-800 rounded-3xl p-6 sm:p-7 mb-8 text-white shadow-2xl">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* HEADER & TECH STACK BADGES */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-800/90">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
              REACT-LEAFLET &bull; OPENSTREETMAP &bull; MARKERCLUSTER &bull; GEOJSON
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] text-blue-300 font-mono font-bold">
              25 Chi Nhánh Thực Tế
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Bản Đồ Mạng Lưới Chi Nhánh & Vùng Lãnh Thổ 3 Quốc Gia (GIS Live Map)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Triển khai chuẩn 3 giai đoạn: <b>(1) Bản đồ nền OpenStreetMap</b> &bull;{" "}
            <b>(2) Gom cụm 25 chi nhánh bằng MarkerCluster theo tọa độ Lat/Lng</b> &bull;{" "}
            <b>(3) Tô màu đường biên giới quốc gia bằng GeoJSON & bộ lọc chi nhánh tương tác</b>.
          </p>
        </div>

        {/* STAGE 1: MAP TILE LAYER SWITCHER */}
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

      {/* STAGE 2 & STAGE 3: MULTI-DIMENSIONAL FILTER BAR */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 mb-5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/90">
        {/* Country GeoJSON Selector (5 cols) */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Quốc gia:</span>
          </span>
          {[
            { id: "ALL", label: "🌍 Tất cả (25)" },
            { id: "Germany", label: "🇩🇪 Đức (9)" },
            { id: "France", label: "🇫🇷 Pháp (9)" },
            { id: "Spain", label: "🇪🇸 TBN (7)" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCountry(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                selectedCountry === c.id
                  ? "bg-blue-600/30 border-blue-400 text-white shadow-xs"
                  : "bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Branch Tier & Risk Filter (4 cols) */}
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Mọi cấp chi nhánh (25)</option>
              <option value="HQ">🏛️ Trụ sở chính HQ (4)</option>
              <option value="VIP_WEALTH">💎 Trung tâm VIP Wealth (10)</option>
              <option value="RETAIL">🏦 Chi nhánh Bán lẻ (11)</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Mọi mức độ rủi ro</option>
            <option value="CRITICAL">🚨 Tâm chấn Rủi ro Cao (≥30%)</option>
            <option value="MODERATE">⚠️ Rủi ro Trung bình (20-30%)</option>
            <option value="LOW">🟢 Hoạt động An toàn (&lt;20%)</option>
          </select>
        </div>

        {/* Layer Toggles: MarkerCluster & GeoJSON (3 cols) */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setEnableClustering(!enableClustering)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              enableClustering
                ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
            title="Bật/tắt gom cụm điểm chi nhánh MarkerCluster"
          >
            <span>Cluster: {enableClustering ? "BẬT" : "TẮT"}</span>
          </button>

          <button
            onClick={() => setShowGeoJson(!showGeoJson)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showGeoJson
                ? "bg-indigo-950/70 border-indigo-500/60 text-indigo-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
            title="Bật/tắt lớp tô màu đường biên giới quốc gia GeoJSON"
          >
            <span>GeoJSON: {showGeoJson ? "BẬT" : "TẮT"}</span>
          </button>
        </div>
      </div>

      {/* MAIN MAP CANVAS + INTERACTIVE BRANCH INSPECTOR HUD */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 8 COLS: REACT-LEAFLET MAP */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl relative min-h-[540px] bg-slate-950 flex flex-col">
          <LeafletMapInner
            mapStyle={mapStyle}
            selectedCountry={selectedCountry}
            onSelectCountry={(c) => setSelectedCountry(c)}
            branches={filteredBranches}
            onSelectBranch={(b) => setSelectedBranch(b)}
            enableClustering={enableClustering}
            showGeoJson={showGeoJson}
            targetView={targetView}
          />

          {/* Bottom Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md text-[10px] text-slate-300 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              Đức (GeoJSON Đỏ • Churn 32.4%)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Pháp (GeoJSON Xanh • 50.1% KH)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Tây Ban Nha (GeoJSON Lục • 24.8% KH)
            </span>
          </div>
        </div>

        {/* RIGHT 4 COLS: COUNTRY GEOJSON SUMMARY & SELECTED BRANCH INSPECTOR */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              {/* 1. Selected Country GeoJSON Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{activeData.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                      {activeData.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Vùng lãnh thổ GeoJSON &bull; Mã: {activeData.code}
                    </span>
                  </div>
                </div>

                {activeData.isEpicenter && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold animate-pulse">
                    🚨 TÂM CHẤN
                  </span>
                )}
              </div>

              {/* Country KPI Mini Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-bold">QUY MÔ QUỐC GIA</div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {activeData.customers.toLocaleString()} KH
                  </div>
                  <div className="text-[10px] text-blue-400">{activeData.totalBalanceMEur} vốn</div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-bold">CHURN & VỐN RỦI RO</div>
                  <div
                    className={`text-base font-extrabold mt-0.5 ${
                      activeData.isEpicenter ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {activeData.churnRatePct}
                  </div>
                  <div className="text-[10px] text-amber-400">
                    Đe dọa: {activeData.balanceAtRiskMEur}
                  </div>
                </div>
              </div>

              {/* 2. Active Selected Branch Detail Card */}
              <div className="border-t border-slate-800 pt-3 mb-3">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Chi Tiết Chi Nhánh Đang Chọn
                  </span>
                  <span className="font-mono text-slate-400">{selectedBranch.id}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        {selectedBranch.name}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-300">
                        {selectedBranch.tierLabel}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        selectedBranch.riskLevel === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : selectedBranch.riskLevel === "MODERATE"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {selectedBranch.churnRatePct}% CHURN
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    📍 {selectedBranch.address} ({selectedBranch.lat.toFixed(4)}°N,{" "}
                    {selectedBranch.lng.toFixed(4)}°E)
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-center">
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">Khách hàng</div>
                      <div className="text-xs font-extrabold text-white">
                        {selectedBranch.customers}
                      </div>
                    </div>
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">Tiền gửi</div>
                      <div className="text-xs font-extrabold text-emerald-400">
                        {selectedBranch.balanceMEur}M €
                      </div>
                    </div>
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">Quản lý</div>
                      <div className="text-[10px] font-bold text-slate-200 truncate">
                        {selectedBranch.manager.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Quick Branch List (Click to fly camera directly to branch) */}
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Danh Sách Chi Nhánh Đang Lọc ({filteredBranches.length})</span>
                  <span className="text-[9px] text-slate-500">Click để bay tới</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {filteredBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleFocusBranch(b)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer border ${
                        selectedBranch.id === b.id
                          ? "bg-blue-600/25 border-blue-500/60 text-white"
                          : "bg-slate-950/60 border-slate-800/70 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate font-semibold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: b.color }}
                        ></span>
                        <span className="truncate">{b.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-2">
                        {b.churnRatePct}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <span>Phân Tích Chuyên Sâu Tại Executive Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
