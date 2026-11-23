"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { COUNTRIES_DATA, CountryStat } from "@/lib/mapBranchesData";
import { formatInt } from "@/lib/formatters";
import type { ThemeMode } from "./AppShell";

export type MapStyle = "osm" | "voyager" | "satellite" | "dark";

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
        duration: 1.2,
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
  theme,
}: {
  countries: CountryStat[];
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
  theme: ThemeMode;
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
    const isDark = theme === "dark";

    countries.forEach((country) => {
      const isSelected = selectedCountry === country.geographyValue;
      const pinColor = country.isEpicenter ? "#ef4444" : country.color;
      const labelBg = isDark ? "rgba(9, 20, 38, 0.94)" : "rgba(255, 255, 255, 0.96)";
      const labelTitleColor = isDark ? "#ffffff" : "#0f172a";
      const labelSubColor = country.isEpicenter
        ? isDark
          ? "#fca5a5"
          : "#dc2626"
        : isDark
        ? "#6ee7b7"
        : "#047857";

      const iconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group" style="width: 158px; height: 72px;">
          <div class="relative flex items-center justify-center" style="width: 42px; height: 42px;">
            <span class="absolute inline-flex w-10 h-10 rounded-full opacity-55 animate-ping" style="background-color: ${pinColor};"></span>
            <span class="absolute inline-flex w-11 h-11 rounded-full opacity-35 animate-pulse border-2" style="border-color: ${pinColor};"></span>
            <span class="relative inline-flex items-center justify-center rounded-full w-9 h-9 shadow-lg border-2 border-white text-xs font-extrabold text-white transition-transform group-hover:scale-110 font-mono" style="background-color: ${pinColor};">
              ${country.code}
            </span>
          </div>
          <div style="margin-top: 3px; background: ${labelBg}; border: 1.5px solid ${
            isSelected ? (isDark ? "#ffffff" : "#0f172a") : pinColor
          }; border-radius: 8px; padding: 2px 8px; white-space: nowrap; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);">
            <div style="font-size: 10px; font-weight: 800; color: ${labelTitleColor}; text-align: center; line-height: 1.25;">
              ${country.geographyValue.toUpperCase()} &bull; ${formatInt(country.customers)} KH
            </div>
            <div style="font-size: 9px; font-weight: 700; color: ${labelSubColor}; text-align: center; font-family: monospace; line-height: 1.15;">
              Churn: ${country.churnRatePct} (${country.totalBalanceMEur})
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-glowing-marker",
        html: iconHtml,
        iconSize: [158, 72],
        iconAnchor: [79, 21],
        popupAnchor: [0, -20],
      });

      const marker = L.marker(country.center, {
        icon: customIcon,
      });

      const cardBg = isDark ? "rgba(2, 6, 23, 0.85)" : "#f8fafc";
      const cardBorder = isDark ? "rgba(51, 65, 85, 0.75)" : "#e2e8f0";
      const headingColor = isDark ? "#ffffff" : "#0f172a";
      const labelMuted = isDark ? "#94a3b8" : "#475569";

      const popupHtml = `
        <div style="font-family: inherit; min-width: 255px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: ${headingColor};">[${country.code}] ${country.name}</span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 6px; font-weight: 700; font-family: monospace; background: rgba(37, 99, 235, 0.15); color: ${
              isDark ? "#93c5fd" : "#1d4ed8"
            }; border: 1px solid rgba(37, 99, 235, 0.35);">
              ${country.geographyValue}
            </span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${
            country.isEpicenter ? (isDark ? "#fca5a5" : "#dc2626") : isDark ? "#6ee7b7" : "#047857"
          }; margin-bottom: 8px;">
            ${country.riskStatus}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: ${cardBg}; padding: 8px; border-radius: 10px; border: 1px solid ${cardBorder};">
            <div>
              <div style="font-size: 9px; color: ${labelMuted}; font-weight: 700;">QUY MÔ KHÁCH</div>
              <div style="font-size: 12px; font-weight: 800; color: ${headingColor};">${formatInt(country.customers)} (${country.pctCustomers})</div>
            </div>
            <div>
              <div style="font-size: 9px; color: ${labelMuted}; font-weight: 700;">TỔNG SỐ DƯ</div>
              <div style="font-size: 12px; font-weight: 800; color: ${isDark ? "#34d399" : "#059669"};">${country.totalBalanceMEur}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: ${labelMuted}; font-weight: 700;">TỶ LỆ CHURN</div>
              <div style="font-size: 12px; font-weight: 800; color: ${
                country.isEpicenter ? (isDark ? "#f87171" : "#dc2626") : isDark ? "#38bdf8" : "#2563eb"
              };">${country.churnRatePct} (${formatInt(country.churners)})</div>
            </div>
            <div>
              <div style="font-size: 9px; color: ${labelMuted}; font-weight: 700;">SỐ DƯ = 0 &euro;</div>
              <div style="font-size: 12px; font-weight: 800; color: ${isDark ? "#fbbf24" : "#d97706"};">${formatInt(country.zeroBalanceCount)} (${country.zeroBalancePct})</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: ${labelMuted}; text-align: center;">
            Xem chi tiết 4 phân khúc Q1&ndash;Q4 ở bảng bên phải
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
  }, [map, countries, selectedCountry, onSelectCountry, theme]);

  return null;
}

interface LeafletMapInnerProps {
  mapStyle: MapStyle;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  showGeoJson: boolean;
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null;
  theme: ThemeMode;
}

export default function LeafletMapInner({
  mapStyle,
  selectedCountry,
  onSelectCountry,
  showGeoJson,
  targetView,
  theme,
}: LeafletMapInnerProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    fetch("/geo/tri_market_countries.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const currentTile = TILE_LAYERS[mapStyle];
  const visibleCountries = Object.values(COUNTRIES_DATA);

  const geoJsonStyle = (feature: any) => {
    const countryName = feature?.properties?.name || "";
    const isSelected = selectedCountry === countryName || selectedCountry === "ALL";
    const isDark = theme === "dark";

    if (countryName === "Germany") {
      return {
        fillColor: "#ef4444",
        fillOpacity: selectedCountry === "Germany" ? 0.34 : isSelected ? (isDark ? 0.22 : 0.24) : 0.08,
        color: isDark ? "#f59e0b" : "#dc2626",
        weight: selectedCountry === "Germany" ? 3 : 2,
        dashArray: selectedCountry === "Germany" ? "" : "4 4",
      };
    }
    if (countryName === "France") {
      return {
        fillColor: "#3b82f6",
        fillOpacity: selectedCountry === "France" ? 0.34 : isSelected ? (isDark ? 0.2 : 0.22) : 0.08,
        color: isDark ? "#60a5fa" : "#2563eb",
        weight: selectedCountry === "France" ? 3 : 2,
        dashArray: selectedCountry === "France" ? "" : "4 4",
      };
    }
    if (countryName === "Spain") {
      return {
        fillColor: "#10b981",
        fillOpacity: selectedCountry === "Spain" ? 0.34 : isSelected ? (isDark ? 0.2 : 0.22) : 0.08,
        color: isDark ? "#34d399" : "#059669",
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
          [${stat.code}] ${stat.name}<br/>
          <span style="color: #2563eb;">Quy mô: ${formatInt(stat.customers)} KH (${stat.pctCustomers})</span> &bull; 
          <span style="color: ${stat.isEpicenter ? "#dc2626" : "#059669"};">Churn: ${stat.churnRatePct}</span>
        </div>`,
        { sticky: true, direction: "top" }
      );
    }
  };

  const nationalConnections: { positions: [number, number][]; color: string }[] = [
    {
      positions: [
        [51.1657, 10.4515],
        [46.6034, 1.8883],
      ],
      color: "#3b82f6",
    },
    {
      positions: [
        [51.1657, 10.4515],
        [40.4637, -3.7492],
      ],
      color: "#f59e0b",
    },
    {
      positions: [
        [46.6034, 1.8883],
        [40.4637, -3.7492],
      ],
      color: "#10b981",
    },
  ];

  return (
    <MapContainer
      center={[46.8, 3.8]}
      zoom={5}
      minZoom={4}
      maxZoom={11}
      maxBounds={[
        [30, -16],
        [60, 24],
      ]}
      maxBoundsViscosity={0.85}
      scrollWheelZoom={true}
      className="w-full h-full min-h-[520px] z-10"
    >
      <TileLayer
        key={mapStyle}
        url={currentTile.url}
        attribution={currentTile.attribution}
      />

      <MapCameraController targetView={targetView} />

      {showGeoJson && geoJsonData && (
        <GeoJSON
          key={`geojson-${selectedCountry}-${theme}`}
          data={geoJsonData}
          style={geoJsonStyle}
          onEachFeature={onEachCountryFeature}
        />
      )}

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

      <NationalMarkersLayer
        countries={visibleCountries}
        selectedCountry={selectedCountry}
        onSelectCountry={onSelectCountry}
        theme={theme}
      />
    </MapContainer>
  );
}
