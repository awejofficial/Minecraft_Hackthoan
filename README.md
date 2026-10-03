# VisionX — Roadway Intelligence & Traffic Mobility Platform

A minimalist, high-performance roadway intelligence web application built with **Next.js 16**, **Three.js**, and **TypeScript**. VisionX visualizes real-time vehicle trajectories, traffic density heatmaps, and simulated three-stage ANPR camera feeds.

---

## 🚀 Live Demo

- **Production URL**: [https://visionx-intelligence.vercel.app](https://visionx-intelligence.vercel.app)

---

## 📁 Repository Structure

All frontend application code is housed in the `frontend/` directory:

```text
.
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (pages, layout, styling)
│   │   ├── components/         # 3D CityScene, TrajectoryDemo, LiveAnprTester
│   │   ├── db/                 # Database connection & Drizzle schema
│   │   └── lib/                # Telemetry, camera controls & simulated feeds
│   ├── package.json            # Frontend dependencies & Next.js scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── postcss.config.mjs      # PostCSS & Tailwind integration
│   ├── vercel.json             # Vercel deployment configuration
│   └── .vercelignore           # Deployment optimization rules
├── package.json                # Root convenience scripts
├── .gitignore                  # Monorepo ignore rules
└── README.md                   # Project documentation
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** 20+
- **npm** 10+

### 2. Installation
Run from root or `frontend/`:

```bash
# Option A: From root
npm run dev

# Option B: Inside frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Builds the optimized production bundle |
| `npm run start` | Runs the production server |
| `npm run typecheck` | Validates TypeScript with zero type errors |
| `npm run lint` | Runs ESLint analysis |

---

## 🌟 Key Features

1. **Interactive 3D City Visualization**: Real-time traffic simulation with camera junction cones and vehicle pins powered by Three.js.
2. **Three-Stage AI ANPR Test Bench**: Test vehicle license plates with 1-click presets or custom uploads (YOLO11 Vehicle + YOLO Plate + Vision Transformer TrOCR).
3. **Trajectory Reconstruction**: Chronological camera sighting lookup, detecting impossible hops (cloned plates), loops, and route anomalies.
4. **City Traffic Dashboard**: Real-time traffic density heatmap grid and corridor speed telemetry.
