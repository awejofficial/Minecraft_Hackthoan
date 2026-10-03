import { db } from "@/db";
import { sql } from "drizzle-orm";
import InteractiveCity from "@/components/InteractiveCity";
import TrajectoryDemo from "@/components/TrajectoryDemo";
import Dashboard from "@/components/Dashboard";
import LaneStrip from "@/components/LaneStrip";
import StoryMap from "@/components/StoryMap";
import RekorNav from "@/components/RekorNav";
import RekorHero from "@/components/RekorHero";

export const dynamic = "force-dynamic";

const ROWS: { q: string; anpr: string; pt: string; same?: boolean }[] = [
  {
    q: "Reading a plate",
    anpr: "Yes",
    pt: "Yes, as the first step of the pipeline",
    same: true,
  },
  {
    q: "What you get per vehicle",
    anpr: "A list of separate reads, one row per camera",
    pt: "One ordered journey with the time gap between cameras",
  },
  {
    q: "Misread plates",
    anpr: "Stored as a different vehicle",
    pt: "Matched to the nearest known plate and kept on the same route",
  },
  {
    q: "Cloned plates",
    anpr: "Every read looks valid, so nothing is flagged",
    pt: "Flagged when one plate appears too far apart in too little time",
  },
  {
    q: "Suspicious routes",
    anpr: "Not visible in a read log",
    pt: "Loops, repeat passes and unusual paths raise an alert",
  },
  {
    q: "Blacklisted vehicle",
    anpr: "Alert at the camera that saw it",
    pt: "Alert, plus the route taken before and after the hit",
  },
  {
    q: "City picture",
    anpr: "None, reads are not analysed together",
    pt: "Heatmaps, corridor speeds and route density from the same reads",
  },
  {
    q: "Camera hardware",
    anpr: "Often dedicated cameras at fixed points",
    pt: "Built to read from city camera feeds that are already installed",
  },
];

