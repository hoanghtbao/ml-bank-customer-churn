"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { BankBranch, COUNTRIES_DATA } from "@/lib/mapBranchesData";

export type MapStyle = "osm" | "voyager" | "satellite" | "dark";

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  osm: {
    // Stage 1: Standard OpenStreetMap World Tile Layer
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  voyager: {
    // Clean Google Maps / CartoDB Voyager Style
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
  satellite: {
    // High-Res Real Satellite Imagery
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> World Imagery',
  },
  dark: {
    // FinTech Cyber Dark Mode
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
};

// Camera Controller Sub-component using React-Leaflet useMap()
function MapCameraController({
  targetView,
}: {
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (targetView) {
      map.flyTo(targetView.center, targetView.zoom, {
        duration: 1.35,
      });
    }
  }, [targetView, map]);
  return null;
}

// Stage 2: MarkerCluster Layer Sub-component
function MarkerClusterLayer({
  branches,
  enableClustering,
  onSelectBranch,
  onSelectCountry,
}: {
  branches: BankBranch[];
  enableClustering: boolean;
  onSelectBranch: (b: BankBranch) => void;
  onSelectCountry: (c: string) => void;
}) {
  const map = useMap();
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Clean up existing group
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    // Create either MarkerClusterGroup or normal LayerGroup
    const group = enableClustering
      ? (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 55,
          spiderfyOnMaxZoom: true,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: any) => {
            const childMarkers = cluster.getAllChildMarkers();
            const count = childMarkers.length;
            // Check if cluster has critical branches (Germany)
            const hasCritical = childMarkers.some(
              (m: any) => m.options.branchData?.riskLevel === "CRITICAL"
            );
            const isFrance = childMarkers.every(
              (m: any) => m.options.branchData?.country === "France"
            );
            const clusterColor = hasCritical
              ? "#ef4444"
              : isFrance
              ? "#3b82f6"
              : "#10b981";

            return L.divIcon({
              html: `
                <div class="relative flex items-center justify-center" style="width: 46px; height: 46px;">
                  <span class="absolute inline-flex w-11 h-11 rounded-full opacity-55 animate-ping" style="background-color: ${clusterColor};"></span>
                  <span class="absolute inline-flex w-12 h-12 rounded-full opacity-35 border-2 animate-pulse" style="border-color: ${clusterColor};"></span>
                  <div class="relative flex flex-col items-center justify-center w-9 h-9 rounded-full text-white font-extrabold text-xs shadow-2xl border-2 border-white" style="background: ${clusterColor};">
                    <span>${count}</span>
                    <span style="font-size: 7px; line-height: 7px; font-weight: 700;">HUB</span>
                  </div>
                </div>
              `,
              className: "custom-cluster-icon",
              iconSize: L.point(46, 46),
            });
          },
        })
      : L.layerGroup();

    branches.forEach((branch) => {
      const isHQ = branch.tier === "HQ";
      const isCritical = branch.riskLevel === "CRITICAL";
      const pinColor = branch.color;

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
          <!-- Outer Pulsing Radar Wave -->
          <span class="absolute inline-flex ${
            isHQ ? "w-11 h-11" : "w-8 h-8"
          } rounded-full opacity-60 animate-ping" style="background-color: ${pinColor};"></span>
          
          <!-- Secondary Ambient Glow -->
          <span class="absolute inline-flex ${
            isHQ ? "w-12 h-12" : "w-9 h-9"
          } rounded-full opacity-35 animate-pulse border-2" style="border-color: ${pinColor};"></span>

          <!-- Core Solid Branch Marker -->
          <span class="relative inline-flex items-center justify-center rounded-full ${
            isHQ ? "w-7 h-7" : "w-5 h-5"
          } shadow-2xl border-2 border-white text-[10px] font-bold text-white transition-transform group-hover:scale-125" style="background-color: ${pinColor};">
            ${isHQ ? "🏛️" : isCritical ? "!" : "●"}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-glowing-marker",
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([branch.lat, branch.lng], {
        icon: customIcon,
        // Attach custom metadata for cluster inspection
        ...({ branchData: branch } as any),
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 235px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #ffffff;">${branch.name}</span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 6px; font-weight: 800; font-family: monospace; background: ${
              isCritical ? "#ef444430; color: #fca5a5; border: 1px solid #ef4444" : "#3b82f630; color: #93c5fd; border: 1px solid #3b82f6"
            }">${branch.id}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${pinColor}; margin-bottom: 4px;">
            ${branch.tierLabel}
          </div>
          <div style="font-size: 10px; color: #cbd5e1; margin-bottom: 8px;">
            📍 ${branch.address}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; background: rgba(2, 6, 23, 0.75); padding: 8px; border-radius: 10px; border: 1px solid rgba(51, 65, 85, 0.7);">
            <div>
              <div style="font-size: 9px; color: #94a3b8;">KHÁCH HÀNG</div>
              <div style="font-size: 12px; font-weight: 800; color: #ffffff;">${branch.customers.toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TIỀN GỬI</div>
              <div style="font-size: 12px; font-weight: 800; color: #34d399;">${branch.balanceMEur}M €</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">CHURN RATE</div>
              <div style="font-size: 12px; font-weight: 800; color: ${
                branch.churnRatePct >= 28 ? "#f87171" : "#38bdf8"
              };">${branch.churnRatePct}%</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>👤 Quản lý: <b style="color: #e2e8f0;">${branch.manager}</b></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectBranch(branch);
        onSelectCountry(branch.country);
      });

      group.addLayer(marker);
    });

    map.addLayer(group);
    layerGroupRef.current = group;

    return () => {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map, branches, enableClustering, onSelectBranch, onSelectCountry]);

  return null;
}

