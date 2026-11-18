"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { DataSegmentNode, COUNTRIES_DATA } from "@/lib/mapBranchesData";

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

// Stage 2: MarkerCluster Layer for Real Dataset Segment Nodes
function SegmentMarkerClusterLayer({
  nodes,
  enableClustering,
  onSelectNode,
  onSelectCountry,
}: {
  nodes: DataSegmentNode[];
  enableClustering: boolean;
  onSelectNode: (n: DataSegmentNode) => void;
  onSelectCountry: (c: string) => void;
}) {
  const map = useMap();
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    const group = enableClustering
      ? (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 65,
          spiderfyOnMaxZoom: true,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: any) => {
            const childMarkers = cluster.getAllChildMarkers();
            const count = childMarkers.length;
            const hasGermany = childMarkers.some(
              (m: any) => m.options.nodeData?.country === "Germany"
            );
            const isFrance = childMarkers.every(
              (m: any) => m.options.nodeData?.country === "France"
            );
            const clusterColor = hasGermany
              ? "#ef4444"
              : isFrance
              ? "#3b82f6"
              : "#10b981";

            return L.divIcon({
              html: `
                <div class="relative flex items-center justify-center" style="width: 48px; height: 48px;">
                  <span class="absolute inline-flex w-12 h-12 rounded-full opacity-55 animate-ping" style="background-color: ${clusterColor};"></span>
                  <span class="absolute inline-flex w-12 h-12 rounded-full opacity-35 border-2 animate-pulse" style="border-color: ${clusterColor};"></span>
                  <div class="relative flex flex-col items-center justify-center w-10 h-10 rounded-full text-white font-extrabold text-xs shadow-2xl border-2 border-white" style="background: ${clusterColor};">
                    <span>${count}</span>
                    <span style="font-size: 7px; line-height: 7px; font-weight: 700;">CỤM DB</span>
                  </div>
                </div>
              `,
              className: "custom-cluster-icon",
              iconSize: L.point(48, 48),
            });
          },
        })
      : L.layerGroup();

    nodes.forEach((node) => {
      const isNational = node.quadrantCode === "NATIONAL_TOTAL";
      const isQ1 = node.quadrantCode === "Q1_VIP_At_Risk";
      const pinColor = node.color;
      const shortBadge =
        node.quadrantCode === "NATIONAL_TOTAL"
          ? node.country === "Germany"
            ? "DE"
            : node.country === "France"
            ? "FR"
            : "ES"
          : node.quadrantCode.slice(0, 2);

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 40px; height: 40px;">
          <!-- Outer Pulsing Radar Wave -->
          <span class="absolute inline-flex ${
            isNational || isQ1 ? "w-11 h-11" : "w-8 h-8"
          } rounded-full opacity-60 animate-ping" style="background-color: ${pinColor};"></span>
          
          <!-- Secondary Ambient Glow -->
          <span class="absolute inline-flex ${
            isNational || isQ1 ? "w-12 h-12" : "w-9 h-9"
          } rounded-full opacity-35 animate-pulse border-2" style="border-color: ${pinColor};"></span>

          <!-- Core Solid Segment Pin -->
          <span class="relative inline-flex items-center justify-center rounded-full ${
            isNational ? "w-8 h-8" : "w-6 h-6"
          } shadow-2xl border-2 border-white text-[9px] font-extrabold text-white transition-transform group-hover:scale-125 font-mono" style="background-color: ${pinColor};">
            ${shortBadge}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-glowing-marker",
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([node.lat, node.lng], {
        icon: customIcon,
        ...({ nodeData: node } as any),
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #ffffff;">${node.name}</span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 6px; font-weight: 800; font-family: monospace; background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid #3b82f6;">
              ${node.id}
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${pinColor}; margin-bottom: 4px;">
            ${node.quadrantLabel}
          </div>
          <div style="font-size: 10px; color: #cbd5e1; font-family: monospace; margin-bottom: 8px;">
            📊 ${node.dataSourceNote}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 10px; border: 1px solid rgba(51, 65, 85, 0.7);">
            <div>
              <div style="font-size: 9px; color: #94a3b8;">SỐ KHÁCH HÀNG</div>
              <div style="font-size: 12px; font-weight: 800; color: #ffffff;">${node.customers.toLocaleString()} (${node.pctOfCountry}%)</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TỔNG SỐ DƯ</div>
              <div style="font-size: 12px; font-weight: 800; color: #34d399;">${node.balanceMEur}M €</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #94a3b8;">TỶ LỆ CHURN</div>
              <div style="font-size: 12px; font-weight: 800; color: ${
                node.actualChurnRatePct >= 30 ? "#f87171" : "#38bdf8"
              };">${node.actualChurnRatePct}%</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #cbd5e1; line-height: 1.35;">
            🎯 <b>Chiến lược:</b> ${node.strategyAction}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectNode(node);
        onSelectCountry(node.country);
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
  }, [map, nodes, enableClustering, onSelectNode, onSelectCountry]);

  return null;
}

