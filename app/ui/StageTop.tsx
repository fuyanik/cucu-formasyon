import { COUPLES, R, RING_C, RING_ORDER, STAGE, type Frame, type Pt } from "@/lib/choreo";

const BLUE = "#2f6fe4";
const PINK = "#e85d9c";
const NAMES = Object.fromEntries(COUPLES.map((c) => [c.id, c.name]));

/** Seyirci sıraları: baş + omuz siluetleri. */
function Audience({ x0, x1 }: { x0: number; x1: number }) {
  const rows = [
    { y: 640, dx: 0, fill: "#e4e8f1" },
    { y: 672, dx: 19, fill: "#d6dbe7" },
  ];
  return (
    <g>
      {rows.map((row, ri) =>
        Array.from({ length: Math.floor((x1 - x0) / 38) + 1 }, (_, i) => x0 + row.dx + i * 38)
          .filter((x) => x <= x1)
          .map((x) => (
            <g key={`${ri}-${x}`} fill={row.fill}>
              <circle cx={x} cy={row.y - 12} r="8" />
              <path d={`M${x - 15} ${row.y + 12} Q${x - 15} ${row.y - 3} ${x} ${row.y - 3} Q${x + 15} ${row.y - 3} ${x + 15} ${row.y + 12} Z`} />
            </g>
          )),
      )}
    </g>
  );
}

