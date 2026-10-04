"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldAlert,
  AlertOctagon,
  Navigation,
  Eye,
  MapPin,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { BLOCKED_VEHICLES_DATA } from "@/components/GpsTransitMapPage";

export default function DashboardBlacklistPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<
    "ALL" | "CRITICAL_WANTED" | "STOLEN_ALERT" | "SEIZED_COURT_ORDER"
  >("ALL");

  // Dynamic counts calculated directly from real records (no fake/hardcoded metrics)
  const counts = useMemo(() => {
    return {
      all: BLOCKED_VEHICLES_DATA.length,
      critical: BLOCKED_VEHICLES_DATA.filter(
        (b) => b.severity === "CRITICAL_WANTED"
      ).length,
      stolen: BLOCKED_VEHICLES_DATA.filter((b) => b.severity === "STOLEN_ALERT")
        .length,
      court: BLOCKED_VEHICLES_DATA.filter(
        (b) => b.severity === "SEIZED_COURT_ORDER"
      ).length,
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BLOCKED_VEHICLES_DATA.filter((blk) => {
      const matchesQuery =
        !q ||
        blk.plate.toLowerCase().includes(q) ||
        blk.vehicleModel.toLowerCase().includes(q) ||
        blk.caseNumber.toLowerCase().includes(q) ||
        blk.violationReason.toLowerCase().includes(q) ||
        blk.originDistrict.toLowerCase().includes(q) ||
        blk.reappearDistrict.toLowerCase().includes(q);

      const matchesSeverity =
        severityFilter === "ALL" || blk.severity === severityFilter;

      return matchesQuery && matchesSeverity;
    });
  }, [searchQuery, severityFilter]);

  return (
    <div className="w-full pb-20 font-sans">
      {/* ─── Page Header (SpaceX Industrial Discipline) ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-4">
        <div className="border-b border-black/15 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-xs bg-black text-white text-[10px] font-mono uppercase tracking-[1.5px] font-bold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>SURVEILLANCE HOTLIST • {BLOCKED_VEHICLES_DATA.length} TARGETS ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase">
              FLAGGED &amp; WANTED VEHICLES
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-mono">
              Inter-district perimeter surveillance and judicial warrant enforcement registry.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search & Segmented Controls (No Pill Badges) ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER REGISTRATION, MODEL, OR FIR..."
              className="w-full pl-9 pr-8 py-2 bg-neutral-50 hover:bg-white focus:bg-white border border-black/20 rounded-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black text-xs font-mono uppercase tracking-wider transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSeverityFilter("ALL")}
              className={`px-3 py-1.5 rounded-xs text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                severityFilter === "ALL"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-neutral-600 border-black/15 hover:border-black hover:text-black"
              }`}
            >
              ALL [{counts.all}]
            </button>
            <button
              onClick={() => setSeverityFilter("CRITICAL_WANTED")}
              className={`px-3 py-1.5 rounded-xs text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                severityFilter === "CRITICAL_WANTED"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-neutral-600 border-black/15 hover:border-black hover:text-black"
              }`}
            >
              CRITICAL [{counts.critical}]
            </button>
            <button
              onClick={() => setSeverityFilter("STOLEN_ALERT")}
              className={`px-3 py-1.5 rounded-xs text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                severityFilter === "STOLEN_ALERT"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-neutral-600 border-black/15 hover:border-black hover:text-black"
              }`}
            >
              STOLEN [{counts.stolen}]
            </button>
            <button
              onClick={() => setSeverityFilter("SEIZED_COURT_ORDER")}
              className={`px-3 py-1.5 rounded-xs text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                severityFilter === "SEIZED_COURT_ORDER"
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-neutral-600 border-black/15 hover:border-black hover:text-black"
              }`}
            >
              COURT ORDERS [{counts.court}]
            </button>
          </div>
        </div>
      </div>

      {/* ─── Target Dossier Cards (Austere Industrial Layout) ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-5">
        {filteredVehicles.length === 0 ? (
          <div className="bg-white border border-black/15 rounded-xs p-12 text-center">
            <ShieldAlert className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-xs font-mono uppercase tracking-wider font-bold text-black">
              NO TARGETS MATCHING QUERY
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">
              Adjust search parameters or select ALL category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredVehicles.map((blk) => {
              const isCritical = blk.severity === "CRITICAL_WANTED";

              return (
                <article
                  key={blk.id}
                  className="bg-white border border-black/20 rounded-xs overflow-hidden flex flex-col justify-between hover:border-black transition-colors"
                >
                  {/* Top Bar: Plate, Classification Badge, Case Number */}
                  <div className="p-4 border-b border-black/10 flex items-start justify-between gap-3 bg-neutral-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-black">
                          {blk.plate}
                        </span>
                        <span
                          className={`text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border font-bold inline-flex items-center gap-1 ${
                            isCritical
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-neutral-100 text-neutral-800 border-neutral-300"
                          }`}
                        >
                          <AlertOctagon className="w-3 h-3" />
                          {blk.severityLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-600 font-mono mt-0.5">
                        {blk.vehicleModel} • {blk.state}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        {blk.caseNumber}
                      </span>
                    </div>
                  </div>

                  {/* Optical Evidence Frames: Camera Scene & Plate Crop */}
                  <div className="p-4 border-b border-black/10 bg-white">
                    <div className="text-[9.5px] font-mono uppercase tracking-widest text-neutral-500 mb-2 flex items-center justify-between">
                      <span>OPTICAL TELEMETRY CAPTURES</span>
                      <span className="text-black font-semibold">VERIFIED CROPS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Vehicle Scene Frame */}
                      <div className="relative aspect-[16/10] bg-black rounded-xs overflow-hidden border border-black/20">
                        <img
                          src={blk.photoVehicle}
                          alt={`CCTV scene for ${blk.plate}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-1 text-white">
                          <span className="text-[9px] font-mono uppercase tracking-wider flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5 text-neutral-300" />
                            CAMERA SCENE
                          </span>
                        </div>
                      </div>

                      {/* Plate Crop */}
                      <div className="relative aspect-[16/10] bg-black rounded-xs overflow-hidden border border-black/20 flex items-center justify-center">
                        <img
                          src={blk.photoPlate}
                          alt={`Plate OCR crop for ${blk.plate}`}
                          className="w-full h-full object-contain p-1"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/85 px-2 py-1 text-white">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                            OPTICAL OCR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident Telemetry & Sighting Timeline */}
                  <div className="p-4 space-y-3 text-xs font-mono">
                    {/* Reason */}
                    <div>
                      <span className="text-[9.5px] uppercase tracking-widest text-neutral-500 block mb-0.5">
                        OFFENSE / WARRANT
                      </span>
                      <p className="text-black text-xs leading-snug font-sans font-medium">
                        {blk.violationReason}
                      </p>
                    </div>

                    {/* Sighting Timeline Table */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-black/10 text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 block">
                          INITIAL DETECTION
                        </span>
                        <div className="font-bold text-black mt-0.5">
                          {blk.originDistrict}
                        </div>
                        <div className="text-neutral-500 text-[10.5px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{blk.firstSeenTime} · {blk.whereAppeared}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-400 block">
                          SUBSEQUENT SIGHTING
                        </span>
                        <div className="font-bold text-black mt-0.5">
                          {blk.reappearDistrict}
                        </div>
                        <div className="text-emerald-700 font-semibold text-[10.5px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{blk.reappearTime} · {blk.reappearedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Advisory */}
                    <div className="pt-2 border-t border-black/10 text-[10.5px] text-neutral-700">
                      <span className="font-bold text-black uppercase">ADVISORY:</span>{" "}
                      {blk.actionTaken}
                    </div>
                  </div>

                  {/* Actions (Industrial Ghost Outline & Fill Buttons) */}
                  <div className="p-3 bg-neutral-50 border-t border-black/10 flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/map?plate=${encodeURIComponent(blk.plate)}`
                        )
                      }
                      className="flex-1 py-2 px-3 rounded-xs bg-black hover:bg-neutral-800 text-white text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>TRACE ON MAP</span>
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/search?plate=${encodeURIComponent(blk.plate)}`
                        )
                      }
                      className="py-2 px-3 rounded-xs border border-black/25 bg-white hover:bg-neutral-100 text-black text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Inspect Video Footage in Studio"
                    >
                      <Eye className="w-3 h-3" />
                      <span>STUDIO</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
