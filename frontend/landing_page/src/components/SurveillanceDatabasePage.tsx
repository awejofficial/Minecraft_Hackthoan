"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Eye,
} from 'lucide-react';
import type { DatabaseResponse } from '../types/anpr';
import PlateReadModal, { PlateReadData } from './PlateReadModal';

interface SurveillanceDatabasePageProps {
  onJumpToCamera: (videoName: string, timestamp: number, plate: string) => void;
}

import { BACKEND_URL } from "@/lib/config";

export const SurveillanceDatabasePage: React.FC<SurveillanceDatabasePageProps> = ({
  onJumpToCamera,
}) => {
  const router = useRouter();
  const [data, setData] = useState<DatabaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('ALL');
  const [validOnly, setValidOnly] = useState<boolean>(true);
  const [selectedPlateModal, setSelectedPlateModal] = useState<PlateReadData | null>(null);

  const fetchRecords = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('valid_only', String(validOnly));
    if (selectedCamera && selectedCamera !== 'ALL') {
      params.append('camera', selectedCamera);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    fetch(`${BACKEND_URL}/api/database/records?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((resData: DatabaseResponse) => {
        if (resData && Array.isArray(resData.records)) {
          setData(resData);
        } else {
          setData({ records: [], total_records: 0, verified_standard_count: 0 } as any);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Database fetch error:', err);
        setData({ records: [], total_records: 0, verified_standard_count: 0 } as any);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, [validOnly, selectedCamera]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!data || !Array.isArray(data.records) || !data.records.length) return;
    const headers = [
      'Record ID',
      'Plate (Standardized)',
      'Raw OCR Plate',
      'Format Valid',
      'Validation Status',
      'State',
      'Camera ID',
      'Camera Location',
      'Video Feed',
      'First Seen',
      'Last Seen',
      'Sightings Count',
      'OCR Confidence',
      'YOLO Confidence',
    ];

    const rows = data.records.map((r) => [
      r.record_id,
      r.plate,
      r.raw_plate,
      r.is_standard_format ? 'YES' : 'NO',
      r.validation_status,
      r.state_name,
      r.camera_id,
      `"${r.camera_name}"`,
      r.video_name,
      r.formatted_first_seen,
      r.formatted_last_seen,
      r.total_sightings,
      `${Math.round(r.best_ocr_confidence * 100)}%`,
      `${Math.round(r.best_detector_confidence * 100)}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `VisionX_Surveillance_Database_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="database-section" className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-black/10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[#6F6F6F] text-xs font-mono uppercase tracking-wider mb-3">
          <Database className="w-3.5 h-3.5 text-black" />
          <span>Surveillance Database & Registration Registry</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-sans font-bold text-[#000000] tracking-tight mb-4">
          Vehicle Plate Intelligence Database
        </h2>
        <p className="text-[#6F6F6F] text-base max-w-2xl mx-auto font-sans leading-relaxed">
          Structured records of all vehicles captured across camera junctions. Raw AI OCR readings
          are cross-matched against standard national vehicle plate syntax to eliminate misreads and
          distinguish authentic plates from street sign noise.
        </p>
      </div>

      {/* GPU Hardware Acceleration Dashboard (SpaceX Minimalist Console) */}
      <div className="bg-black text-white rounded-xs p-5 mb-6 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xs bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                ANPR INFERENCE ENGINE
              </h3>
              <span className="px-2 py-0.2 rounded-xs bg-emerald-950 border border-emerald-500/40 text-[9.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                CUDA ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              NVIDIA RTX 2050 (4.0 GB VRAM) • PyTorch 2.11 FP16 Tensor Cores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono">
          <div>
            <span className="text-neutral-500 block text-[9px] uppercase tracking-widest font-bold">FEEDS</span>
            <span className="text-white font-bold text-xs">{(data?.camera_options?.length) || 3} CAMERAS</span>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <span className="text-neutral-500 block text-[9px] uppercase tracking-widest font-bold">RTO PARSER</span>
            <span className="text-white font-bold text-xs">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-black/15 rounded-xs p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1 font-bold">
            DATABASE ENTRIES
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-black">
              {data?.total_records || 0}
            </span>
            <span className="text-xs font-mono text-neutral-500 uppercase">Records</span>
          </div>
        </div>

        <div className="bg-white border border-black/15 rounded-xs p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1 font-bold">
            STANDARD VERIFIED
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700">
              {data?.verified_standard_count || 0}
            </span>
            <span className="text-xs font-mono text-neutral-500 uppercase">RTO Match</span>
          </div>
        </div>

        <div className="bg-white border border-black/15 rounded-xs p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1 font-bold">
            ACTIVE CAMERAS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-black">
              {(data?.camera_options?.length) || 3}
            </span>
            <span className="text-xs font-mono text-neutral-500 uppercase">Feeds</span>
          </div>
        </div>

        <div className="bg-white border border-black/15 rounded-xs p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1 font-bold">
            FILTER MODE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-black">
              {validOnly ? 'STRICT' : 'RAW'}
            </span>
            <span className="text-xs font-mono text-neutral-500 uppercase">
              {validOnly ? 'Verified' : 'All OCR'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/15 rounded-xs p-4 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH REGISTRATION, DISTRICT, OR STATE..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 hover:bg-white focus:bg-white border border-black/20 rounded-xs text-xs font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white text-[11px] font-mono uppercase tracking-wider font-bold rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              FILTER
            </button>
          </form>

          {/* Camera Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="bg-white border border-black/20 rounded-xs px-3 py-2 text-xs font-mono uppercase text-black focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="ALL">ALL CAMERAS</option>
              <option value="CAM-01">CAM-01 • Silk Board</option>
              <option value="CAM-02">CAM-02 • Electronic City</option>
              <option value="CAM-04">CAM-04 • Kengeri NICE</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              disabled={!data || !Array.isArray(data.records) || data.records.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xs border border-black/20 bg-white hover:bg-neutral-100 text-black text-[11px] font-mono uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer"
              title="Download database as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Format Verification Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-black/10 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              PARSER MODE:
            </span>
            <button
              type="button"
              onClick={() => setValidOnly(true)}
              className={`text-[10.5px] font-mono uppercase tracking-wider px-3 py-1 rounded-xs border transition-colors cursor-pointer ${
                validOnly
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-neutral-600 border-black/20 hover:border-black hover:text-black'
              }`}
            >
              STANDARD PLATES ONLY
            </button>
            <button
              type="button"
              onClick={() => setValidOnly(false)}
              className={`text-[10.5px] font-mono uppercase tracking-wider px-3 py-1 rounded-xs border transition-colors cursor-pointer ${
                !validOnly
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-neutral-600 border-black/20 hover:border-black hover:text-black'
              }`}
            >
              INCLUDE RAW OCR NOISE
            </button>
          </div>
        </div>
      </div>

      {/* Database Table */}
      {/* Database Table (SpaceX Dense High-Precision Grid) */}
      <div className="bg-white border border-black/15 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 border-b border-black/10 uppercase tracking-wider text-[9.5px] text-neutral-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">CROP</th>
                <th className="py-2.5 px-3">REGISTRATION</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">CAMERA &amp; JUNCTION</th>
                <th className="py-2.5 px-3">WINDOW</th>
                <th className="py-2.5 px-2">READS</th>
                <th className="py-2.5 px-3">ACCURACY</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#6F6F6F]">
                    <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-3" />
                    <span>Loading surveillance database records...</span>
                  </td>
                </tr>
              ) : !data || !Array.isArray(data.records) || data.records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#6F6F6F]">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <span>No database records found matching the active filters.</span>
                  </td>
                </tr>
              ) : (
                data.records.map((rec) => {
                  const [x1, y1, x2, y2] = rec.best_box || [0, 0, 100, 100];
                  const cropUrl = `${BACKEND_URL}/api/crop/${rec.video_name}?frame=${rec.best_frame}&x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}&plate=${rec.plate}`;

                  return (
                    <tr
                      key={rec.record_id}
                      className="hover:bg-surface/50 transition-colors group"
                    >
                      {/* Snapshot Column */}
                      <td className="py-2.5 px-3">
                        <div className="relative w-16 h-10 rounded-xs overflow-hidden bg-black border border-black/20 shrink-0">
                          <img
                            src={cropUrl}
                            alt={rec.plate}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>

                      {/* Registration Plate Column */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-xs border border-black/20 bg-neutral-100 text-black inline-block">
                          {rec.plate}
                        </span>
                        {rec.state_code && (
                          <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                            {rec.state_code} {rec.rto_district && `• ${rec.rto_district}`}
                          </div>
                        )}
                      </td>

                      {/* Format Match Status */}
                      <td className="py-2.5 px-3">
                        {rec.validation_status === 'VERIFIED_STANDARD' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono uppercase font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            VERIFIED
                          </span>
                        ) : rec.validation_status === 'RECONSTRUCTED_STANDARD' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-neutral-100 text-neutral-800 border border-neutral-300 text-[10px] font-mono uppercase font-bold">
                            RECONSTRUCTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-mono uppercase">
                            RAW NOISE
                          </span>
                        )}
                      </td>

                      {/* Camera & Location */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-black">{rec.camera_name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {rec.camera_id} • {rec.video_name}
                        </div>
                      </td>

                      {/* Timeline Window */}
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-1 text-black font-semibold">
                          <Clock className="w-3 h-3 text-[#6F6F6F]" />
                          <span>{rec.formatted_first_seen}</span>
                        </div>
                        <span className="text-[10px] text-[#6F6F6F]">
                          to {rec.formatted_last_seen}
                        </span>
                      </td>

                      {/* Sightings Count */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-black font-mono">
                          {rec.total_sightings}
                        </span>
                        <span className="text-[10px] text-[#6F6F6F] block">appearances</span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-1 text-black font-semibold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{Math.round(rec.best_ocr_confidence * 100)}% OCR</span>
                        </div>
                        <span className="text-[10px] text-[#6F6F6F]">
                          {Math.round(rec.best_detector_confidence * 100)}% YOLO
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPlateModal({
                                plate: rec.plate,
                                rawPlate: rec.raw_plate,
                                state: rec.state_name,
                                cameraId: rec.camera_id,
                                cameraName: rec.camera_name,
                                siteName: rec.camera_name,
                                timestamp: rec.formatted_first_seen,
                                confidence: rec.best_ocr_confidence * 100,
                                videoName: rec.video_name,
                                imageUrl: cropUrl,
                              })
                            }
                            className="px-2 py-0.5 rounded-xs bg-black text-white text-[9.5px] font-mono uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Inspect high-resolution crop"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>READ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onJumpToCamera(rec.video_name, rec.first_seen, rec.plate)
                            }
                            className="px-2 py-0.5 rounded-xs border border-black/20 bg-white text-black text-[9.5px] font-mono uppercase tracking-wider font-bold hover:bg-neutral-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>CLIP</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekor Scout Plate Read Inspection Modal */}
      <PlateReadModal
        isOpen={!!selectedPlateModal}
        data={selectedPlateModal}
        onClose={() => setSelectedPlateModal(null)}
        onJumpToTimeline={(videoName, timestamp, plate) => {
          onJumpToCamera(videoName, timestamp, plate);
          setSelectedPlateModal(null);
        }}
        onTraceOnMap={(plate) => {
          router.push(`/dashboard/map?plate=${plate}`);
        }}
      />
    </section>
  );
};
