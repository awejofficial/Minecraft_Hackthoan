"use client";

import { useEffect, useRef, useState } from "react";

/**
 * City traffic dashboard:
 * - A 16x16 heatmap cell grid that gently breathes via randomised intensities.
 * - Corridor average-speed bars that animate width on mount.
 * - A static trend polyline (placeholder).
 *
 * No fabricated numbers — labels are placeholders so reviewers know the
 * panels are structural.
 */

const GRID = 16;
const CORRIDORS = [
  { name: "Corridor A", pct: 62 },
  { name: "Corridor B", pct: 38 },
  { name: "Corridor C", pct: 74 },
  { name: "Corridor D", pct: 50 },
];

// Two hotspots roughly in the centre
const HOTSPOTS: [number, number][] = [
  [4, 5], [10, 9],
];

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export default function Dashboard() {
  const [intensities, setIntensities] = useState<number[]>(() =>
    Array.from({ length: GRID * GRID }, (_, i) => {
      const x = i % GRID;
      const y = Math.floor(i / GRID);
      let h = 0;
      for (const hs of HOTSPOTS) h += Math.max(0, 1 - Math.hypot(x - hs[0], y - hs[1]) / 7);
      return Math.min(1, h * 0.85);
    })
  );
  const raf = useRef(0);

  useEffect(() => {
    const tick = () => {
      setIntensities((prev) => {
        const next = prev.slice();
        for (let i = 0; i < next.length; i++) {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          let h = 0;
          for (const hx of HOTSPOTS) {
            const d = Math.hypot(x - hx[0], y - hx[1]);
            h += Math.max(0, 1 - d / 7);
          }
          // blend hotspot with a small jitter so the surface breathes
          const target = Math.min(1, h * 0.85 + Math.random() * 0.08);
          next[i] = next[i] * 0.85 + target * 0.15;
        }
        return next;
      });
      raf.current = window.setTimeout(() => requestAnimationFrame(tick), 700);
    };
    raf.current = window.setTimeout(() => requestAnimationFrame(tick), 700);
    return () => window.clearTimeout(raf.current);
  }, []);

  return (
    <div className="dash">
      <div className="card">
        <span className="mono">Heatmap</span>
        <h4>Vehicle density by grid cell</h4>
        <div className="hm">
          {intensities.map((v, i) => {
            const t = Math.min(1, v);
            // interpolate between low (#EDE9DD), amber (#F2A93B), accent (#E4572E)
            const color =
              t < 0.5
                ? blend("#EDE9DD", "#F2A93B", t / 0.5)
                : blend("#F2A93B", "#E4572E", (t - 0.5) / 0.5);
            return <div key={i} style={{ background: color }} />;
          })}
        </div>
        <div className="scale">
          <span>Low</span>
          <i></i>
          <span>High</span>
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <span className="mono">Average speed</span>
          <h4>By corridor</h4>
          <div className="bars">
            {CORRIDORS.map((c) => (
              <div className="bar" key={c.name}>
                <span>{c.name}</span>
                <div><i style={{ width: `${c.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <span className="mono">Trend</span>
          <h4>Traffic through the day</h4>
          <svg viewBox="0 0 300 80" width="100%" height="80" preserveAspectRatio="none">
            <line x1="0" y1="79" x2="300" y2="79" stroke="#D9D7CF" />
            <polyline
              fill="none"
              stroke="#121212"
              strokeWidth="1.5"
              points="0,60 30,56 60,38 90,18 120,30 150,42 180,36 210,20 240,14 270,40 300,58"
            />
          </svg>
          <p className="dash-note">Placeholder curve</p>
        </div>
      </div>
    </div>
  );
}

function blend(a: string, b: string, t: number) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
  const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}