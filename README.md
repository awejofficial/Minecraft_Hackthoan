# PlateTrace

A minimalist traffic intelligence demo built with Next.js that visualizes how ANPR camera reads can be turned into vehicle journeys, route analysis, and city-level traffic insights.

This project presents a prototype for a smart traffic monitoring system with:

- plate-reading and journey reconstruction
- cloned-plate / anomaly detection concepts
- heatmap and corridor traffic visualizations
- simulated city camera and route data
- operator dashboard and trajectory search experience

## Overview

PlateTrace is designed around the idea that raw plate reads are only the first step. The real value comes from linking reads over time and space to rebuild each vehicle's journey, detect abnormal routes, and measure how traffic flows through the city.

The interface includes:

- an animated city traffic dashboard
- route/trajectory search workflow
- 3D-like operator view of the camera network
- traffic density heatmaps and corridor speed bars
- prototype storytelling layout explaining the system

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Three.js
- Tailwind CSS
- ESLint

## Project Structure

```text
.
├── src/
│   ├── app/                # Next.js app pages and styling entry points
│   ├── components/         # Dashboard, city scene, trajectory UI, cards
│   ├── db/                 # Database connection and schema entrypoint
│   └── ...
├── drizzle.config.json     # Drizzle configuration for PostgreSQL
├── package.json            # Scripts and dependencies
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

## Features

- City traffic heatmap with animated hotspot intensity
- Corridor-level average speed summary bars
- Trend visualization for traffic patterns
- Plate trajectory search and route reconstruction concept
- Camera network simulation with operator-style monitoring UI
- Alert logic concepts for cloned plates, loops, and blacklisted vehicles

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database running locally or remotely
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root with a PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/app_db
```

### 3. Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev       # run app in development mode
npm run build     # production build
npm run start     # run production build
npm run lint      # run ESLint
npm run typecheck # run TypeScript type check
```

## Database Notes

This project includes Drizzle support and expects a PostgreSQL database. The current setup checks for `DATABASE_URL` during startup and uses a shared Postgres pool through `src/db/index.ts`.

## Notes

This repository is a prototype/demo interface intended to communicate the system design and user experience of a traffic intelligence product. The plate data, camera network, and traffic patterns are simulated for demonstration purposes.

## License

No license has been specified for this project yet.
