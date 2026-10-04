"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Globe,
  Key,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { CameraNode, TransitTrajectory, DistrictInfo } from './GpsTransitMapPage';
import { DISTRICT_TRAJECTORIES, BLOCKED_VEHICLES_DATA } from './GpsTransitMapPage';
import { BACKEND_URL } from '@/lib/config';
import { fetchOsrmRoadRoute } from '@/lib/osrmRoute';
import PlateReadModal, { PlateReadData } from './PlateReadModal';

interface RealLeafletDistrictMapProps {
  currentTrajectory: TransitTrajectory;
  districts: DistrictInfo[];
  cameras: CameraNode[];
  activeDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  onSelectPlate?: (plate: string) => void;
}

// Read CARTO API key from Next.js public environment
const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY || '';
const CARTO_KEY_PARAM = CARTO_API_KEY.trim() ? `?api_key=${CARTO_API_KEY.trim()}` : '';

// CARTO Basemap Engine configurations
export const TILE_LAYERS = {
  satellite: {
    name: 'Satellite Aerial Recon (Hybrid)',
    label: 'Satellite',
    tag: 'Air Recon',
    engine: 'High-Res Satellite Mesh',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Hybrid Satellite & Transit',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
  },
  voyager: {
    name: 'CARTO Voyager',
    label: 'Voyager',
    tag: 'Editorial',
    engine: 'CARTO Basemap',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${CARTO_KEY_PARAM}`,
    attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://openstreetmap.org" target="_blank" rel="noopener">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  positron: {
    name: 'CARTO Positron',
    label: 'Positron',
    tag: 'Minimal Light',
    engine: 'CARTO Basemap',
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${CARTO_KEY_PARAM}`,
    attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://openstreetmap.org" target="_blank" rel="noopener">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  dark: {
    name: 'CARTO Dark Matter',
    label: 'Dark Matter',
    tag: 'Night Recon',
    engine: 'CARTO Basemap',
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${CARTO_KEY_PARAM}`,
    attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://openstreetmap.org" target="_blank" rel="noopener">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
};

// Real District Boundary Coordinates (Lat/Lng Polygons)
export const DISTRICT_GEO_POLYGONS: Record<string, [number, number][]> = {
  'bengaluru-urban': [
    [12.82, 77.46],
    [12.78, 77.68],
    [12.84, 77.78],
    [13.02, 77.76],
    [13.14, 77.64],
    [13.12, 77.48],
    [12.96, 77.44],
    [12.82, 77.46],
  ],
  ramanagara: [
    [12.58, 77.16],
    [12.78, 77.18],
    [12.82, 77.46],
    [12.65, 77.50],
    [12.48, 77.28],
    [12.58, 77.16],
  ],
  mandya: [
    [12.38, 76.72],
    [12.56, 76.62],
    [12.72, 76.88],
    [12.58, 77.16],
    [12.34, 77.02],
    [12.38, 76.72],
  ],
  mysuru: [
    [12.12, 76.42],
    [12.36, 76.40],
    [12.42, 76.72],
    [12.24, 76.86],
    [12.02, 76.68],
    [12.12, 76.42],
  ],
  tumakuru: [
    [13.10, 76.92],
    [13.44, 76.82],
    [13.56, 77.24],
    [13.18, 77.34],
    [13.10, 76.92],
  ],
  kolar: [
    [12.92, 77.82],
    [13.24, 77.88],
    [13.30, 78.32],
    [12.96, 78.28],
    [12.92, 77.82],
  ],
  'dakshina-kannada': [
    [12.68, 74.78],
    [13.04, 74.82],
    [13.10, 75.32],
    [12.64, 75.42],
    [12.68, 74.78],
  ],
};

// Real Expressways Alignment (Lat/Lng Waypoints)
export const NH275_EXPRESSWAY_WAYPOINTS: [number, number][] = [
  [12.9081, 77.4875], // Kengeri NICE Interchange
  [12.854, 77.432], // Kumbalgodu / Bidadi Industrial
  [12.7985, 77.3824], // Bidadi Bypass
  [12.7214, 77.281], // Ramanagara Toll (CAM-CRASH)
  [12.6512, 77.195], // Channapatna Bypass
  [12.584, 77.0512], // Maddur Bypass
  [12.5244, 76.8969], // Mandya Bypass (CAM-TT2)
  [12.445, 76.782], // Srirangapatna Bypass
  [12.4215, 76.698], // Paschimavahini
  [12.3375, 76.6578], // Mysuru Columbia Asia Toll (CAM-MYS)
];

export const NH44_ELEVATED_WAYPOINTS: [number, number][] = [
  [12.9172, 77.6228], // Silk Board Junction (CAM-01)
  [12.895, 77.635], // Bommanahalli
  [12.871, 77.648], // Kudlu Gate
  [12.8452, 77.6602], // Electronic City Toll Plaza (CAM-02)
];

export const NICE_ROAD_WAYPOINTS: [number, number][] = [
  [12.8452, 77.6602], // Electronic City NICE Junction
  [12.855, 77.56], // Bannerghatta / Kanakapura Exit
  [12.9081, 77.4875], // Kengeri / NH-275 Interchange (CAM-04)
];

export const RealLeafletDistrictMap: React.FC<RealLeafletDistrictMapProps> = ({
  currentTrajectory,
  districts,
  cameras,
  activeDistrictId,
  onSelectDistrict,
  onSelectPlate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vectorLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const initialBasemap = (process.env.NEXT_PUBLIC_CARTO_BASEMAP as keyof typeof TILE_LAYERS) || 'voyager';
  const [activeTileStyle, setActiveTileStyle] = useState<keyof typeof TILE_LAYERS>(
    initialBasemap in TILE_LAYERS ? initialBasemap : 'voyager'
  );
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [showHighways, setShowHighways] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // Rekor Scout Floating Dispatch Card State (matching Image 2)
  const [dispatchTab, setDispatchTab] = useState<'alerts' | 'search'>('alerts');
  const [showDispatchCard, setShowDispatchCard] = useState<boolean>(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [dispatchQuery, setDispatchQuery] = useState<string>('');
  const [selectedPlateModal, setSelectedPlateModal] = useState<PlateReadData | null>(null);

  // Invalidate map size to prevent gray tiles and ensure proper viewport rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 500);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const container = mapContainerRef.current;

      // Center on Bengaluru - Mysuru Expressway Corridor
      const map = L.map(container, {
        center: [12.72, 77.15],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        trackResize: true,
      });

      // Add zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add base tile layer
      const config = TILE_LAYERS[activeTileStyle];
      const tileLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        subdomains: config.subdomains,
        keepBuffer: 6,
        updateWhenIdle: false,
        updateWhenZooming: false,
      }).addTo(map);
      tileLayer.bringToBack();
      tileLayerRef.current = tileLayer;

      // Create Layer Groups
      const vectorGroup = L.layerGroup().addTo(map);
      vectorLayersGroupRef.current = vectorGroup;

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      // Mousemove coordinates listener
      map.on('mousemove', (e) => {
        setCursorCoords({
          lat: parseFloat(e.latlng.lat.toFixed(4)),
          lng: parseFloat(e.latlng.lng.toFixed(4)),
        });
      });

      mapInstanceRef.current = map;

      // Multi-tick invalidate size so the full tile grid renders immediately across the whole container
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => map.invalidateSize(), 300);
      setTimeout(() => map.invalidateSize(), 800);
      setTimeout(() => map.invalidateSize(), 1500);

      // ResizeObserver to automatically adapt whenever container size changes
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        ro.observe(container);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when active style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = TILE_LAYERS[activeTileStyle];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains,
      keepBuffer: 6,
      updateWhenIdle: false,
      updateWhenZooming: false,
    }).addTo(map);
    newLayer.bringToBack();
    map.invalidateSize();

    tileLayerRef.current = newLayer;
  }, [activeTileStyle]);

  // Render Districts, Highways, Trajectory, and Camera Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !vectorLayersGroupRef.current || !markersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const vectorGroup = vectorLayersGroupRef.current;
    const markersGroup = markersGroupRef.current;

    vectorGroup.clearLayers();
    markersGroup.clearLayers();

    // 1. RENDER DISTRICT JURISDICTION POLYGONS
    if (showDistricts) {
      districts.forEach((dist) => {
        const polyCoords = DISTRICT_GEO_POLYGONS[dist.id];
        if (!polyCoords) return;

        const isOrigin = currentTrajectory.firstSeen.districtName
          .toLowerCase()
          .includes(dist.name.toLowerCase().split(' ')[0]);
        const isDest = currentTrajectory.reappearedAt?.districtName
          .toLowerCase()
          .includes(dist.name.toLowerCase().split(' ')[0]);
        const isSelected = activeDistrictId === dist.id;

        let strokeColor = dist.color || '#94A3B8';
        let fillColor = dist.color || '#94A3B8';
        let fillOpacity = 0.08;
        let weight = 1.5;

        if (isOrigin) {
          strokeColor = '#2563EB';
          fillColor = '#3B82F6';
          fillOpacity = 0.22;
          weight = 3;
        } else if (isDest) {
          strokeColor = '#10B981';
          fillColor = '#10B981';
          fillOpacity = 0.22;
          weight = 3;
        } else if (isSelected) {
          strokeColor = '#000000';
          fillOpacity = 0.16;
          weight = 2.5;
        }

        const polygon = L.polygon(polyCoords, {
          color: strokeColor,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          weight: weight,
          dashArray: isOrigin || isDest ? undefined : '4, 4',
        });

        // Interactive tooltip
        polygon.bindTooltip(
          `<div style="font-family: Inter, sans-serif; padding: 4px 6px;">
            <div style="font-weight: 700; color: #000; font-size: 11px;">${dist.name}</div>
            <div style="font-size: 10px; color: #64748B;">RTO: ${dist.rtoCodes.join(', ')} • ${dist.totalCameras} Feeds</div>
          </div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        polygon.on('click', () => {
          onSelectDistrict(dist.id);
        });

        polygon.addTo(vectorGroup);
      });
    }

    // 2. RENDER REAL ARTERIAL HIGHWAYS (NH-275, NH-44, NICE Road)
    if (showHighways) {
      // NH-275 10-Lane Expressway
      L.polyline(NH275_EXPRESSWAY_WAYPOINTS, {
        color: '#334155',
        weight: 6,
        opacity: 0.5,
      }).addTo(vectorGroup);

      L.polyline(NH275_EXPRESSWAY_WAYPOINTS, {
        color: '#F8FAFC',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.9,
      }).addTo(vectorGroup);

      // NH-44 Elevated Highway
      L.polyline(NH44_ELEVATED_WAYPOINTS, {
        color: '#475569',
        weight: 4,
        opacity: 0.6,
      }).addTo(vectorGroup);

      // NICE Road Peripheral
      L.polyline(NICE_ROAD_WAYPOINTS, {
        color: '#64748B',
        weight: 3,
        dashArray: '4, 4',
        opacity: 0.5,
      }).addTo(vectorGroup);
    }

    // 3. RENDER VEHICLE TRANSIT TRAJECTORY
    const originCam = cameras.find((c) => c.id === currentTrajectory.firstSeen.cameraId) || cameras[0];
    const destCam = currentTrajectory.reappearedAt
      ? cameras.find((c) => c.id === currentTrajectory.reappearedAt?.cameraId) || cameras[3]
      : null;

    if (destCam) {
      let isCancelled = false;

      // Asynchronously fetch real turn-by-turn road network geometry (OSRM Google Maps style)
      fetchOsrmRoadRoute(originCam.lng, originCam.lat, destCam.lng, destCam.lat).then((roadCoords) => {
        if (isCancelled || !mapInstanceRef.current || !vectorLayersGroupRef.current) return;
        const vectorGroup = vectorLayersGroupRef.current;
        const map = mapInstanceRef.current;

        const isAlertVehicle =
          currentTrajectory.plate.includes('Z4433') ||
          currentTrajectory.plate.includes('5156') ||
          currentTrajectory.plate.includes('5074');

        // 1. Highway Outer Dark Casing (contrast layer against terrain)
        L.polyline(roadCoords, {
          color: '#0F172A',
          weight: 8,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(vectorGroup);

        // 2. Google Maps / Rekor Scout Primary Road Route Line
        L.polyline(roadCoords, {
          color: isAlertVehicle ? '#E11D48' : '#2563EB',
          weight: 5,
          opacity: 0.98,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(vectorGroup);

        // 3. High-Contrast Directional Chevrons / Center Dash
        L.polyline(roadCoords, {
          color: '#FFFFFF',
          weight: 1.5,
          dashArray: '6, 12',
          opacity: 0.9,
          lineCap: 'round',
        }).addTo(vectorGroup);

        // 4. Milestone Pulse Beads along the actual road curves
        const stride = Math.max(15, Math.floor(roadCoords.length / 8));
        for (let i = stride; i < roadCoords.length - stride; i += stride) {
          const pt = roadCoords[i];
          const waypointIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-3.5 h-3.5 rounded-full ${isAlertVehicle ? 'bg-rose-400' : 'bg-blue-400'} opacity-60 animate-ping"></div>
                <div class="absolute w-2 h-2 rounded-full bg-white border ${isAlertVehicle ? 'border-rose-600' : 'border-blue-600'} shadow"></div>
              </div>
            `,
            className: 'custom-waypoint-dot',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          L.marker(pt, { icon: waypointIcon, interactive: false }).addTo(vectorGroup);
        }

        // Auto-fit bounds with smooth Google Maps fly animation
        const bounds = L.latLngBounds(roadCoords);
        map.invalidateSize();
        map.flyToBounds(bounds, {
          padding: [70, 70],
          maxZoom: 13,
          duration: 1.2,
        });
      });
    }

    // 4. RENDER REAL CAMERA SURVEILLANCE MARKERS
    if (showCameras) {
      cameras.forEach((cam) => {
        const isOrigin = cam.id === currentTrajectory.firstSeen.cameraId;
        const isDest = cam.id === currentTrajectory.reappearedAt?.cameraId;

        // Create Custom HTML DivIcon
        let markerHtml = '';
        if (isOrigin) {
          markerHtml = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-40 animate-ping"></div>
              <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                ${cam.id.replace('CAM-', '')}
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-blue-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                ENTRY: ${cam.id}
              </div>
            </div>
          `;
        } else if (isDest) {
          markerHtml = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-emerald-500 opacity-40 animate-ping"></div>
              <div class="relative w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                ${cam.id.replace('CAM-', '')}
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-emerald-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                REAPPEAR: ${cam.id}
              </div>
            </div>
          `;
        } else {
          markerHtml = `
            <div class="relative flex items-center justify-center">
              <div class="w-5 h-5 rounded-full bg-slate-700 border-2 border-white shadow flex items-center justify-center text-white text-[8px] font-bold">
                ${cam.id.replace('CAM-', '')}
              </div>
            </div>
          `;
        }

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-camera-div-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([cam.lat, cam.lng], { icon });

        // Popup with rich camera snapshot and specs
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 220px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: 700; color: #0F172A; font-size: 13px;">${cam.name}</span>
              <span style="font-size: 10px; font-family: monospace; font-weight: 700; background: #000; color: #fff; padding: 2px 6px; rounded: 4px;">${cam.id}</span>
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
              <strong>District:</strong> ${cam.districtName}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
              <strong>Corridor:</strong> ${cam.corridor}
            </div>
            <div style="font-size: 10px; font-family: monospace; color: #2563EB; margin-bottom: 8px;">
              GPS: ${cam.lat}° N, ${cam.lng}° E
            </div>
            <div style="border-radius: 8px; overflow: hidden; background: #000; border: 1px solid #CBD5E1;">
              <img src="${BACKEND_URL}/crops/1_frame2_KA05MR9633.jpg" style="width: 100%; height: 80px; object-fit: cover;" onerror="this.style.display='none'" />
            </div>
          </div>
        `);

        marker.addTo(markersGroup);
      });
    }
  }, [
    currentTrajectory,
    districts,
    cameras,
    activeDistrictId,
    showDistricts,
    showCameras,
    showHighways,
    onSelectDistrict,
  ]);

  const handleRecenterRoute = () => {
    if (!mapInstanceRef.current) return;
    const originCam = cameras.find((c) => c.id === currentTrajectory.firstSeen.cameraId) || cameras[0];
    const destCam = currentTrajectory.reappearedAt
      ? cameras.find((c) => c.id === currentTrajectory.reappearedAt?.cameraId) || cameras[3]
      : null;

    if (destCam) {
      const bounds = L.latLngBounds([
        [originCam.lat, originCam.lng],
        [destCam.lat, destCam.lng],
      ]);
      mapInstanceRef.current.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([originCam.lat, originCam.lng], 12, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[640px] bg-slate-950 rounded-3xl overflow-hidden border border-black/15 shadow-md select-none">
      {/* Real Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '540px', position: 'relative' }}
      />

      {/* Top Floating Bar: Style Switcher & Overlays Controls */}
      <div className="absolute top-4 left-4 right-14 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* CARTO Basemap Engine & Style Switcher */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-black/10 shadow-lg flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black text-white text-[11px] font-mono font-semibold tracking-wider uppercase">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>CARTO</span>
          </div>

          {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((styleKey) => {
            const isActive = activeTileStyle === styleKey;
            return (
              <button
                key={styleKey}
                onClick={() => setActiveTileStyle(styleKey)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow font-bold'
                    : 'text-[#6F6F6F] hover:text-black hover:bg-slate-100'
                }`}
                title={TILE_LAYERS[styleKey].tag}
              >
                {TILE_LAYERS[styleKey].label}
              </button>
            );
          })}

          {/* API Key Status Pill */}
          <button
            onClick={() => setShowApiKeyModal(!showApiKeyModal)}
            className="flex items-center gap-1.5 px-2.5 py-1 ml-0.5 rounded-xl text-[11px] font-mono font-semibold border border-black/10 hover:bg-slate-50 transition-colors cursor-pointer"
            title="CARTO API Key Settings"
          >
            {CARTO_API_KEY ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700">API Key Active</span>
              </>
            ) : (
              <>
                <Key className="w-3 h-3 text-amber-600" />
                <span className="text-amber-800">API Key (.env)</span>
              </>
            )}
          </button>
        </div>

        {/* Layer Toggles & Re-center Action */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-black/10 shadow-lg flex items-center gap-3 pointer-events-auto text-xs font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showDistricts}
              onChange={(e) => setShowDistricts(e.target.checked)}
              className="rounded accent-black cursor-pointer"
            />
            Districts
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showHighways}
              onChange={(e) => setShowHighways(e.target.checked)}
              className="rounded accent-black cursor-pointer"
            />
            Expressways
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showCameras}
              onChange={(e) => setShowCameras(e.target.checked)}
              className="rounded accent-black cursor-pointer"
            />
            Cameras
          </label>
          <button
            onClick={handleRecenterRoute}
            className="ml-2 pl-2 border-l border-slate-200 text-black hover:text-blue-600 flex items-center gap-1 font-bold cursor-pointer"
            title="Fit Route on Map"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Focus Route
          </button>
        </div>
      </div>

      {/* API Key Modal / Guidance Popup */}
      {showApiKeyModal && (
        <div className="absolute top-16 left-4 z-[450] max-w-sm bg-white/98 backdrop-blur-xl border border-black/15 rounded-3xl p-5 shadow-2xl animate-fade-rise">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-black" />
              <span className="font-serif text-sm font-semibold text-black">CARTO Map API Key</span>
            </div>
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-medium"
            >
              Close
            </button>
          </div>
          <div className="mt-3 space-y-2.5 text-xs text-slate-600 font-sans">
            <p>
              To authenticate high-throughput CARTO requests or custom datasets, add your key to:
            </p>
            <code className="block p-2 rounded-xl bg-slate-100 text-black font-mono text-[11px] border border-black/5 break-all">
              frontend/.env<br />
              NEXT_PUBLIC_CARTO_API_KEY=your_key_here
            </code>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
              Current Engine Status:{' '}
              {CARTO_API_KEY ? (
                <span className="text-emerald-700 font-bold">Authenticated with Custom API Key</span>
              ) : (
                <span className="text-amber-800 font-bold">Public CDN Basemaps Active (Ready)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rekor Scout Floating Dispatch Search & Sightings Card (Matching Image 2) */}
      <div className="absolute top-18 sm:top-20 left-4 z-[400] w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/15 shadow-2xl overflow-hidden pointer-events-auto">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b border-black/10 bg-slate-50/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDispatchTab('alerts')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                dispatchTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>Alert List</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white text-rose-700 font-bold">
                {BLOCKED_VEHICLES_DATA.length}
              </span>
            </button>
            <button
              onClick={() => setDispatchTab('search')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dispatchTab === 'search'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-black/5'
              }`}
            >
              Search Plates
            </button>
          </div>
          <button
            onClick={() => setShowDispatchCard(!showDispatchCard)}
            className="text-[11px] font-mono text-gray-500 hover:text-black cursor-pointer px-2 py-0.5 rounded-lg border border-black/5 bg-white"
          >
            {showDispatchCard ? 'Hide' : 'Show'}
          </button>
        </div>

        {showDispatchCard && (
          <div className="p-3.5 space-y-3">
            {/* Quick Time Range Filter Pills (Image 2) */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-gray-600 border-b border-black/5 pb-2.5 overflow-x-auto">
              {['1h', '6h', '12h', '24h', '48h', '72h', '1w', '2w'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-black text-white font-bold shadow-xs'
                      : 'hover:bg-black/5 text-[#5E5E59]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Quick Plate Filter Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter spotted plate (e.g. KA05MR9633)..."
                value={dispatchQuery}
                onChange={(e) => setDispatchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-black/10 rounded-xl px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            {/* Sighting Records Mini Table (Image 2) */}
            <div className="max-h-44 overflow-y-auto rounded-xl border border-black/10 bg-white shadow-inner">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-[#6F6F6F] font-mono text-[9px] uppercase sticky top-0 border-b border-black/5">
                  <tr>
                    <th className="py-1.5 px-2.5">Plate</th>
                    <th className="py-1.5 px-2">Camera</th>
                    <th className="py-1.5 px-2">Time</th>
                    <th className="py-1.5 px-2 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-sans">
                  {dispatchTab === 'alerts' ? (
                    BLOCKED_VEHICLES_DATA.filter(
                      (b) =>
                        !dispatchQuery ||
                        b.plate.toLowerCase().includes(dispatchQuery.toLowerCase())
                    ).map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => {
                          if (onSelectPlate) onSelectPlate(b.plate);
                        }}
                        className="hover:bg-rose-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-2 px-2.5 font-mono font-bold text-rose-800">
                          {b.plate}
                        </td>
                        <td className="py-2 px-2 text-slate-600 font-mono text-[10px]">
                          {b.whereAppeared.split(' ')[0]}
                        </td>
                        <td className="py-2 px-2 text-slate-500 text-[10px]">
                          {b.firstSeenTime}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlateModal({
                                plate: b.plate,
                                state: b.state,
                                vehicleModel: b.vehicleModel,
                                cameraId: b.whereAppeared.split(' ')[0],
                                cameraName: b.whereAppeared,
                                siteName: b.originDistrict,
                                timestamp: b.firstSeenTime,
                                imageUrl: b.photoVehicle,
                                plateCropUrl: b.photoPlate,
                                confidence: 97.8,
                              });
                            }}
                            className="p-1 rounded bg-black/5 hover:bg-black/10 text-black text-[10px] font-mono font-bold cursor-pointer"
                          >
                            Read
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    Object.values(DISTRICT_TRAJECTORIES)
                      .filter(
                        (t) =>
                          !dispatchQuery ||
                          t.plate.toLowerCase().includes(dispatchQuery.toLowerCase())
                      )
                      .map((t) => (
                        <tr
                          key={t.plate}
                          onClick={() => {
                            if (onSelectPlate) onSelectPlate(t.plate);
                          }}
                          className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-2 px-2.5 font-mono font-bold text-black">
                            {t.plate}
                          </td>
                          <td className="py-2 px-2 text-slate-600 font-mono text-[10px]">
                            {t.firstSeen.cameraId}
                          </td>
                          <td className="py-2 px-2 text-slate-500 text-[10px]">
                            {t.firstSeen.timestamp}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlateModal({
                                  plate: t.plate,
                                  vehicleModel: t.vehicleModel,
                                  vehicleType: t.vehicleType,
                                  cameraId: t.firstSeen.cameraId,
                                  cameraName: t.firstSeen.cameraName,
                                  siteName: t.highwayCorridor,
                                  timestamp: t.firstSeen.timestamp,
                                  confidence: 96.5,
                                });
                              }}
                              className="p-1 rounded bg-black/5 hover:bg-black/10 text-black text-[10px] font-mono font-bold cursor-pointer"
                            >
                              Read
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Legend & Telemetry Bar */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm animate-pulse"></span>
          <span className="text-black font-semibold">Origin Sighting</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-ping"></span>
          <span className="text-black font-semibold">Reappearance Toll</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-1.5 bg-blue-600 border border-slate-900 rounded shadow"></span>
          <span className="text-slate-800 font-bold">Google Maps Road Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 bg-slate-400 rounded"></span>
          <span className="text-slate-600">Expressway Corridors</span>
        </div>
      </div>

      {/* Bottom Right Live GPS Coordinates Box */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl px-3 py-1.5 shadow-lg text-[11px] font-mono text-slate-600">
        GPS:{' '}
        <span className="text-black font-bold">
          {cursorCoords ? `${cursorCoords.lat}° N, ${cursorCoords.lng}° E` : '12.7214° N, 77.2810° E'}
        </span>
      </div>

      {/* Rekor Scout Plate Read Inspection Modal (Image 4) */}
      <PlateReadModal
        isOpen={!!selectedPlateModal}
        data={selectedPlateModal}
        onClose={() => setSelectedPlateModal(null)}
        onTraceOnMap={(plate) => {
          if (onSelectPlate) onSelectPlate(plate);
          setSelectedPlateModal(null);
        }}
      />
    </div>
  );
};