export default async function HomePage() {
  await db.execute(sql`select 1`);

  return (
    <div className="spacex-landing theme-light">
      <RekorNav theme="light" />
      <RekorHero theme="light" />

      {/* ─────── Why: compare with ANPR ─────── */}
      <section className="section" id="why">
        <div className="wrap">
          <div className="sec-head">
            <h2>Plate reading is the first step, not the product</h2>
            <p>
              ANPR cameras already read plates well. The gap is what happens after the read.
              VisionX is the layer that connects reads into journeys, analytics and alerts.
            </p>
          </div>

          <div className="cmp-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Typical ANPR system</th>
                  <th className="pt">VisionX</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.q}>
                    <td>{r.q}</td>
                    <td className={r.same ? "" : "no"}>
                      <i className={r.same ? "tick" : "dash"} />
                      {r.anpr}
                    </td>
                    <td className="pt">
                      <i className="tick" />
                      {r.pt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────── What only a journey can show ─────── */}
      <section className="section" id="insights">
        <div className="wrap">
          <div className="sec-head">
            <h2>Three things only a journey can show</h2>
            <p>
              A read log cannot answer these. They need every sighting of a vehicle in time
              order, so they come from the trajectory engine rather than from the camera.
            </p>
          </div>

          <div className="grid3">
            <article className="ins">
              <div className="art"><CloneArt /></div>
              <div className="body">
                <span className="mono-xs">Journey only / 01</span>
                <h3>Cloned plate detection</h3>
                <p>
                  Two cars wearing one plate appear at distant cameras minutes apart. A reader
                  sees two valid reads. A journey sees a hop no single vehicle can make.
                </p>
              </div>
            </article>
            <article className="ins">
              <div className="art"><LoopArt /></div>
              <div className="body">
                <span className="mono-xs">Journey only / 02</span>
                <h3>Loop and circling detection</h3>
                <p>
                  A vehicle that passes the same junction three times in forty minutes hides
                  in a read log and stands out on a route.
                </p>
              </div>
            </article>
            <article className="ins">
              <div className="art"><MisreadArt /></div>
              <div className="body">
                <span className="mono-xs">Journey only / 03</span>
                <h3>Misread recovery</h3>
                <p>
                  Rain, glare and angle turn a B into an 8. Matching against nearby plates and
                  timing keeps the sighting on the right journey instead of creating a ghost vehicle.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ─────── Components ─────── */}
      <section className="section" id="components">
        <div className="wrap">
          <div className="sec-head">
            <h2>Four components, as the problem statement requires</h2>
            <p>
              Each component maps to one required function in SIH26127. They share a single
              store of plate sightings, so a read from the camera becomes a trajectory point,
              a heatmap cell and an alert check at the same time.
            </p>
          </div>

          <div className="grid4">
            <div className="cell">
              <span className="n">01</span>
              <h3>High-precision OCR</h3>
              <p>Detects the plate in each frame, corrects perspective and reads the characters.</p>
              <span className="target">Target: above 90% accuracy</span>
              <ul style={{ marginTop: 16 }}>
                <li>Plate detection and crop</li>
                <li>Low-light and blur enhancement</li>
                <li>Indian plate format validation</li>
              </ul>
            </div>
            <div className="cell">
              <span className="n">02</span>
              <h3>Trajectory reconstruction engine</h3>
              <p>Search a plate and get its sightings ordered by time, drawn on the map.</p>
              <ul>
                <li>Chronological camera hits</li>
                <li>Route and time gaps between hits</li>
                <li>Fuzzy match for misread characters</li>
              </ul>
            </div>
            <div className="cell">
              <span className="n">03</span>
              <h3>City traffic analytics dashboard</h3>
              <p>GIS-integrated view of how the city moves, updated from the same sightings.</p>
              <ul>
                <li>Heatmaps</li>
                <li>Average speeds</li>
                <li>Route density and trends</li>
              </ul>
            </div>
            <div className="cell">
              <span className="n">04</span>
              <h3>Alert system</h3>
              <p>Checks every new sighting against watchlists and route rules in real time.</p>
              <ul>
                <li>Blacklisted vehicle match</li>
                <li>Route anomaly rules</li>
                <li>Alert with camera, time and image</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────── Pipeline (with live lane example) ─────── */}
      <section className="section" id="pipeline">
        <div className="wrap">
          <div className="sec-head">
            <h2>From camera frame to alert</h2>
            <p>
              A streaming design. Every step writes to the sighting store, and the alert check
              runs before the result reaches the operator. The feed below shows step two, the
              read, on a simulated lane.
            </p>
          </div>

          <LaneStrip />

          <div className="pipe">
            <div className="step">
              <h4>Ingest</h4>
              <p>RTSP streams and recorded footage from junction cameras, with camera ID and location attached.</p>
            </div>
            <div className="step">
              <h4>Read</h4>
              <p>Detector finds the plate, OCR returns text and a confidence score.</p>
            </div>
            <div className="step">
              <h4>Store</h4>
              <p>Plate, camera, timestamp, confidence and crop saved as one sighting record.</p>
            </div>
            <div className="step">
              <h4>Analyse</h4>
              <p>Sightings are joined into trajectories and aggregated into density and speed.</p>
            </div>
            <div className="step alert">
              <h4>Alert</h4>
              <p>Watchlist and anomaly rules fire and notify the control room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────── Demo ─────── */}
      <section className="section" id="demo">
        <div className="wrap">
          <div className="sec-head">
            <h2>Trajectory search</h2>
            <p>
              Pick a plate or type one. The route is rebuilt from its camera sightings in time
              order. Try the cloned plate to see an impossible hop, or mistype a character to see
              the closest match recovered. All plates, cameras and times are simulated.
            </p>
          </div>

          <TrajectoryDemo />
        </div>
      </section>

      {/* ─────── Operator console (3D) ─────── */}
      <section className="section" id="console">
        <div className="wrap">
          <div className="sec-head">
            <h2>The operator view</h2>
            <p>
              A 3D model of the camera network. Click any vehicle, or leave auto-read on. The
              camera locks onto the rear plate, OCR returns text and confidence, and the read
              joins that vehicle&apos;s journey. Captures are kept for this session only.
            </p>
          </div>

          <div className="console-grid">
            <InteractiveCity theme="light" />
            <ol className="console-notes">
              <li><b>01</b><span>Cameras cover junctions. Amber cones show what each one sees.</span></li>
              <li><b>02</b><span>Glow on the road marks density. Red is the busiest junction.</span></li>
              <li><b>03</b><span>A locked car shows its plate, class, camera and confidence.</span></li>
              <li><b>04</b><span>Every read is logged with a time, ready to join a journey.</span></li>
            </ol>
          </div>
        </div>
      </section>

      {/* ─────── Dashboard ─────── */}
      <section className="section" id="dashboard">
        <div className="wrap">
          <div className="sec-head">
            <h2>City traffic dashboard</h2>
            <p>
              The layout operators will see. The panels below use placeholder values to show
              structure. Live figures come from the sighting store once cameras are connected.
            </p>
          </div>

          <Dashboard />
        </div>
      </section>



      <footer>
        <div className="wrap">
          <span>VISIONX · ADVANCED MOBILITY &amp; ROADWAY INTELLIGENCE</span>
          <span>ALL VEHICLE TELEMETRY AND CAMERA SIGHTINGS SIMULATED</span>
        </div>
      </footer>
    </div>
  );
}

