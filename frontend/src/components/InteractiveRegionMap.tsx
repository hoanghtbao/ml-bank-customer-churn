"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe2,
  AlertTriangle,
  TrendingDown,
  Users,
  DollarSign,
  Radio,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  Compass,
  Maximize2
} from "lucide-react";
import Link from "next/link";

interface CountryStat {
  code: string;
  name: string;
  flag: string;
  center: [number, number];
  zoom: number;
  customers: number;
  pctCustomers: string;
  totalBalanceMEur: string;
  churnRatePct: string;
  churners: number;
  balanceAtRiskMEur: string;
  riskStatus: string;
  isEpicenter: boolean;
  color: string;
}

const COUNTRIES_DATA: Record<string, CountryStat> = {
  Germany: {
    code: "DE",
    name: "Cộng Hòa Liên Bang Đức (Germany)",
    flag: "🇩🇪",
    center: [51.1657, 10.4515],
    zoom: 6,
    customers: 2509,
    pctCustomers: "25.09%",
    totalBalanceMEur: "300.40M €",
    churnRatePct: "32.44%",
    churners: 814,
    balanceAtRiskMEur: "97.97M €",
    riskStatus: "TÂM CHẤN NGUY CƠ CAO (Chiếm 52.76% tổng vốn thoát)",
    isEpicenter: true,
    color: "#f59e0b",
  },
  France: {
    code: "FR",
    name: "Cộng Hòa Pháp (France)",
    flag: "🇫🇷",
    center: [46.6034, 1.8883],
    zoom: 6,
    customers: 5014,
    pctCustomers: "50.14%",
    totalBalanceMEur: "311.30M €",
    churnRatePct: "16.17%",
    churners: 811,
    balanceAtRiskMEur: "55.82M €",
    riskStatus: "THỊ TRƯỜNG LỚN NHẤT & TỶ LỆ RỜI BỎ ỔN ĐỊNH",
    isEpicenter: false,
    color: "#3b82f6",
  },
  Spain: {
    code: "ES",
    name: "Vương Quốc Tây Ban Nha (Spain)",
    flag: "🇪🇸",
    center: [40.4637, -3.7492],
    zoom: 6,
    customers: 2477,
    pctCustomers: "24.77%",
    totalBalanceMEur: "153.16M €",
    churnRatePct: "16.67%",
    churners: 413,
    balanceAtRiskMEur: "31.89M €",
    riskStatus: "THỊ TRƯỜNG TIỀM NĂNG & THANH KHOẢN TĂNG TRƯỞNG",
    isEpicenter: false,
    color: "#10b981",
  },
};

const CITY_HUBS = [
  // Germany (Epicenter)
  {
    name: "Frankfurt am Main",
    lat: 50.1109,
    lng: 8.6821,
    country: "Germany",
    role: "EuroVanguard HQ & ECB Hub (Tâm chấn)",
    isMain: true,
    isEpicenter: true,
    color: "#f59e0b",
    stats: "Mất 97.97M € tiền gửi • Churn 32.44%",
  },
  {
    name: "Berlin",
    lat: 52.52,
    lng: 13.405,
    country: "Germany",
    role: "Retail Analytics & AI Center",
    isMain: false,
    isEpicenter: true,
    color: "#f59e0b",
    stats: "Phân bổ 680 khách • Điểm rủi ro cao",
  },
  {
    name: "Munich",
    lat: 48.1351,
    lng: 11.582,
    country: "Germany",
    role: "Bavaria Wealth Management",
    isMain: false,
    isEpicenter: true,
    color: "#f59e0b",
    stats: "Phân bổ 720 khách • Số dư TB 125,000 €",
  },
  {
    name: "Hamburg",
    lat: 53.5511,
    lng: 9.9937,
    country: "Germany",
    role: "Northern Commercial Trade Hub",
    isMain: false,
    isEpicenter: true,
    color: "#f59e0b",
    stats: "Phân bổ 510 khách • Giao dịch doanh nghiệp",
  },

  // France
  {
    name: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    country: "France",
    role: "France National Retail HQ",
    isMain: true,
    isEpicenter: false,
    color: "#3b82f6",
    stats: "5,014 khách (50.1%) • Churn 16.17%",
  },
  {
    name: "Lyon",
    lat: 45.764,
    lng: 4.8357,
    country: "France",
    role: "Rhône-Alpes Commercial Hub",
    isMain: false,
    isEpicenter: false,
    color: "#3b82f6",
    stats: "Phân bổ 1,120 khách • Tiền gửi ổn định",
  },
  {
    name: "Marseille",
    lat: 43.2965,
    lng: 5.3698,
    country: "France",
    role: "Mediterranean Financial Center",
    isMain: false,
    isEpicenter: false,
    color: "#3b82f6",
    stats: "Phân bổ 940 khách • Hoạt động bán lẻ",
  },
  {
    name: "Bordeaux",
    lat: 44.8378,
    lng: -0.5792,
    country: "France",
    role: "Atlantic Wealth Division",
    isMain: false,
    isEpicenter: false,
    color: "#3b82f6",
    stats: "Phân bổ 820 khách • Khách hàng gia đình",
  },

  // Spain
  {
    name: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    country: "Spain",
    role: "Iberian Peninsula HQ",
    isMain: true,
    isEpicenter: false,
    color: "#10b981",
    stats: "2,477 khách (24.8%) • Churn 16.67%",
  },
  {
    name: "Barcelona",
    lat: 41.3851,
    lng: 2.1734,
    country: "Spain",
    role: "Catalonia Digital Payments",
    isMain: false,
    isEpicenter: false,
    color: "#10b981",
    stats: "Phân bổ 850 khách • Thẻ & Thanh toán",
  },
  {
    name: "Seville",
    lat: 37.3891,
    lng: -5.9845,
    country: "Spain",
    role: "Andalusia Regional Center",
    isMain: false,
    isEpicenter: false,
    color: "#10b981",
    stats: "Phân bổ 590 khách • Tăng trưởng tiền gửi",
  },
  {
    name: "Valencia",
    lat: 39.4699,
    lng: -0.3763,
    country: "Spain",
    role: "Mediterranean Operations",
    isMain: false,
    isEpicenter: false,
    color: "#10b981",
    stats: "Phân bổ 610 khách • Khối doanh nghiệp vừa",
  },
];

