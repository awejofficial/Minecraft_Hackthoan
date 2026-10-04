"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cctv,
  MapPin,
  Car,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Upload,
  Zap,
  Activity,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Film,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import PlateReadModal, { PlateReadData } from "./PlateReadModal";
import type { VideoItem } from "@/types/anpr";

interface PlateGroupRow {
  id: string;
  site: string;
  camera: string;
  plate: string;
  vehicle: string;
  direction: string;
  directionIcon: string;
  confidence: number;
  time: string;
  videoName?: string;
}

const SAMPLE_PLATE_GROUPS: PlateGroupRow[] = [
  {
    id: "g1",
    site: "Hosur Outer Ring Road",
    camera: "1",
    plate: "KA05MR9633",
    vehicle: "White Hyundai Creta",
    direction: "North-East",
    directionIcon: "↗",
    confidence: 98.4,
    time: "09:14:10 am",
    videoName: "1.mp4",
  },
  {
    id: "g2",
    site: "Electronic City Toll Plaza",
    camera: "2",
    plate: "KA51AF5156",
    vehicle: "Silver Toyota Innova",
    direction: "South",
    directionIcon: "↓",
    confidence: 96.8,
    time: "09:32:22 am",
    videoName: "2.mp4",
  },
  {
    id: "g3",
    site: "Ramanagara Expressway Toll",
    camera: "CRASH",
    plate: "KA09Z4433",
    vehicle: "Black Mahindra Scorpio",
    direction: "South-West",
    directionIcon: "↙",
    confidence: 97.2,
    time: "11:05:40 am",
    videoName: "crash.mp4",
  },
  {
    id: "g4",
    site: "Kengeri NICE Interchange",
    camera: "4",
    plate: "KA05LA7078",
    vehicle: "Red Honda City Sedan",
    direction: "West",
    directionIcon: "←",
    confidence: 94.6,
    time: "11:18:05 am",
    videoName: "4.mp4",
  },
  {
    id: "g5",
    site: "Mandya Arterial Bypass",
    camera: "TT2",
    plate: "KA21C5074",
    vehicle: "Blue Maruti Brezza",
    direction: "South-West",
    directionIcon: "↙",
    confidence: 95.1,
    time: "11:34:10 am",
    videoName: "tt2.mp4",
  },
  {
    id: "g6",
    site: "Defence Perimeter Corridor",
    camera: "ARMY",
    plate: "KA03MG2021",
    vehicle: "Army Green Military Truck",
    direction: "North",
    directionIcon: "↑",
    confidence: 93.8,
    time: "11:45:00 am",
    videoName: "army.mp4",
  },
  {
    id: "g7",
    site: "Electronic City Toll Plaza",
    camera: "2",
    plate: "KA04MH9922",
    vehicle: "Grey Tata Nexon EV",
    direction: "South",
    directionIcon: "↓",
    confidence: 96.2,
    time: "12:02:14 pm",
    videoName: "2.mp4",
  },
  {
    id: "g8",
    site: "Hosur Outer Ring Road",
    camera: "1",
    plate: "KA53MC1004",
    vehicle: "Dark Blue Sedan",
    direction: "East",
    directionIcon: "→",
    confidence: 92.9,
    time: "12:15:30 pm",
    videoName: "1.mp4",
  },
];

