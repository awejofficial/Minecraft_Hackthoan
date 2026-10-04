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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8 font-sans">
      {/* ────── Top Stat Metric Cards (Matching Rekor Scout Image 3) ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: CAMERAS (Blue Top Stripe) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="h-1.5 bg-blue-600 w-full" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6F6F]">
                CAMERAS
              </span>
              <div className="text-4xl font-serif font-normal text-black mt-1">
                {activeVideos.length > 0 ? activeVideos.length : 5}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Cctv className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/dashboard/search"
            className="px-5 py-2.5 bg-slate-50/70 border-t border-black/5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50/80 flex items-center justify-between transition-colors"
          >
            <span>View Details</span>
            <span className="text-sm font-bold">+</span>
          </Link>
        </div>

        {/* Card 2: SITES (Emerald Green Top Stripe) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="h-1.5 bg-emerald-600 w-full" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6F6F]">
                SITES / CORRIDORS
              </span>
              <div className="text-4xl font-serif font-normal text-black mt-1">
                4
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/dashboard/map"
            className="px-5 py-2.5 bg-slate-50/70 border-t border-black/5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/80 flex items-center justify-between transition-colors"
          >
            <span>View Details</span>
            <span className="text-sm font-bold">+</span>
          </Link>
        </div>

        {/* Card 3: PLATES THIS WEEK (Gold/Amber Top Stripe) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="h-1.5 bg-amber-500 w-full" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6F6F]">
                PLATES THIS WEEK
              </span>
              <div className="text-4xl font-serif font-normal text-black mt-1">
                {(totalPlatesCount / 1000).toFixed(2)}k
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Car className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/dashboard/database"
            className="px-5 py-2.5 bg-slate-50/70 border-t border-black/5 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50/80 flex items-center justify-between transition-colors"
          >
            <span>View Details</span>
            <span className="text-sm font-bold">+</span>
          </Link>
        </div>

        {/* Card 4: RECENT ALERTS (Red Top Stripe) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="h-1.5 bg-rose-600 w-full" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6F6F]">
                RECENT ALERTS
              </span>
              <div className="text-4xl font-serif font-normal text-rose-600 mt-1">
                2
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/dashboard/blacklist"
            className="px-5 py-2.5 bg-slate-50/70 border-t border-black/5 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50/80 flex items-center justify-between transition-colors"
          >
            <span>View Details</span>
            <span className="text-sm font-bold">+</span>
          </Link>
        </div>
      </div>

      {/* ────── Main 2-Column Section (Matching Rekor Scout Image 3) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Most Recent Plate Groups Table */}
        <div className="lg:col-span-8 bg-white border border-black/10 rounded-3xl shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-5 border-b border-black/10 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="bg-white border border-black/15 rounded-xl px-3 py-1.5 text-xs font-medium text-black focus:outline-none cursor-pointer"
              >
                <option value="All Sites">All Sites</option>
                <option value="Hosur Outer Ring Road">Hosur Outer Ring Road</option>
                <option value="Electronic City Toll Plaza">Electronic City Toll Plaza</option>
                <option value="Ramanagara Expressway Toll">Ramanagara Expressway Toll</option>
                <option value="Kengeri NICE Interchange">Kengeri NICE Interchange</option>
              </select>
              <span className="text-xs font-serif font-semibold text-black hidden sm:inline">
                Most Recent Plate Groups
              </span>
            </div>

            {/* Quick Search & Pagination */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter plate..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-white border border-black/15 rounded-xl pl-3 pr-2 py-1.5 text-xs font-mono uppercase focus:outline-none w-32 sm:w-40"
                />
              </div>

              <div className="flex items-center gap-1 border border-black/10 rounded-xl bg-white p-0.5 text-xs">
                <button
                  type="button"
                  className="px-2 py-1 text-[#6F6F6F] hover:text-black cursor-pointer font-medium"
                >
                  &lt; Newer
                </button>
                <span className="text-[#6F6F6F] px-1 font-mono text-[11px]">Options</span>
                <button
                  type="button"
                  className="px-2 py-1 text-[#6F6F6F] hover:text-black cursor-pointer font-medium"
                >
                  Older &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-black/5 text-[#6F6F6F] font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-3">Camera</th>
                  <th className="py-3 px-3">Plate Number</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-3 text-center">Direction</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-sans">
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
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-medium text-black truncate max-w-[150px]">
                      {row.site}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                      {row.camera}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 group-hover:border-blue-400">
                        {row.plate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-black font-medium">
                      {row.vehicle}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sm font-bold text-blue-600">
                      {row.directionIcon}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">
                      {row.confidence.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6F6F] font-mono text-[11px] whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-3.5 px-3 text-right">
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
                        className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-mono font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Read
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Alerts + Top Sites this Week */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Recent Alerts (Image 3) */}
          <div className="bg-white border border-black/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Recent Alerts
                </span>
              </div>
              <Link
                href="/dashboard/blacklist"
                className="text-[11px] font-mono text-rose-700 hover:text-rose-900 font-bold hover:underline"
              >
                All Lists &gt;
              </Link>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => router.push("/dashboard/blacklist")}
                className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-rose-600 fill-current" />
                  <div>
                    <div className="font-mono text-xs font-bold text-rose-900">
                      KA09Z4433 (Hit &amp; Run)
                    </div>
                    <div className="text-[10px] text-rose-700 font-mono">
                      Ramanagara Expressway • Dec 16, 2026
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              </div>

              <div
                onClick={() => router.push("/dashboard/blacklist")}
                className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-rose-600 fill-current" />
                  <div>
                    <div className="font-mono text-xs font-bold text-rose-900">
                      KA51AF5156 (Court Seized)
                    </div>
                    <div className="text-[10px] text-rose-700 font-mono">
                      Electronic City Toll • Dec 15, 2026
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/dashboard/blacklist"
                className="w-full py-2 block rounded-xl bg-black/5 hover:bg-black/10 text-xs font-semibold text-black transition-all text-center"
              >
                View All Alerts ({2})
              </Link>
            </div>
          </div>

          {/* Card: Top Sites this Week (Donut Metric matching Image 3) */}
          <div className="bg-white border border-black/10 rounded-3xl p-6 shadow-sm text-center space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-black text-left border-b border-black/10 pb-3">
              Top Sites this Week
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