type MapStyle = "streets" | "satellite" | "dark";

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  streets: {
    // Google Maps / Voyager Clean Style
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  },
  satellite: {
    // Real Satellite Imagery from Esri
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> Earthstar Geographics',
  },
  dark: {
    // Dark FinTech Cyber Mode
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  },
};

export default function InteractiveRegionMap() {
  const [selectedCountry, setSelectedCountry] = useState<string>("Germany");
  const [mapStyle, setMapStyle] = useState<MapStyle>("streets");
  const [activeHub, setActiveHub] = useState<any>(CITY_HUBS[0]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const activeData = COUNTRIES_DATA[selectedCountry] || COUNTRIES_DATA["Germany"];

  // Initialize Real Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      // If already initialized, remove previous
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center around Western Europe (France, Germany, Spain)
      const map = L.map(mapContainerRef.current, {
        center: [46.5, 4.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add Tile Layer
      const currentConfig = TILE_LAYERS[mapStyle];
      tileLayerRef.current = L.tileLayer(currentConfig.url, {
        attribution: currentConfig.attribution,
        maxZoom: 18,
        subdomains: ["a", "b", "c", "d"],
      }).addTo(map);

      // Add Country Territory Glowing Zones (Circle Bounds)
      const territories = [
        { name: "Germany", center: [51.1657, 10.4515], radius: 290000, color: "#f59e0b" },
        { name: "France", center: [46.6034, 1.8883], radius: 360000, color: "#3b82f6" },
        { name: "Spain", center: [40.4637, -3.7492], radius: 340000, color: "#10b981" },
      ];

      territories.forEach((t) => {
        L.circle(t.center as [number, number], {
          radius: t.radius,
          color: t.color,
          fillColor: t.color,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "4 4",
        }).addTo(map);
      });

      // Add Animated Telemetry Arcs (Connecting Frankfurt, Paris, Madrid)
      const connections = [
        { from: [50.1109, 8.6821], to: [48.8566, 2.3522], color: "#60a5fa" }, // Frankfurt <-> Paris
        { from: [50.1109, 8.6821], to: [40.4168, -3.7038], color: "#f59e0b" }, // Frankfurt <-> Madrid
        { from: [48.8566, 2.3522], to: [40.4168, -3.7038], color: "#34d399" }, // Paris <-> Madrid
      ];

      connections.forEach((conn) => {
        L.polyline([conn.from as [number, number], conn.to as [number, number]], {
          color: conn.color,
          weight: 2.5,
          opacity: 0.8,
          dashArray: "6 8",
          className: "animate-dash-flow",
        }).addTo(map);
      });

      // Add Glowing Beacons for all City Hubs
      CITY_HUBS.forEach((hub) => {
        const isMain = hub.isMain;
        const color = hub.color;

        // Custom HTML Marker with Tailwind animations
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
            <!-- Outer Pulsing Radar Wave -->
            <span class="absolute inline-flex ${
              isMain ? "w-10 h-10" : "w-7 h-7"
            } rounded-full opacity-60 animate-ping" style="background-color: ${color};"></span>
            
            <!-- Secondary Ambient Glow -->
            <span class="absolute inline-flex ${
              isMain ? "w-12 h-12" : "w-8 h-8"
            } rounded-full opacity-30 animate-pulse border-2" style="border-color: ${color};"></span>

            <!-- Core Solid Hub Dot -->
            <span class="relative inline-flex items-center justify-center rounded-full ${
              isMain ? "w-6 h-6" : "w-4 h-4"
            } shadow-2xl border-2 border-white text-[10px] font-bold text-white transition-transform group-hover:scale-125" style="background-color: ${color};">
              ${hub.isEpicenter ? "🚨" : ""}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: "custom-glowing-marker",
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const popupContent = `
          <div style="font-family: inherit; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 800; font-size: 13px; color: #ffffff;">${hub.name}</span>
              <span style="font-size: 9px; padding: 2px 6px; border-radius: 9999px; font-weight: 700; background: ${
                hub.isEpicenter ? "#ef444430; color: #fca5a5; border: 1px solid #ef4444" : "#3b82f630; color: #93c5fd"
              }">${hub.country}</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: ${color}; margin-bottom: 4px;">${hub.role}</div>
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">${hub.stats}</div>
          </div>
        `;

        const marker = L.marker([hub.lat, hub.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);

        marker.on("click", () => {
          setSelectedCountry(hub.country);
          setActiveHub(hub);
        });
      });
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer on MapStyle change without re-creating map
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    import("leaflet").then((L) => {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newConfig = TILE_LAYERS[mapStyle];
      tileLayerRef.current = L.default.tileLayer(newConfig.url, {
        attribution: newConfig.attribution,
        maxZoom: 18,
        subdomains: ["a", "b", "c", "d"],
      }).addTo(mapInstanceRef.current);
    });
  }, [mapStyle]);

  // Smooth FlyTo when country changes
  const flyToCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    if (!mapInstanceRef.current) return;

    if (countryKey === "ALL") {
      mapInstanceRef.current.flyTo([46.5, 4.0], 5, { duration: 1.5 });
    } else {
      const data = COUNTRIES_DATA[countryKey];
      if (data) {
        mapInstanceRef.current.flyTo(data.center, data.zoom, { duration: 1.5 });
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#091426] border-2 border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-2xl">
      {/* Background Subtle Radar Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Dynamic ambient background glow */}
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

      {/* REAL MAP COMMAND CENTER HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
              REAL GIS SATELLITE & STREET TELEMETRY &bull; 60FPS INTERACTIVE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] text-slate-300 font-mono">
              Tọa Độ Thực Tế 100%
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-blue-400" />
            <span>Bản Đồ Vệ Tinh & Địa Lý Thực Tế 3 Vùng Hoạt Động (Google Maps Style)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Bản đồ tương tác thời gian thực: Bạn có thể <b>kéo rê chuột (pan)</b>, <b>phóng to/thu nhỏ (zoom)</b>, 
            chuyển chế độ <b>Vệ tinh thực tế (Satellite)</b> / <b>Đường phố (Street)</b>, và nhấp vào các điểm phát sáng để xem dữ liệu rủi ro từng thành phố.
          </p>
        </div>

        {/* Map Style Selector & Reset View */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMapStyle("streets")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapStyle === "streets" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              🗺️ Đường Phố
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapStyle === "satellite" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              🛰️ Vệ Tinh
            </button>
            <button
              onClick={() => setMapStyle("dark")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapStyle === "dark" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              🌙 FinTech Dark
            </button>
          </div>
        </div>
      </div>

      {/* QUICK FLIGHT CAMERA BUTTONS */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Bay nhanh đến vùng:</span>
        </span>
        <button
          onClick={() => flyToCountry("ALL")}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          🌍 Toàn Cảnh (3 Nước)
        </button>
        <button
          onClick={() => flyToCountry("Germany")}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCountry === "Germany"
              ? "bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300"
          }`}
        >
          <span>🇩🇪 Đức (Tâm chấn 32.44%)</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </button>
        <button
          onClick={() => flyToCountry("France")}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCountry === "France"
              ? "bg-blue-950/60 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300"
          }`}
        >
          <span>🇫🇷 Pháp (50.14% Quy mô)</span>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        </button>
        <button
          onClick={() => flyToCountry("Spain")}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCountry === "Spain"
              ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300"
          }`}
        >
          <span>🇪🇸 Tây Ban Nha (24.77%)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* MAP AND HUD CONTAINER */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEAFLET REAL MAP CONTAINER (8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl relative min-h-[520px] bg-slate-950 flex flex-col">
          {/* Real Leaflet Map Mount Point */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[520px] flex-1 z-10" />

          {/* Map Overlay Badge */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-[10px] text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>12 Hubs Phát Sáng Hoạt Động &bull; Click vào chấm để xem chi tiết</span>
          </div>
        </div>

        {/* REGIONAL TELEMETRY HUD CARD (4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex-1">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeData.color }}
            ></div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeData.flag}</span>
                <div>
                  <h3 className="font-extrabold text-base text-white">{activeData.name}</h3>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Mã Quốc Gia: {activeData.code} &bull; Tọa Độ GPS Thực Tế
                  </span>
                </div>
              </div>

              {activeData.isEpicenter && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold animate-pulse">
                  🚨 TÂM CHẤN
                </span>
              )}
            </div>

            {/* Risk Status Banner */}
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

            {/* Selected Active Hub Spotlight */}
            <div className="border-t border-slate-800/80 pt-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Chi Nhánh Đang Chọn</span>
                <span className="text-emerald-400 text-[10px] font-mono">● Trực Tuyến 24/7</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeHub.color }}></span>
                  <span>{activeHub.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({activeHub.lat.toFixed(2)}°N, {activeHub.lng.toFixed(2)}°E)
                  </span>
                </div>
                <div className="text-[11px] text-blue-300 font-medium mt-1">{activeHub.role}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{activeHub.stats}</div>
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
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
