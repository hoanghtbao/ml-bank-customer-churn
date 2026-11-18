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
  Filter,
  Database,
  CheckCircle2,
  Layers,
} from "lucide-react";
import Link from "next/link";
import {
  COUNTRIES_DATA,
  DATA_SEGMENT_NODES,
  DataSegmentNode,
} from "@/lib/mapBranchesData";
import type { MapStyle } from "./LeafletMapInner";

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
  // Stage 1: Base Map Style (Default: OpenStreetMap)
  const [mapStyle, setMapStyle] = useState<MapStyle>("osm");

  // Stage 2: Clustering & Quadrant Segment Filter
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
  const [quadrantFilter, setQuadrantFilter] = useState<string>("ALL");

  // Stage 3: GeoJSON Coloring, Country Filter (`Geography`), Risk Filter & Inspector
  const [showGeoJson, setShowGeoJson] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<DataSegmentNode>(DATA_SEGMENT_NODES[1]); // Default to DE-Q1 VIP At-Risk
  const [targetView, setTargetView] = useState<{
    center: [number, number];
    zoom: number;
    timestamp: number;
  } | null>(null);

  // Filter real dataset segment nodes
  const filteredNodes = useMemo(() => {
    return DATA_SEGMENT_NODES.filter((n) => {
      if (selectedCountry !== "ALL" && n.country !== selectedCountry) return false;
      if (quadrantFilter !== "ALL" && n.quadrantCode !== quadrantFilter) return false;
      if (riskFilter !== "ALL" && n.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [selectedCountry, quadrantFilter, riskFilter]);

  const activeCountryKey = selectedCountry === "ALL" ? selectedNode.country : selectedCountry;
  const activeData = COUNTRIES_DATA[activeCountryKey] || COUNTRIES_DATA["Germany"];

  const handleSelectCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    if (countryKey === "ALL") {
      setTargetView({ center: [46.8, 4.2], zoom: 5, timestamp: Date.now() });
    } else {
      const c = COUNTRIES_DATA[countryKey];
      if (c) {
        setTargetView({ center: c.center, zoom: c.zoom, timestamp: Date.now() });
        const q1Node = DATA_SEGMENT_NODES.find(
          (n) => n.country === countryKey && n.quadrantCode === "Q1_VIP_At_Risk"
        );
        if (q1Node) setSelectedNode(q1Node);
      }
    }
  };

  const handleFocusNode = (node: DataSegmentNode) => {
    setSelectedNode(node);
    setTargetView({
      center: [node.lat, node.lng],
      zoom: 7,
      timestamp: Date.now(),
    });
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
              100% DATABASE GROUNDED (Geography &times; 4 Quadrants) &bull; ZERO SYNTHETIC BRANCHES
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] text-blue-300 font-mono font-bold">
              10,000 Khách Hàng Thực Tế
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Bản Đồ Địa Lý 3 Quốc Gia & Phân Khúc Rủi Ro Từ Database (GIS Live Map)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Đồng nhất 100% với cột <code>Geography</code> (<code>France: 5,014</code>,{" "}
            <code>Germany: 2,509</code>, <code>Spain: 2,477</code>) và ma trận <b>4 Quadrants</b> trong{" "}
            <code>Customer-Churn-Records.csv</code>. Kết hợp <b>OpenStreetMap</b>,{" "}
            <b>MarkerCluster</b> và <b>GeoJSON</b>.
          </p>
        </div>

        {/* STAGE 1: MAP TILE SWITCHER */}
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

      {/* STAGE 2 & STAGE 3: DATABASE FILTER BAR */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 mb-5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/90">
        {/* Geography Column Selector (5 cols) */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Geography:</span>
          </span>
          {[
            { id: "ALL", label: "🌍 Tất cả (10,000 KH)" },
            { id: "Germany", label: "🇩🇪 Germany (2,509)" },
            { id: "France", label: "🇫🇷 France (5,014)" },
            { id: "Spain", label: "🇪🇸 Spain (2,477)" },
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

        {/* Quadrant & Risk Filter (4 cols) */}
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={quadrantFilter}
              onChange={(e) => setQuadrantFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Mọi phân khúc Database (15 cụm)</option>
              <option value="NATIONAL_TOTAL">🏛️ Tổng hợp cấp Quốc gia (3)</option>
              <option value="Q1_VIP_At_Risk">🚨 Q1: VIP Nguy cơ cao (1,848 KH)</option>
              <option value="Q2_Standard_At_Risk">⚠️ Q2: Phổ thông Nguy cơ cao (742 KH)</option>
              <option value="Q3_VIP_Loyal">💎 Q3: VIP Trung thành (3,950 KH)</option>
              <option value="Q4_Standard_Loyal">🟢 Q4: Phổ thông Trung thành (3,460 KH)</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Mọi mức rủi ro</option>
            <option value="CRITICAL">🔴 Rủi ro Nghiêm trọng (Q1 / Đức)</option>
            <option value="HIGH">🟠 Rủi ro Cao (Q2 At-Risk)</option>
            <option value="LOW">🟢 Ổn định / Trung thành (Q3 & Q4)</option>
          </select>
        </div>

        {/* Layer Toggles (3 cols) */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setEnableClustering(!enableClustering)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              enableClustering
                ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
            title="Bật/tắt gom cụm các phân khúc bằng MarkerCluster"
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
            title="Bật/tắt tô màu lãnh thổ quốc gia GeoJSON"
          >
            <span>GeoJSON: {showGeoJson ? "BẬT" : "TẮT"}</span>
          </button>
        </div>
      </div>

      {/* MAP CANVAS + RIGHT-SIDE DATABASE INSPECTOR */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 8 COLS: REACT-LEAFLET MAP */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl relative min-h-[540px] bg-slate-950 flex flex-col">
          <LeafletMapInner
            mapStyle={mapStyle}
            selectedCountry={selectedCountry}
            onSelectCountry={(c) => setSelectedCountry(c)}
            nodes={filteredNodes}
            onSelectNode={(n) => setSelectedNode(n)}
            enableClustering={enableClustering}
            showGeoJson={showGeoJson}
            targetView={targetView}
          />

          {/* Bottom Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md text-[10px] text-slate-300 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              Germany (2,509 KH • Churn 32.44%)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              France (5,014 KH • Churn 16.17%)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Spain (2,477 KH • Churn 16.67%)
            </span>
          </div>
        </div>

        {/* RIGHT 4 COLS: 100% DATABASE-GROUNDED INSPECTOR */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              {/* 1. Selected Geography Country Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{activeData.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                      {activeData.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Trích xuất trực tiếp từ Customer-Churn-Records.csv
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
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    QUY MÔ & TỔNG SỐ DƯ
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {activeData.customers.toLocaleString()} KH ({activeData.pctCustomers})
                  </div>
                  <div className="text-[10px] text-blue-400">
                    Tổng vốn: {activeData.totalBalanceMEur} (TB: {activeData.avgBalanceEur})
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[9px] font-bold uppercase">
                    TỶ LỆ CHURN & VỐN MẤT
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
                    COMPLAIN & BẪY ≥3 SẢN PHẨM
                  </div>
                  <div className="text-sm font-extrabold text-rose-300 mt-0.5">
                    {activeData.complainCount} KH Complain
                  </div>
                  <div className="text-[10px] text-amber-300">
                    Giữ 3-4 SP: {activeData.products34Count} KH
                  </div>
                </div>
              </div>

              {/* 2. Selected Database Segment Node Card */}
              <div className="border-t border-slate-800 pt-3 mb-3">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    Cụm Phân Khúc Đang Chọn Trên Bản Đồ
                  </span>
                  <span className="font-mono text-slate-400">{selectedNode.id}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        {selectedNode.name}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-300">
                        {selectedNode.quadrantLabel}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex-shrink-0">
                      Churn: {selectedNode.actualChurnRatePct}%
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-emerald-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                    {selectedNode.dataSourceNote}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">Số lượng KH</div>
                      <div className="text-xs font-extrabold text-white">
                        {selectedNode.customers.toLocaleString()} ({selectedNode.pctOfCountry}%)
                      </div>
                    </div>
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">Tổng số dư</div>
                      <div className="text-xs font-extrabold text-emerald-400">
                        {selectedNode.balanceMEur}M €
                      </div>
                    </div>
                    <div className="bg-slate-900/70 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-400">AI Prob TB</div>
                      <div className="text-xs font-extrabold text-amber-400">
                        {selectedNode.avgPredProbPct}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Segment Nodes List */}
              <div className="border-t border-slate-800 pt-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Các Cụm Dữ Liệu Trên Bản Đồ ({filteredNodes.length})</span>
                  <span className="text-[9px] text-slate-500">Click để định vị</span>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {filteredNodes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleFocusNode(n)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer border ${
                        selectedNode.id === n.id
                          ? "bg-blue-600/25 border-blue-500/60 text-white"
                          : "bg-slate-950/60 border-slate-800/70 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate font-semibold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: n.color }}
                        ></span>
                        <span className="truncate">{n.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-2">
                        {n.customers.toLocaleString()} KH • {n.balanceMEur}M €
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Link to Strategy / Dashboard */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <Link
                href="/strategy"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <span>Mô Phỏng Ngân Sách Giữ Chân 4 Quadrants</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
