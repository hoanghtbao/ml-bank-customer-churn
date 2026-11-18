"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { COUNTRIES_DATA, CountryStat } from "@/lib/mapBranchesData";

export type MapStyle = "osm" | "voyager" | "satellite" | "dark";

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> World Imagery',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
};

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

// Renders ONLY the 3 National Markers corresponding to the 3 values of Geography in CSV
function NationalMarkersLayer({
  countries,
  selectedCountry,
  onSelectCountry,
}: {
  countries: CountryStat[];
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
}) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    const group = L.layerGroup();

    countries.forEach((country) => {
      const isSelected = selectedCountry === country.geographyValue;
      const pinColor = country.isEpicenter ? "#ef4444" : country.color;

      const iconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group" style="width: 150px; height: 70px;">
          <!-- Pulsing Radar Rings -->
          <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
            <span class="absolute inline-flex w-11 h-11 rounded-full opacity-60 animate-ping" style="background-color: ${pinColor};"></span>
            <span class="absolute inline-flex w-12 h-12 rounded-full opacity-40 animate-pulse border-2" style="border-color: ${pinColor};"></span>
            <span class="relative inline-flex items-center justify-center rounded-full w-9 h-9 shadow-2xl border-2 border-white text-sm font-extrabold text-white transition-transform group-hover:scale-110" style="background-color: ${pinColor};">
              ${country.flag}
            </span>
          </div>
          <!-- Floating National Badge Label -->
          <div style="margin-top: 2px; background: rgba(9, 20, 38, 0.94); border: 1.5px solid ${
            isSelected ? "#ffffff" : pinColor
          }; border-radius: 8px; padding: 2px 8px; white-space: nowrap; box-shadow: 0 6px 14px rgba(0,0,0,0.45);">
            <div style="font-size: 10px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.2;">
              ${country.geographyValue.toUpperCase()} • ${country.customers.toLocaleString()} KH
            </div>
            <div style="font-size: 9px; font-weight: 700; color: ${
              country.isEpicenter ? "#fca5a5" : "#6ee7b7"
            }; text-align: center; font-family: monospace; line-height: 1.1;">
              Churn: ${country.churnRatePct} (${country.totalBalanceMEur})
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-glowing-marker",
        html: iconHtml,
        iconSize: [150, 70],
        iconAnchor: [75, 22],
        popupAnchor: [0, -22],
      });

      const marker = L.marker(country.center, {
        icon: customIcon,
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 255px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #ffffff;">${country.flag} ${country.name}</span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 6px; font-weight: 800; font-family: monospace; background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid #3b82f6;">
              Geography='${country.geographyValue}'
            </span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${
            country.isEpicenter ? "#fca5a5" : "#6ee7b7"
          }; margin-bottom: 8px;">
            ${country.riskStatus}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: rgba(2, 6, 23, 0.85); padding: 8px; border-radius: 10px; border: 1px solid rgba(51, 65, 85, 0.75);">
            <div>
              <div style="font-size: 9px; color: #94a3b8;">QUY MÔ KHÁCH HÀNG</div>
              <div style="font-size: 12px; font-weight: 800; color: #ffffff;">${country.customers.toLocaleString()} (${country.pctCustomers})</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TỔNG SỐ DƯ TIỀN GỬI</div>
              <div style="font-size: 12px; font-weight: 800; color: #34d399;">${country.totalBalanceMEur}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TỶ LỆ CHURN THỰC TẾ</div>
              <div style="font-size: 12px; font-weight: 800; color: ${
                country.isEpicenter ? "#f87171" : "#38bdf8"
              };">${country.churnRatePct} (${country.churners} KH)</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TÀI KHOẢN SỐ DƯ = 0 €</div>
              <div style="font-size: 12px; font-weight: 800; color: #fbbf24;">${country.zeroBalanceCount.toLocaleString()} (${country.zeroBalancePct})</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #94a3b8; text-align: center;">
            👉 Xem chi tiết 4 nhóm khách hàng (Q1–Q4) ở bảng bên phải
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectCountry(country.geographyValue);
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
  }, [map, countries, selectedCountry, onSelectCountry]);

  return null;
}

