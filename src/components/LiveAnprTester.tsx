"use client";

import { useState, useRef } from "react";

type DetectionPlate = {
  plate: string;
  confidence: number;
  box: number[];
};

type DetectionVehicle = {
  label: string;
  confidence: number;
  box: number[];
};

type DetectionResult = {
  success: boolean;
  inference_time_ms: number;
  vehicles_count: number;
  plates_count: number;
  plates: DetectionPlate[];
  vehicles: DetectionVehicle[];
  annotated_image?: string;
};

export default function LiveAnprTester() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/anpr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.details || "Inference failed");
      }

      const data: DetectionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Failed to connect to Python backend");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anpr-tester-box">
      <div className="anpr-tester-head">
        <div>
          <span className="mono-badge">AI INFERENCE</span>
          <h3>Live Three-Stage ANPR &amp; TrOCR Test Bench</h3>
          <p>
            Upload any traffic camera frame or vehicle photo to run real-time YOLO11 vehicle
            detection, YOLO plate localization, and Vision Transformer (TrOCR) OCR.
          </p>
        </div>
        <button
          type="button"
          className="anpr-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? "PROCESSING..." : "UPLOAD FRAME"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="anpr-error-banner">
          <strong>Backend Notice:</strong> {error}
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
            To run live inferences, launch the backend with: <code>npm run backend:dev</code>
          </div>
        </div>
      )}

      {result && (
        <div className="anpr-result-grid">
          <div className="anpr-image-pane">
            <span className="sub-title">Annotated AI Pipeline Output</span>
            {result.annotated_image ? (
              <img
                src={result.annotated_image}
                alt="ANPR detection output"
                className="anpr-annotated-img"
              />
            ) : preview ? (
              <img src={preview} alt="Uploaded frame" className="anpr-annotated-img" />
            ) : null}
          </div>

          <div className="anpr-stats-pane">
            <div className="stat-card">
              <span className="stat-label">LATENCY</span>
              <span className="stat-val">{result.inference_time_ms} ms</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">VEHICLES</span>
              <span className="stat-val">{result.vehicles_count}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">PLATES</span>
              <span className="stat-val">{result.plates_count}</span>
            </div>

            <div className="anpr-plates-list">
              <span className="sub-title">Recognized Plates (TrOCR)</span>
              {result.plates.length === 0 ? (
                <p className="no-data">No license plates detected in frame.</p>
              ) : (
                result.plates.map((p, idx) => (
                  <div key={idx} className="plate-badge-row">
                    <span className="plate-tag">{p.plate}</span>
                    <span className="plate-conf">{(p.confidence * 100).toFixed(1)}% conf</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