interface LeafletMapInnerProps {
  mapStyle: MapStyle;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  branches: BankBranch[];
  onSelectBranch: (branch: BankBranch) => void;
  enableClustering: boolean;
  showGeoJson: boolean;
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null;
}

export default function LeafletMapInner({
  mapStyle,
  selectedCountry,
  onSelectCountry,
  branches,
  onSelectBranch,
  enableClustering,
  showGeoJson,
  targetView,
}: LeafletMapInnerProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Load real GeoJSON country boundaries for France, Germany, Spain
  useEffect(() => {
    fetch("/geo/tri_market_countries.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const currentTile = TILE_LAYERS[mapStyle];

  // Stage 3: GeoJSON Country Polygon Styling
  const geoJsonStyle = (feature: any) => {
    const countryName = feature?.properties?.name || "";
    const isSelected = selectedCountry === countryName || selectedCountry === "ALL";

    if (countryName === "Germany") {
      return {
        fillColor: "#ef4444",
        fillOpacity: selectedCountry === "Germany" ? 0.28 : isSelected ? 0.18 : 0.08,
        color: "#f59e0b",
        weight: selectedCountry === "Germany" ? 3 : 2,
        dashArray: selectedCountry === "Germany" ? "" : "4 4",
      };
    }
    if (countryName === "France") {
      return {
        fillColor: "#3b82f6",
        fillOpacity: selectedCountry === "France" ? 0.28 : isSelected ? 0.16 : 0.08,
        color: "#60a5fa",
        weight: selectedCountry === "France" ? 3 : 2,
        dashArray: selectedCountry === "France" ? "" : "4 4",
      };
    }
    if (countryName === "Spain") {
      return {
        fillColor: "#10b981",
        fillOpacity: selectedCountry === "Spain" ? 0.28 : isSelected ? 0.16 : 0.08,
        color: "#34d399",
        weight: selectedCountry === "Spain" ? 3 : 2,
        dashArray: selectedCountry === "Spain" ? "" : "4 4",
      };
    }
    return {
      fillColor: "#64748b",
      fillOpacity: 0.1,
      color: "#94a3b8",
      weight: 1,
    };
  };

  const onEachCountryFeature = (feature: any, layer: L.Layer) => {
    const countryName = feature?.properties?.name;
    const stat = COUNTRIES_DATA[countryName];

    layer.on({
      click: () => {
        if (countryName && COUNTRIES_DATA[countryName]) {
          onSelectCountry(countryName);
        }
      },
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 3.5,
          fillOpacity: 0.35,
        });
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle(geoJsonStyle(feature));
      },
    });

    if (stat) {
      layer.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; font-weight: 700;">
          ${stat.flag} ${stat.name}<br/>
          <span style="color: #38bdf8;">Quy mô: ${stat.customers.toLocaleString()} KH (${stat.pctCustomers})</span> • 
          <span style="color: ${stat.isEpicenter ? "#f87171" : "#34d399"};">Churn: ${stat.churnRatePct}</span>
        </div>`,
        { sticky: true, direction: "top" }
      );
    }
  };

  // Inter-HQ Telemetry Lines (Frankfurt <-> Paris <-> Madrid)
  const hqConnections: { positions: [number, number][]; color: string }[] = [
    {
      positions: [
        [50.1125, 8.6724], // Frankfurt HQ
        [48.8924, 2.2369], // Paris HQ
      ],
      color: "#60a5fa",
    },
    {
      positions: [
        [50.1125, 8.6724], // Frankfurt HQ
        [40.4469, -3.6919], // Madrid HQ
      ],
      color: "#f59e0b",
    },
    {
      positions: [
        [48.8924, 2.2369], // Paris HQ
        [40.4469, -3.6919], // Madrid HQ
      ],
      color: "#34d399",
    },
  ];

  return (
    <MapContainer
      center={[46.8, 4.2]}
      zoom={5}
      minZoom={3}
      maxZoom={17}
      scrollWheelZoom={true}
      className="w-full h-full min-h-[540px] z-10"
    >
      {/* STAGE 1: OpenStreetMap & Multi-layer Tile Rendering */}
      <TileLayer
        key={mapStyle}
        url={currentTile.url}
        attribution={currentTile.attribution}
      />

      {/* Camera FlyTo Controller */}
      <MapCameraController targetView={targetView} />

      {/* STAGE 3: Real GeoJSON Country Polygons */}
      {showGeoJson && geoJsonData && (
        <GeoJSON
          key={`geojson-${selectedCountry}`}
          data={geoJsonData}
          style={geoJsonStyle}
          onEachFeature={onEachCountryFeature}
        />
      )}

      {/* Animated Inter-HQ Data Telemetry Links */}
      {hqConnections.map((conn, idx) => (
        <Polyline
          key={idx}
          positions={conn.positions}
          pathOptions={{
            color: conn.color,
            weight: 2.5,
            opacity: 0.85,
            dashArray: "6 8",
            className: "animate-dash-flow",
          }}
        />
      ))}

      {/* STAGE 2: Bank Branches with MarkerCluster */}
      <MarkerClusterLayer
        branches={branches}
        enableClustering={enableClustering}
        onSelectBranch={onSelectBranch}
        onSelectCountry={onSelectCountry}
      />
    </MapContainer>
  );
}