export default function StageTop({ frame, compact }: { frame: Frame; compact: boolean }) {
  const { pos, flash, bounce, armsUp, point, cueLabel, frontBlink, hook, ring, lift } = frame;
  const r = R * bounce;
  // Dar/dikey ekranlarda sahneyi daraltıp dansçıları büyüt.
  const box = compact ? { x: 146, w: 508 } : { x: 20, w: 760 };
  // Telefonda seyirci alanı %20 daha kısa.
  const vb = compact ? `${box.x - 6} -18 ${box.w + 12} 698` : `0 -28 ${STAGE.w} 728`;
  const pairLabels = 1 - Math.max(hook, ring);
  const footDir = point ? (point.side === "sag" ? -1 : 1) : 0;
  const manBlink = point ? 0.3 + 0.7 * point.blink : 0;

  const arms = (p: Pt) =>
    armsUp > 0 && (
      <g opacity={armsUp} stroke="#f2a93b" strokeWidth="2.5" strokeLinecap="round">
        <line x1={p.x - 20} y1={p.y} x2={p.x - 20 - 8 * armsUp} y2={p.y - 12 * armsUp} />
        <line x1={p.x + 20} y1={p.y} x2={p.x + 20 + 8 * armsUp} y2={p.y - 12 * armsUp} />
        <circle cx={p.x - 20 - 8 * armsUp} cy={p.y - 13 * armsUp} r="3.5" fill="#f2a93b" />
        <circle cx={p.x + 20 + 8 * armsUp} cy={p.y - 13 * armsUp} r="3.5" fill="#f2a93b" />
      </g>
    );

  const flashRing = (p: Pt, color: string) =>
    flash > 0.03 && <circle cx={p.x} cy={p.y} r={r + 5 + flash * 7} fill="none" stroke={color} strokeOpacity={flash * 0.55} strokeWidth="3" />;

  return (
    <svg viewBox={vb} className="stage" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sahne planı">
      <defs>
        <radialGradient id="flash" cx="0.5" cy="0.55" r="0.55">
          <stop offset="0" stopColor="#ffb3d1" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffb3d1" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#eef0f6" strokeWidth="1" />
        </pattern>
      </defs>

      <text x={STAGE.cx} y={compact ? 16 : 12} textAnchor="middle" className={compact ? "audience small" : "audience"}>
        SAHNE ARKASI
      </text>
      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="#fff" stroke="#e3e7f0" />
      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="url(#grid)" />
      <line x1={STAGE.cx} y1="44" x2={STAGE.cx} y2="586" stroke="#dde2ee" strokeDasharray="4 6" />
      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="url(#flash)" opacity={flash * 0.7} />

      <g transform={compact ? "translate(0 120) scale(1 0.8)" : undefined}>
        <Audience x0={box.x + 14} x1={box.x + box.w - 14} />
      </g>
      <text x={STAGE.cx} y={compact ? 650 : 662} textAnchor="middle" className="audience on-crowd">
        SEYİRCİ
      </text>

      {cueLabel && (
        <text x={box.x + 28} y="76" className="cue-label" opacity={cueLabel.alpha}>
          cucu {cueLabel.n}
        </text>
      )}

      {/* Kol kola bağlantı */}
      {hook > 0.01 &&
        COUPLES.map(({ id }) => (
          <line key={id} x1={pos[id].F.x} y1={pos[id].F.y} x2={pos[id].L.x} y2={pos[id].L.y} stroke="#a78bfa" strokeWidth={2 * R + 14} strokeLinecap="round" opacity={hook * 0.35} />
        ))}

      {/* L'lerin el ele çemberi */}
      {ring > 0.01 && (
        <polygon
          points={RING_ORDER.map((id) => `${pos[id].L.x},${pos[id].L.y}`).join(" ")}
          fill="none"
          stroke={BLUE}
          strokeOpacity={ring * 0.45}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      )}

      {/* Leader'lar */}
      {COUPLES.map(({ id }) => {
        const p = pos[id].L;
        const toC = Math.atan2(RING_C.y - p.y, RING_C.x - p.x);
        return (
          <g key={id}>
            {arms(p)}
            {flashRing(p, BLUE)}
            {point && <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={BLUE} strokeOpacity={manBlink * 0.6} strokeWidth="3" />}
            <circle cx={p.x} cy={p.y} r={r} fill={BLUE} stroke="#fff" strokeWidth="2.5" />
            <text x={p.x} y={p.y + 5.5} textAnchor="middle" className="letter">
              L
            </text>
            {ring > 0.5 && (
              <circle cx={p.x + Math.cos(toC) * (r + 6)} cy={p.y + Math.sin(toC) * (r + 6)} r="3" fill={BLUE} opacity={(ring - 0.5) * 2} />
            )}
            {point && <circle cx={p.x + footDir * 11} cy={p.y + r + 8} r="3.5" fill={BLUE} opacity={manBlink} />}
          </g>
        );
      })}

      {/* Follower'lar (kaldırılınca büyür ve gölge düşer) */}
      {COUPLES.map(({ id }) => {
        const p = pos[id].F;
        const rf = r * (1 + 0.32 * lift);
        const blink = id === "orta" ? frontBlink : 0;
        return (
          <g key={id}>
            {lift > 0.01 && <ellipse cx={p.x + 4} cy={p.y + 10} rx={rf} ry={rf * 0.6} fill="#111827" opacity={lift * 0.15} />}
            {arms(p)}
            {flashRing(p, PINK)}
            {blink > 0 && (
              <circle cx={p.x} cy={p.y} r={rf + 6 + blink * 6} fill="none" stroke={PINK} strokeOpacity={blink} strokeWidth="4" />
            )}
            <circle cx={p.x} cy={p.y} r={rf * (1 + 0.15 * blink)} fill={PINK} stroke="#fff" strokeWidth="2.5" />
            <text x={p.x} y={p.y + 5.5} textAnchor="middle" className="letter">
              F
            </text>
          </g>
        );
      })}

      {/* Pozisyon isimleri */}
      {COUPLES.map(({ id }) => {
        const { F, L } = pos[id];
        const u = Math.min(1, Math.abs(F.y - L.y) / 38);
        const below = { x: (F.x + L.x) / 2, y: (F.y + L.y) / 2 + 38 };
        const side = { x: Math.max(F.x, L.x) + 44, y: (F.y + L.y) / 2 + 4 };
        const pl = { x: below.x + (side.x - below.x) * u, y: below.y + (side.y - below.y) * u };
        const out = { x: RING_C.x + (L.x - RING_C.x) * 1.42, y: RING_C.y + (L.y - RING_C.y) * 1.42 + 4 };
        return (
          <g key={id} className="name">
            {pairLabels > 0.01 && (
              <text x={pl.x} y={pl.y} textAnchor={u > 0.5 ? "start" : "middle"} opacity={pairLabels}>
                {NAMES[id]}
              </text>
            )}
            {ring > 0.01 && (
              <text x={out.x} y={out.y} textAnchor="middle" opacity={ring}>
                {NAMES[id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