interface LeafletMapInnerProps {
  mapStyle: MapStyle;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  showGeoJson: boolean;
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null;
}

export default function LeafletMapInner({
  mapStyle,
  selectedCountry,
  onSelectCountry,
  showGeoJson,
  targetView,
}: LeafletMapInnerProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    fetch("/geo/tri_market_countries.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const currentTile = TILE_LAYERS[mapStyle];

  // Filter countries if a specific country filter is selected, or show all 3
  const visibleCountries = Object.values(COUNTRIES_DATA);

  const geoJsonStyle = (feature: any) => {
    const countryName = feature?.properties?.name || "";
    const isSelected = selectedCountry === countryName || selectedCountry === "ALL";

    if (countryName === "Germany") {
      return {
        fillColor: "#ef4444",
        fillOpacity: selectedCountry === "Germany" ? 0.34 : isSelected ? 0.2 : 0.08,
        color: "#f59e0b",
        weight: selectedCountry === "Germany" ? 3.5 : 2,
        dashArray: selectedCountry === "Germany" ? "" : "4 4",
      };
    }
    if (countryName === "France") {
      return {
        fillColor: "#3b82f6",
        fillOpacity: selectedCountry === "France" ? 0.34 : isSelected ? 0.18 : 0.08,
        color: "#60a5fa",
        weight: selectedCountry === "France" ? 3.5 : 2,
        dashArray: selectedCountry === "France" ? "" : "4 4",
      };
    }
    if (countryName === "Spain") {
      return {
        fillColor: "#10b981",
        fillOpacity: selectedCountry === "Spain" ? 0.34 : isSelected ? 0.18 : 0.08,
        color: "#34d399",
        weight: selectedCountry === "Spain" ? 3.5 : 2,
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
          fillOpacity: 0.38,
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
          ${stat.flag} ${stat.name} (Geography='${stat.geographyValue}')<br/>
          <span style="color: #38bdf8;">Quy mô: ${stat.customers.toLocaleString()} KH (${stat.pctCustomers})</span> • 
          <span style="color: ${stat.isEpicenter ? "#f87171" : "#34d399"};">Churn: ${stat.churnRatePct}</span>
        </div>`,
        { sticky: true, direction: "top" }
      );
    }
  };

  // Connecting the 3 National Geography Centers (Germany <-> France <-> Spain)
  const nationalConnections: { positions: [number, number][]; color: string }[] = [
    {
      positions: [
        [51.1657, 10.4515], // Germany
        [46.6034, 1.8883], // France
      ],
      color: "#60a5fa",
    },
    {
      positions: [
        [51.1657, 10.4515], // Germany
        [40.4637, -3.7492], // Spain
      ],
      color: "#f59e0b",
    },
    {
      positions: [
        [46.6034, 1.8883], // France
        [40.4637, -3.7492], // Spain
      ],
      color: "#34d399",
    },
  ];

  return (
    <MapContainer
      center={[46.8, 4.2]}
      zoom={5}
      minZoom={3}
      maxZoom={12}
      scrollWheelZoom={true}
      className="w-full h-full min-h-[540px] z-10"
    >
      <TileLayer
        key={mapStyle}
        url={currentTile.url}
        attribution={currentTile.attribution}
      />

      <MapCameraController targetView={targetView} />

      {/* Real GeoJSON Country Polygons */}
      {showGeoJson && geoJsonData && (
        <GeoJSON
          key={`geojson-${selectedCountry}`}
          data={geoJsonData}
          style={geoJsonStyle}
          onEachFeature={onEachCountryFeature}
        />
      )}

      {/* Inter-Country Data Telemetry Links */}
      {nationalConnections.map((conn, idx) => (
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

      {/* ONLY 3 National Markers (Germany, France, Spain) */}
      <NationalMarkersLayer
        countries={visibleCountries}
        selectedCountry={selectedCountry}
        onSelectCountry={onSelectCountry}
      />
    </MapContainer>
  );
}
