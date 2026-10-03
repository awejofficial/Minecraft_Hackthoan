"""
================================================================================
VisionX — FastAPI Backend Server for Three-Stage ANPR & TrOCR Pipeline
================================================================================
Endpoints:
  - GET  /api/health        : Health check, device status, model load info
  - POST /api/anpr/detect   : Multipart image upload for 3-stage ANPR + TrOCR
  - GET  /api/anpr/recent   : Recent vehicle plate sightings and telemetry
  - WS   /ws/traffic        : WebSocket live traffic feed for dashboard
================================================================================
"""

import os
import sys
import time
import base64
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))

try:
    from yolo_processing import TwoStageANPR
    HAS_ANPR = True
except Exception as e:
    print(f"⚠️ Warning: Could not import TwoStageANPR from yolo_processing: {e}")
    HAS_ANPR = False

app = FastAPI(
    title="VisionX AI ANPR & Roadway Intelligence API",
    description="End-to-End Three-Stage ANPR (YOLO11 Vehicle + YOLO Plate + TrOCR) Backend",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton ANPR engine
anpr_engine: Optional["TwoStageANPR"] = None

def get_engine():
    global anpr_engine
    if anpr_engine is None and HAS_ANPR:
        try:
            print("Initializing TwoStageANPR engine...")
            anpr_engine = TwoStageANPR(enable_ocr=True)
            print("✅ TwoStageANPR engine initialized successfully.")
        except Exception as err:
            print(f"⚠️ Error initializing TwoStageANPR: {err}")
    return anpr_engine


# In-memory recent detections buffer
recent_sightings: List[dict] = []

@app.on_event("startup")
async def startup_event():
    get_engine()


@app.get("/api/health")
async def health_check():
    engine = get_engine()
    device = getattr(engine, "device", "cpu") if engine else "unknown"
    ocr_available = getattr(engine.ocr_reader, "available", False) if (engine and engine.ocr_reader) else False
    
    return {
        "status": "healthy",
        "service": "VisionX ANPR AI Backend",
        "device": str(device),
        "engine_ready": engine is not None,
        "trocr_ready": ocr_available,
        "models": {
            "vehicle_detector": "yolo11n.pt",
            "plate_detector": "best.pt (YOLO11s Indian Plate)",
            "ocr_transformer": "trocr_indian_plates (Vision Transformer)"
        }
    }


@app.post("/api/anpr/detect")
async def detect_plate(
    file: UploadFile = File(...),
    v_conf: float = Query(0.25, ge=0.01, le=1.0),
    p_conf: float = Query(0.06, ge=0.01, le=1.0),
    do_ocr: bool = Query(True),
):
    """
    Accepts an uploaded vehicle image and executes:
      Stage 1: Vehicle Detection (YOLO11n)
      Stage 2: Plate Localization (YOLO11s fine-tuned)
      Stage 3: Alphanumeric Character Recognition (TrOCR)
    Returns detected bounding boxes, plates, labels, and base64 annotated image.
    """
    engine = get_engine()
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="ANPR AI engine is not initialized or PyTorch models are unavailable."
        )

    # Read image contents
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image file.")

    t0 = time.perf_counter()
    results = engine.detect(
        frame=frame,
        v_conf=v_conf,
        p_conf=p_conf,
        do_ocr=do_ocr,
    )
    inference_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Encode annotated frame to base64 JPEG
    annotated = results.get("annotated")
    annotated_b64 = None
    if annotated is not None:
        success, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if success:
            annotated_b64 = base64.b64encode(buffer).decode("utf-8")

    # Format plate response
    plates_output = []
    for p in results.get("plates", []):
        plate_record = {
            "plate": p.get("text", "N/A"),
            "confidence": round(float(p.get("conf", 0.0)), 4),
            "box": [int(x) for x in p.get("box", [])],
        }
        plates_output.append(plate_record)

        # Store in recent sightings
        if plate_record["plate"] and plate_record["plate"] != "N/A":
            recent_sightings.insert(0, {
                **plate_record,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "camera_id": "CAM-ONLINE-01",
            })
            if len(recent_sightings) > 100:
                recent_sightings.pop()

    vehicles_output = []
    for v in results.get("vehicles", []):
        vehicles_output.append({
            "label": v.get("label", "vehicle"),
            "confidence": round(float(v.get("conf", 0.0)), 4),
            "box": [int(x) for x in v.get("box", [])],
        })

    return {
        "success": True,
        "inference_time_ms": inference_time_ms,
        "vehicles_count": len(vehicles_output),
        "plates_count": len(plates_output),
        "plates": plates_output,
        "vehicles": vehicles_output,
        "annotated_image": f"data:image/jpeg;base64,{annotated_b64}" if annotated_b64 else None,
    }


@app.get("/api/anpr/recent")
async def get_recent_sightings(limit: int = 20):
    """Returns the most recent plate sightings logged by the ANPR pipeline."""
    return {
        "count": len(recent_sightings[:limit]),
        "sightings": recent_sightings[:limit]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting VisionX Backend API server on http://localhost:{port}...")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