export const RekorDashboardOverview: React.FC = () => {
  const router = useRouter();
  const [selectedSiteFilter, setSelectedSiteFilter] = useState("All Sites");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedPlateModal, setSelectedPlateModal] = useState<PlateReadData | null>(null);
  const [activeVideos, setActiveVideos] = useState<VideoItem[]>([]);
  const [totalPlatesCount, setTotalPlatesCount] = useState<number>(2847);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/videos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videos) {
          setActiveVideos(data.videos);
          const count = data.videos.reduce((acc: number, v: VideoItem) => acc + (v.plate_count || 0), 0);
          if (count > 0) setTotalPlatesCount(count * 85 + 2400);
        }
      })
      .catch(() => {});
  }, []);

  const filteredGroups = SAMPLE_PLATE_GROUPS.filter((g) => {
    const matchesSite = selectedSiteFilter === "All Sites" || g.site === selectedSiteFilter;
    const matchesSearch =
      !searchFilter ||
      g.plate.toLowerCase().includes(searchFilter.toLowerCase()) ||
      g.vehicle.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSite && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-6 font-sans">
      {/* ────── Top Stat Metric Cards (SpaceX Industrial Style) ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CAMERAS */}
        <div className="bg-white rounded-xs border border-black/15 overflow-hidden flex flex-col justify-between hover:border-black transition-colors">
          <div className="h-0.5 bg-black w-full" />
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                ACTIVE CAMERAS
              </span>
              <div className="text-3xl font-mono font-bold tracking-tight text-black mt-1">
                {activeVideos.length > 0 ? activeVideos.length : 5}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xs border border-black/15 flex items-center justify-center text-black">
              <Cctv className="w-4 h-4" />
            </div>
          </div>
          <Link
            href="/dashboard/search"
            className="px-4 py-2 bg-neutral-50 border-t border-black/10 text-[10px] font-mono uppercase tracking-wider font-bold text-black hover:bg-neutral-100 flex items-center justify-between transition-colors"
          >
            <span>CAMERA STUDIO</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>

        {/* Card 2: SITES */}
        <div className="bg-white rounded-xs border border-black/15 overflow-hidden flex flex-col justify-between hover:border-black transition-colors">
          <div className="h-0.5 bg-black w-full" />
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                MONITORED SITES
              </span>
              <div className="text-3xl font-mono font-bold tracking-tight text-black mt-1">
                4
              </div>
            </div>
            <div className="w-9 h-9 rounded-xs border border-black/15 flex items-center justify-center text-black">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <Link
            href="/dashboard/map"
            className="px-4 py-2 bg-neutral-50 border-t border-black/10 text-[10px] font-mono uppercase tracking-wider font-bold text-black hover:bg-neutral-100 flex items-center justify-between transition-colors"
          >
            <span>DISPATCH MAP</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>

        {/* Card 3: PLATES THIS WEEK */}
        <div className="bg-white rounded-xs border border-black/15 overflow-hidden flex flex-col justify-between hover:border-black transition-colors">
          <div className="h-0.5 bg-black w-full" />
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                PLATES INDEXED
              </span>
              <div className="text-3xl font-mono font-bold tracking-tight text-black mt-1">
                {(totalPlatesCount / 1000).toFixed(2)}k
              </div>
            </div>
            <div className="w-9 h-9 rounded-xs border border-black/15 flex items-center justify-center text-black">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <Link
            href="/dashboard/database"
            className="px-4 py-2 bg-neutral-50 border-t border-black/10 text-[10px] font-mono uppercase tracking-wider font-bold text-black hover:bg-neutral-100 flex items-center justify-between transition-colors"
          >
            <span>SURVEILLANCE DB</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>

        {/* Card 4: RECENT ALERTS */}
        <div className="bg-white rounded-xs border border-black/15 overflow-hidden flex flex-col justify-between hover:border-black transition-colors">
          <div className="h-0.5 bg-rose-600 w-full" />
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                ACTIVE ALERTS
              </span>
              <div className="text-3xl font-mono font-bold tracking-tight text-rose-600 mt-1">
                2
              </div>
            </div>
            <div className="w-9 h-9 rounded-xs border border-black/15 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <Link
            href="/dashboard/blacklist"
            className="px-4 py-2 bg-neutral-50 border-t border-black/10 text-[10px] font-mono uppercase tracking-wider font-bold text-rose-700 hover:bg-rose-50 flex items-center justify-between transition-colors"
          >
            <span>HOTLIST DOSSIER</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>
      </div>

      {/* ────── Main 2-Column Section ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Most Recent Plate Groups Table */}
        <div className="lg:col-span-8 bg-white border border-black/15 rounded-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-black/10 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/80">
            <div className="flex items-center gap-3">
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="bg-white border border-black/20 rounded-xs px-2.5 py-1 text-xs font-mono text-black focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="All Sites">ALL SITES</option>
                <option value="Hosur Outer Ring Road">Hosur Outer Ring Road</option>
                <option value="Electronic City Toll Plaza">Electronic City Toll Plaza</option>
                <option value="Ramanagara Expressway Toll">Ramanagara Expressway Toll</option>
                <option value="Kengeri NICE Interchange">Kengeri NICE Interchange</option>
              </select>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-black hidden sm:inline">
                RECENT TRANSIT READS
              </span>
            </div>

            {/* Quick Search & Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="FILTER PLATE..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-white border border-black/20 rounded-xs pl-2.5 pr-2 py-1 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-black w-32 sm:w-36"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-50 border-b border-black/10 text-neutral-600 text-[9.5px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Site</th>
                  <th className="py-2.5 px-2">Cam</th>
                  <th className="py-2.5 px-3">Plate</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-2 text-center">Dir</th>
                  <th className="py-2.5 px-2">Score</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs">
                {filteredGroups.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedPlateModal({
                        plate: row.plate,
                        vehicleModel: row.vehicle,
                        cameraId: row.camera,
                        siteName: row.site,
                        timestamp: row.time,
                        confidence: row.confidence,
                        videoName: row.videoName || "1.mp4",
                      });
                    }}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-black truncate max-w-[140px] font-sans font-medium">
                      {row.site}
                    </td>
                    <td className="py-2.5 px-2 text-neutral-700 font-bold">
                      {row.camera}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-black bg-neutral-100 px-1.5 py-0.5 rounded-xs border border-black/20 group-hover:border-black">
                        {row.plate}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-black font-sans">
                      {row.vehicle}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-black">
                      {row.directionIcon}
                    </td>
                    <td className="py-2.5 px-2 text-black font-bold">
                      {row.confidence.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px] whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlateModal({
                            plate: row.plate,
                            vehicleModel: row.vehicle,
                            cameraId: row.camera,
                            siteName: row.site,
                            timestamp: row.time,
                            confidence: row.confidence,
                            videoName: row.videoName || "1.mp4",
                          });
                        }}
                        className="px-2 py-0.5 rounded-xs bg-black text-white text-[9.5px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        READ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Alerts + Top Sites this Week */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: Recent Alerts */}
          <div className="bg-white border border-black/15 rounded-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black">
                  HOTLIST ALERTS
                </span>
              </div>
              <Link
                href="/dashboard/blacklist"
                className="text-[10px] font-mono text-black hover:underline uppercase tracking-wider font-bold"
              >
                ALL [4] &gt;
              </Link>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => router.push("/dashboard/blacklist")}
                className="p-2.5 rounded-xs bg-neutral-50 border border-black/15 flex items-center justify-between cursor-pointer hover:border-black transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-rose-600 fill-current" />
                  <div>
                    <div className="font-mono text-xs font-bold text-black">
                      KA09Z4433 (Hit &amp; Run)
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Ramanagara Expressway • Dec 16
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-black" />
              </div>

              <div
                onClick={() => router.push("/dashboard/blacklist")}
                className="p-2.5 rounded-xs bg-neutral-50 border border-black/15 flex items-center justify-between cursor-pointer hover:border-black transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-rose-600 fill-current" />
                  <div>
                    <div className="font-mono text-xs font-bold text-black">
                      KA51AF5156 (Court Seized)
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Electronic City Toll • Dec 15
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-black" />
              </div>
            </div>

            <div className="pt-1 text-center">
              <Link
                href="/dashboard/blacklist"
                className="w-full py-1.5 block rounded-xs border border-black/20 bg-neutral-50 hover:bg-neutral-100 text-[10px] font-mono font-bold uppercase tracking-wider text-black transition-all text-center"
              >
                VIEW FULL REGISTRY
              </Link>
            </div>
          </div>

          {/* Card: Top Sites this Week */}
          <div className="bg-white border border-black/15 rounded-xs p-4 text-center space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-black text-left border-b border-black/10 pb-2">
              SITE DISTRIBUTION
            </div>

            <div className="py-4 flex flex-col items-center justify-center">
              {/* Radial Donut Visualization */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1D4ED8"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="65"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#059669"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-mono font-bold text-black">
                    {totalPlatesCount}
                  </span>
                  <span className="text-[10px] text-[#6F6F6F] uppercase tracking-wider font-semibold">
                    Plates Sighted
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
                  <span className="text-black">NH-44 Corridor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-black">NH-275 Expressway</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────── Rekor Scout Plate Read Inspection Modal (Image 4) ────── */}
      <PlateReadModal
        isOpen={!!selectedPlateModal}
        data={selectedPlateModal}
        onClose={() => setSelectedPlateModal(null)}
        onJumpToTimeline={(videoName, timestamp, plate) => {
          router.push(`/dashboard/search?video=${videoName}&t=${timestamp}&plate=${plate}`);
        }}
        onTraceOnMap={(plate) => {
          router.push(`/dashboard/map?plate=${plate}`);
        }}
      />
    </div>
  );
};

export default RekorDashboardOverview;
