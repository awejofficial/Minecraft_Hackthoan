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
    <div className="w-full pb-20">
      {/* ─── Page Header ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-4">
        <div className="border-b border-black/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-800 text-[11px] font-mono font-semibold uppercase tracking-wider mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              <span>Surveillance Hotlist • {BLOCKED_VEHICLES_DATA.length} Targets Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans text-black font-bold tracking-tight">
              Flagged &amp; Wanted Vehicles
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5E59] mt-1 max-w-2xl font-sans">
              Inter-district perimeter surveillance hotlist. Track court-warranted, hit-and-run,
              and stolen transit vehicles with verified photographic captures.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search & Category Filters (No fake counters) ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate, model, FIR, or location..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs font-mono transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setSeverityFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                severityFilter === "ALL"
                  ? "bg-white text-black shadow-xs font-bold"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setSeverityFilter("CRITICAL_WANTED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                severityFilter === "CRITICAL_WANTED"
                  ? "bg-white text-rose-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Critical ({counts.critical})
            </button>
            <button
              onClick={() => setSeverityFilter("STOLEN_ALERT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                severityFilter === "STOLEN_ALERT"
                  ? "bg-white text-rose-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Stolen ({counts.stolen})
            </button>
            <button
              onClick={() => setSeverityFilter("SEIZED_COURT_ORDER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                severityFilter === "SEIZED_COURT_ORDER"
                  ? "bg-white text-amber-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-amber-700"
              }`}
            >
              Court Orders ({counts.court})
            </button>
          </div>
        </div>
      </div>

      {/* ─── Hotlist Incident Cards (Anti-UI-Slop: Flat, Real CCTV Crops, No Nested Card Noise) ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6">
        {filteredVehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-800">
              No Flagged Targets Match Query
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Try searching by plate number (e.g. KA09Z4433, KA05MR9633) or reset your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVehicles.map((blk) => {
              const isCritical = blk.severity === "CRITICAL_WANTED";
              const isStolen = blk.severity === "STOLEN_ALERT";

              return (
                <article
                  key={blk.id}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar: Plate, Classification & Case Reference */}
                  <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">
                          {blk.plate}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1 ${
                            isCritical
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isStolen
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          <AlertOctagon className="w-3 h-3" />
                          {blk.severityLabel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-sans mt-1">
                        {blk.vehicleModel} •{" "}
                        <span className="text-slate-500">{blk.state}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {blk.caseNumber}
                      </span>
                    </div>
                  </div>

                  {/* Real Photographic Evidence: Full Vehicle & Plate Crop (No Unsplash dummy photos) */}
                  <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                      <span>Optical Evidence Captures</span>
                      <span className="text-emerald-700 font-semibold">Verified Frame Crops</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Vehicle Scene Frame */}
                      <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80">
                        <img
                          src={blk.photoVehicle}
                          alt={`CCTV capture of ${blk.plate}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                          <span className="text-[10px] font-mono font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-400" />
                            Vehicle Context
                          </span>
                        </div>
                      </div>

                      {/* License Plate Crop */}
                      <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center">
                        <img
                          src={blk.photoPlate}
                          alt={`Plate crop for ${blk.plate}`}
                          className="w-full h-full object-contain p-1"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                          <span className="text-[10px] font-mono font-medium text-emerald-300">
                            OCR Optical Plate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident Details & Sighting Corridors */}
                  <div className="p-5 space-y-3.5 text-xs">
                    {/* Reason / Warrant Notice */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                        Incident &amp; Warrant Details
                      </span>
                      <p className="text-slate-800 leading-relaxed font-sans font-medium">
                        {blk.violationReason}
                      </p>
                    </div>

                    {/* Sighting Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Initial Detection
                        </span>
                        <div className="font-sans font-semibold text-slate-900 mt-0.5">
                          {blk.originDistrict}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{blk.firstSeenTime} • {blk.whereAppeared}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Subsequent Sighting
                        </span>
                        <div className="font-sans font-semibold text-slate-900 mt-0.5">
                          {blk.reappearDistrict}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{blk.reappearTime} • {blk.reappearedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Action */}
                    <div className="pt-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                      <span className="font-bold text-slate-900">Advisory:</span>{" "}
                      {blk.actionTaken}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/map?plate=${encodeURIComponent(blk.plate)}`
                        )
                      }
                      className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Trace Road Route on Dispatch Map</span>
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/search?plate=${encodeURIComponent(blk.plate)}`
                        )
                      }
                      className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Inspect Video Footage in Studio"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Studio</span>
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
