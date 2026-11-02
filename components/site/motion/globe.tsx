"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

type LatLng = [number, number];

// Where participants come from (drawn without labels) and the host city.
const ORIGINS: LatLng[] = [
  [38.56, 68.78], // Dushanbe
  [41.3, 69.24], // Tashkent
  [43.24, 76.89], // Almaty
  [42.87, 74.59], // Bishkek
  [37.96, 58.33], // Ashgabat
  [55.76, 37.62], // Moscow
  [40.41, 49.87], // Baku
  [47.89, 106.91], // Ulaanbaatar
  [41.01, 28.98], // Istanbul
  [25.2, 55.27], // Dubai
  [33.68, 73.05], // Islamabad
  [3.14, 101.69], // Kuala Lumpur
  [-6.2, 106.85], // Jakarta
  [30.04, 31.24], // Cairo
];
const HOST: LatLng = [30.0, 120.58]; // Shaoxing

const GOLD: [number, number, number] = [0.79, 0.6, 0.23];
const RADIUS = 0.8; // cobe draws the sphere at radius 0.8 in clip space

/** Same lat/lng → unit vector mapping cobe uses for its markers. */
function toVec([lat, lng]: LatLng): [number, number, number] {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const c = Math.cos(r);
  return [-c * Math.cos(a), Math.sin(r), c * Math.sin(a)];
}

/** cobe's view rotation J(theta, phi) applied to a world point (column-major mat3 · v). */
function rotate(p: [number, number, number], phi: number, theta: number): [number, number, number] {
  const c = Math.cos(theta), d = Math.cos(phi), e = Math.sin(theta), f = Math.sin(phi);
  return [
    d * p[0] + 0 * p[1] + f * p[2],
    f * e * p[0] + c * p[1] - d * e * p[2],
    -f * c * p[0] + e * p[1] + d * c * p[2],
  ];
}

function slerp(a: number[], b: number[], t: number): [number, number, number] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return [a[0], a[1], a[2]];
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
}

// Facing longitude ~85°E puts every origin and the host on the visible side.
const BASE_PHI = -Math.PI / 2 - (85 * Math.PI) / 180;
const THETA = 0.28;

const TONES = {
  light: {
    dark: 0,
    diffuse: 1.1,
    mapBrightness: 5.5,
    baseColor: [0.98, 0.96, 0.92] as [number, number, number],
    glowColor: [0.99, 0.95, 0.86] as [number, number, number],
  },
  // For navy backgrounds (footer).
  dark: {
    dark: 1,
    diffuse: 1.4,
    mapBrightness: 3.2,
    baseColor: [0.16, 0.24, 0.4] as [number, number, number],
    glowColor: [0.12, 0.2, 0.36] as [number, number, number],
  },
};

export function Globe({ className, tone = "light" }: { className?: string; tone?: keyof typeof TONES }) {
  const globeRef = useRef<HTMLCanvasElement>(null);
  const arcRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; offset: number } | null>(null);
  const dragOffset = useRef(0);

  useEffect(() => {
    const canvas = globeRef.current;
    const arcCanvas = arcRef.current;
    if (!canvas || !arcCanvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = canvas.offsetWidth;
    let phi = BASE_PHI;
    let t = 0;
    const host = toVec(HOST);
    const origins = ORIGINS.map(toVec);
    const ctx = arcCanvas.getContext("2d")!;

    function resize() {
      size = canvas!.offsetWidth;
      arcCanvas!.width = size * dpr;
      arcCanvas!.height = size * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    function project(p: [number, number, number], lift: number) {
      const v = rotate(p, phi, THETA);
      const r = RADIUS * lift;
      return {
        x: ((v[0] * r + 1) / 2) * size * dpr,
        y: ((1 - v[1] * r) / 2) * size * dpr,
        front: v[2] > -0.05,
      };
    }

    function drawArcs() {
      ctx.clearRect(0, 0, arcCanvas!.width, arcCanvas!.height);
      ctx.lineCap = "round";
      origins.forEach((o, i) => {
        // Each arc "flies" on its own loop, staggered so they never all pulse together.
        const cycle = ((t * 0.18 + i / origins.length) % 1) * 1.6;
        const head = Math.min(cycle, 1);
        const tail = Math.max(0, cycle - 0.55);
        const steps = 48;
        let prev: ReturnType<typeof project> | null = null;
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const p = slerp(o, host, u);
          const pt = project(p, 1 + 0.22 * Math.sin(Math.PI * u));
          if (prev && prev.front && pt.front) {
            const lit = u >= tail && u <= head;
            ctx.strokeStyle = lit ? "rgba(201,153,58,0.95)" : "rgba(201,153,58,0.16)";
            ctx.lineWidth = (lit ? 1.8 : 1) * dpr;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          }
          prev = pt;
        }
      });
      // Host pulse
      const h = project(host, 1);
      const pulse = (t * 0.8) % 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (4 + pulse * 16) * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,153,58,${0.6 * (1 - pulse)})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta: THETA,
      ...TONES[tone],
      mapSamples: 18000,
      mapBaseBrightness: 0.02,
      markerColor: GOLD,
      opacity: 0.92,
      markers: [
        ...ORIGINS.map((location) => ({ location, size: 0.035 })),
        { location: HOST, size: 0.08 },
      ],
      onRender: (state) => {
        if (!reduced) t += 0.016;
        const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.35;
        phi = BASE_PHI + sway + dragOffset.current;
        state.phi = phi;
        state.width = size * dpr;
        state.height = size * dpr;
        drawArcs();
      },
    });

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
      arcCanvas.style.opacity = "1";
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", resize);
    };
  }, [tone]);

  return (
    <div
      className={cn("relative aspect-square w-full touch-pan-y", className)}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, offset: dragOffset.current };
        (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      }}
      onPointerUp={(e) => {
        drag.current = null;
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
      onPointerLeave={() => (drag.current = null)}
      onPointerMove={(e) => {
        if (!drag.current) return;
        dragOffset.current = drag.current.offset + (e.clientX - drag.current.x) / 200;
      }}
      style={{ cursor: "grab" }}
      aria-hidden
    >
      <canvas
        ref={globeRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
      />
      <canvas
        ref={arcRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
}