/* ───────── Insight artwork ───────── */

const MONO_STYLE = { fontFamily: "var(--mono-font)" } as const;

function CloneArt() {
  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <line x1="48" y1="104" x2="252" y2="46" stroke="#C9C6B9" strokeWidth="12" strokeLinecap="round" />
      <line x1="48" y1="104" x2="252" y2="46" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <line x1="48" y1="104" x2="252" y2="46" stroke="#B8321A" strokeWidth="2.5" strokeDasharray="6 5"
        strokeLinecap="round" className="march" />
      {[[48, 104], [252, 46]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 14} y={y - 14} width="28" height="28" fill="none" stroke="#B8321A" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.9;0.15;0.9" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </rect>
          <rect x={x - 7} y={y - 7} width="14" height="14" fill="#121212" />
          <rect x={x - 2.5} y={y - 2.5} width="5" height="5" fill="#F2A93B" />
        </g>
      ))}
      <text x="48" y="136" textAnchor="middle" style={{ ...MONO_STYLE, fontSize: 9, fill: "#5E5E59" }}>CAM 2  09:07</text>
      <text x="252" y="80" textAnchor="middle" style={{ ...MONO_STYLE, fontSize: 9, fill: "#5E5E59" }}>CAM 6  09:09</text>
      <rect x="102" y="62" width="96" height="17" fill="#B8321A" />
      <text x="150" y="73.5" textAnchor="middle" style={{ ...MONO_STYLE, fontSize: 8.5, fill: "#fff" }}>2 MIN APART</text>
      <text x="150" y="26" textAnchor="middle" style={{ ...MONO_STYLE, fontSize: 10, fill: "#121212", fontWeight: 600 }}>DL04GH4004</text>
    </svg>
  );
}

function LoopArt() {
  const d = "M30 75 L150 75 L150 28 L240 28 L240 75 L150 75 L150 122 L60 122 L60 75 L150 75 L272 75";
  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d={d} fill="none" stroke="#C9C6B9" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#E4572E" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />
      <rect x="132" y="57" width="36" height="36" fill="none" stroke="#E4572E" strokeWidth="1.6">
        <animate attributeName="opacity" values="1;0.15;1" dur="1.8s" repeatCount="indefinite" />
      </rect>
      <rect x="143" y="68" width="14" height="14" fill="#121212" />
      <rect x="147.5" y="72.5" width="5" height="5" fill="#F2A93B" />
      <rect x="-5" y="-5" width="10" height="10" fill="#E4572E" stroke="#fff" strokeWidth="2">
        <animateMotion path={d} dur="7s" repeatCount="indefinite" calcMode="linear" />
      </rect>
      <rect x="160" y="86" width="98" height="16" fill="#E4572E" />
      <text x="209" y="97.5" textAnchor="middle" style={{ ...MONO_STYLE, fontSize: 8.5, fill: "#fff" }}>3 PASSES, 40 MIN</text>
    </svg>
  );
}

function MisreadArt() {
  return (
    <div className="mis">
      <div className="mis-row">
        <span className="mono-xs">Read at Camera 3</span>
        <div className="mis-plate">DL 01 A<em className="bad">8</em> 1001</div>
      </div>
      <div className="mis-arrow" aria-hidden />
      <div className="mis-row">
        <span className="mono-xs">Matched to known plate</span>
        <div className="mis-plate">DL 01 A<em className="ok">B</em> 1001</div>
      </div>
    </div>
  );
}