interface LeafletMapInnerProps {
  mapStyle: MapStyle;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  nodes: DataSegmentNode[];
  onSelectNode: (node: DataSegmentNode) => void;
  enableClustering: boolean;
  showGeoJson: boolean;
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null;
}

export default function LeafletMapInner({
  mapStyle,
  selectedCountry,
  onSelectCountry,
  nodes,
  onSelectNode,
  enableClustering,
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

  // Stage 3: Real GeoJSON Country Polygon Styling
  const geoJsonStyle = (feature: any) => {
    const countryName = feature?.properties?.name || "";
    const isSelected = selectedCountry === countryName || selectedCountry === "ALL";

    if (countryName === "Germany") {
      return {
        fillColor: "#ef4444",
        fillOpacity: selectedCountry === "Germany" ? 0.3 : isSelected ? 0.18 : 0.08,
        color: "#f59e0b",
        weight: selectedCountry === "Germany" ? 3 : 2,
        dashArray: selectedCountry === "Germany" ? "" : "4 4",
      };
    }
    if (countryName === "France") {
      return {
        fillColor: "#3b82f6",
        fillOpacity: selectedCountry === "France" ? 0.3 : isSelected ? 0.16 : 0.08,
        color: "#60a5fa",
        weight: selectedCountry === "France" ? 3 : 2,
        dashArray: selectedCountry === "France" ? "" : "4 4",
      };
    }
    if (countryName === "Spain") {
      return {
        fillColor: "#10b981",
        fillOpacity: selectedCountry === "Spain" ? 0.3 : isSelected ? 0.16 : 0.08,
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
          fillOpacity: 0.36,
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
          <span style="color: ${stat.isEpicenter ? "#f87171" : "#34d399"};">Churn: ${stat.churnRatePct}</span><br/>
          <span style="color: #cbd5e1; font-size: 10px;">Số dư = 0€: ${stat.zeroBalanceCount.toLocaleString()} KH (${stat.zeroBalancePct})</span>
        </div>`,
        { sticky: true, direction: "top" }
      );
    }
  };

  // Connecting the 3 National Geography Centers (Germany <-> France <-> Spain)
  const nationalConnections: { positions: [number, number][]; color: string }[] = [
    {
      positions: [
        [51.1657, 10.4515], // Germany National Center
        [46.6034, 1.8883], // France National Center
      ],
      color: "#60a5fa",
    },
    {
      positions: [
        [51.1657, 10.4515], // Germany National Center
        [40.4637, -3.7492], // Spain National Center
      ],
      color: "#f59e0b",
    },
    {
      positions: [
        [46.6034, 1.8883], // France National Center
        [40.4637, -3.7492], // Spain National Center
      ],
      color: "#34d399",
    },
  ];

  return (
    <MapContainer
      center={[46.8, 4.2]}
      zoom={5}
      minZoom={3}
      maxZoom={15}
      scrollWheelZoom={true}
      className="w-full h-full min-h-[540px] z-10"
    >
      {/* STAGE 1: OpenStreetMap & Multi-layer Tile Rendering */}
      <TileLayer
        key={mapStyle}
        url={currentTile.url}
        attribution={currentTile.attribution}
      />

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

      {/* STAGE 2: Database Segment Markers with MarkerCluster */}
      <SegmentMarkerClusterLayer
        nodes={nodes}
        enableClustering={enableClustering}
        onSelectNode={onSelectNode}
        onSelectCountry={onSelectCountry}
      />
    </MapContainer>
  );
}
