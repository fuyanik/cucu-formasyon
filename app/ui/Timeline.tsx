"use client";

import { useRef } from "react";
import { segments, VIEW_END, VIEW_START, type Cues } from "@/lib/choreo";

const W = 1000;
const X = (t: number) => ((t - VIEW_START) / (VIEW_END - VIEW_START)) * W;
const COLORS = { bekle: "#eef1f7", cucu: "#f7b8d3", yuru: "#cddcfb", son: "#fbe2b8" } as const;

export default function Timeline({ t, cues, onSeek }: { t: number; cues: Cues; onSeek: (t: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const seekFromEvent = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const u = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onSeek(VIEW_START + u * (VIEW_END - VIEW_START));
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} 44`}
      preserveAspectRatio="none"
      className="timeline"
      onPointerDown={(e) => {
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        seekFromEvent(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons) seekFromEvent(e);
      }}
    >
      {segments(cues).map((s, i) => {
        const a = Math.max(s.from, VIEW_START);
        const b = Math.min(s.to, VIEW_END);
        if (b <= a) return null;
        return <rect key={i} x={X(a)} y="14" width={X(b) - X(a)} height="16" fill={COLORS[s.kind]} />;
      })}
      {[cues.c1, cues.c2, cues.c3].map((c, i) => (
        <rect key={i} x={X(c) - 2} y="6" width="4" height="32" rx="2" fill="#e85d9c" />
      ))}
      {t >= VIEW_START && t <= VIEW_END && <rect x={X(t) - 1.5} y="2" width="3" height="40" rx="1.5" fill="#111827" />}
    </svg>
  );
}
