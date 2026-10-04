"use client";

import React, { useState, useEffect } from 'react';
import {
  Cctv,
  Search,
  ShieldCheck,
  Clock,
  Car,
  ExternalLink,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { MultiCameraSearchResult } from '../types/anpr';

interface CameraInvestigationBlogProps {
  onJumpToCamera: (videoName: string, timestamp: number, plate: string) => void;
  initialQuery?: string;
}

import { BACKEND_URL } from "@/lib/config";

export const CameraInvestigationBlog: React.FC<CameraInvestigationBlogProps> = ({
  onJumpToCamera,
  initialQuery = 'KA05MR9633',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<MultiCameraSearchResult | null>(null);

  const executeSearch = (targetPlate: string) => {
    if (!targetPlate.trim()) return;
    setIsLoading(true);

    fetch(`${BACKEND_URL}/api/multi-camera-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: targetPlate }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: MultiCameraSearchResult) => {
        setIsLoading(false);
        if (data && typeof data.cameras_detected_in === 'number') {
          setSearchResult(data);
        }
      })
      .catch((err) => {
        console.error('Multi-camera search error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    executeSearch(initialQuery);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleQuickChip = (plate: string) => {
    setQuery(plate);
    executeSearch(plate);
  };

  const popularPlates = ['KA05MR9633', 'KA05LA7078', 'KA05NC5241', 'JK5098'];

  return (
    <section id="camera-journal" className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-black/10">
      {/* Blog & Surveillance Log Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[#6F6F6F] text-xs font-mono uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5 text-black" />
          <span>Surveillance Journal & Cross-Camera Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold text-black tracking-tight mb-2 uppercase">
          MULTI-CAMERA INVESTIGATION LOG
        </h2>
        <p className="text-neutral-600 text-xs sm:text-sm max-w-xl mx-auto font-mono">
          Query cross-camera surveillance footage, optical crops, and junction detections.
        </p>
      </div>

      {/* Plate Search Input in Journal Style */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER REGISTRATION PLATE (E.G. KA05MR9633)..."
              className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-black/20 rounded-xs pl-10 pr-3 py-2.5 text-xs font-mono uppercase tracking-wider text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xs px-6 py-2.5 bg-black text-white text-[11px] font-mono uppercase tracking-wider font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>SEARCH</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Plates */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
          <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider font-bold">PRESETS:</span>
          {popularPlates.map((plate) => (
            <button
              key={plate}
              type="button"
              onClick={() => handleQuickChip(plate)}
              className={`font-mono px-2 py-0.5 rounded-xs text-[10.5px] uppercase tracking-wider border transition-colors cursor-pointer ${
                query.toUpperCase() === plate
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white hover:border-black text-black border-black/20'
              }`}
            >
              {plate}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {searchResult && (
        <div className="space-y-12">
          {/* Summary Banner */}
          <div className="bg-white border border-black/15 rounded-xs p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xs bg-black text-white flex items-center justify-center shrink-0">
                <Cctv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                    TARGET VEHICLE
                  </span>
                  <span className="px-1.5 py-0.2 rounded-xs bg-black text-white text-[9.5px] font-mono uppercase font-bold tracking-wider">
                    {searchResult.matched ? 'ACTIVE SIGHTINGS' : 'NO MATCH'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-mono font-bold text-black tracking-wider">
                  {searchResult.cleaned_query || query.toUpperCase()}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-black/10 pt-4 md:pt-0 md:pl-8 text-xs text-[#6F6F6F]">
              <div>
                <span className="block text-[#6F6F6F] uppercase text-[10px] tracking-wider mb-0.5">
                  Cameras Detected In
                </span>
                <span className="text-xl font-mono font-bold text-black">
                  {searchResult.cameras_detected_in} of {searchResult.total_cameras_scanned} Cameras
                </span>
              </div>
              <div>
                <span className="block text-[#6F6F6F] uppercase text-[10px] tracking-wider mb-0.5">
                  Network Coverage
                </span>
                <span className="text-xl font-mono font-bold text-black">
                  {Math.round(
                    (searchResult.cameras_detected_in /
                      Math.max(searchResult.total_cameras_scanned, 1)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* If No Sightings */}
          {!searchResult.matched && (
            <div className="bg-surface border border-black/10 rounded-3xl p-12 text-center text-[#6F6F6F]">
              <Car className="w-10 h-10 mx-auto mb-3 text-[#6F6F6F]/50" />
              <h4 className="text-lg font-sans font-semibold text-black mb-1">
                No Camera Sightings for "{query.toUpperCase()}"
              </h4>
              <p className="text-sm max-w-md mx-auto">
                The license plate was not identified in any of the current camera recordings. Try
                searching for another plate such as <strong className="text-black">KA05MR9633</strong> or{' '}
                <strong className="text-black">KA05LA7078</strong>.
              </p>
            </div>
          )}

          {/* Chronological Camera Sightings Grid */}
          {searchResult.matched && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-sans font-bold text-black tracking-tight">
                  Camera Capture Sequence
                </h4>
                <span className="text-xs text-[#6F6F6F]">
                  Arranged in chronological detection order
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResult.sightings.map((sighting) => {
                  const [x1, y1, x2, y2] = sighting.best_box || [0, 0, 100, 100];
                  const cropUrl = `${BACKEND_URL}/api/crop/${sighting.video_name}?frame=${sighting.best_frame}&x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}&plate=${sighting.plate}`;

                  return (
                    <div
                      key={sighting.camera_id}
                      className="bg-white border border-black/15 rounded-xs p-4 shadow-xs flex flex-col justify-between hover:border-black transition-colors"
                    >
                      <div>
                        {/* Camera Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded-xs bg-black text-white">
                                {sighting.camera_id}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                {sighting.camera_zone}
                              </span>
                            </div>
                            <h5 className="font-mono text-sm font-bold text-black uppercase">
                              {sighting.camera_name}
                            </h5>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-neutral-100 border border-black/15 text-neutral-600 uppercase">
                            FEED: {sighting.video_name}
                          </span>
                        </div>

                        {/* Snapshot from this Camera */}
                        <div className="relative aspect-[16/9] rounded-xs overflow-hidden bg-black border border-black/20 mb-3">
                          <img
                            src={cropUrl}
                            alt={`${sighting.plate} on ${sighting.camera_id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-black/85 text-[10px] font-mono text-white flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-emerald-400" />
                            <span>FIRST: {sighting.formatted_first_seen}</span>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-xs bg-black/85 text-[10px] font-mono text-white">
                            {sighting.total_sightings} READS
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
                          <div className="p-2 rounded-xs bg-neutral-50 border border-black/10">
                            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">
                              CONFIDENCE
                            </span>
                            <span className="font-mono font-bold text-black flex items-center gap-1 mt-0.5 text-xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              {Math.round(sighting.best_ocr_confidence * 100)}%
                            </span>
                          </div>
                          <div className="p-2 rounded-xs bg-neutral-50 border border-black/10">
                            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">
                              LAST SEEN
                            </span>
                            <span className="font-mono font-bold text-black mt-0.5 block text-xs">
                              {sighting.formatted_last_seen}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() =>
                          onJumpToCamera(
                            sighting.video_name,
                            sighting.first_seen,
                            sighting.plate
                          )
                        }
                        className="w-full py-2 px-3 rounded-xs bg-black hover:bg-neutral-800 text-white text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        SEEK IN STUDIO PLAYER
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Editorial Surveillance Log Narrative */}
              <div className="bg-gradient-to-r from-white via-surface to-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-black uppercase tracking-wider mb-2">
                  <BookOpen className="w-4 h-4 text-black" />
                  <span>Surveillance Incident Narrative</span>
                </div>
                <p className="text-sm text-[#6F6F6F] leading-relaxed font-sans">
                  Vehicle <strong className="text-black font-mono">{searchResult.cleaned_query}</strong> was
                  detected across{' '}
                  <strong className="text-black">{searchResult.cameras_detected_in} distinct surveillance cameras</strong>.
                  Initial recognition occurred at{' '}
                  <strong className="text-black">{searchResult.sightings[0]?.camera_name} ({searchResult.sightings[0]?.camera_id})</strong> at{' '}
                  <span className="font-mono text-black font-semibold">
                    {searchResult.sightings[0]?.formatted_first_seen}
                  </span>
                  {searchResult.sightings.length > 1 && (
                    <>
                      , followed by subsequent transit tracking at{' '}
                      <strong className="text-black">{searchResult.sightings[1]?.camera_name} ({searchResult.sightings[1]?.camera_id})</strong> at{' '}
                      <span className="font-mono text-black font-semibold">
                        {searchResult.sightings[1]?.formatted_first_seen}
                      </span>
                    </>
                  )}
                  . Both cameras confirmed state jurisdiction registered in{' '}
                  <strong className="text-black">{searchResult.sightings[0]?.state}</strong> with high detector confidence.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
