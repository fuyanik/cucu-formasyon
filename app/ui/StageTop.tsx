import { COUPLES, R, STAGE, type Frame } from "@/lib/choreo";

const BLUE = "#2f6fe4";
const PINK = "#e85d9c";

export default function StageTop({ frame, compact }: { frame: Frame; compact: boolean }) {
  const { pos, flash, bounce, armsUp, point, cueLabel } = frame;
  const r = R * bounce;
  // Dar/dikey ekranlarda sahneyi daraltıp dansçıları büyüt.
  const box = compact ? { x: 146, w: 508 } : { x: 20, w: 760 };
  const vb = compact ? `${box.x - 6} 22 ${box.w + 12} 628` : `0 0 ${STAGE.w} ${STAGE.h}`;

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

      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="#fff" stroke="#e3e7f0" />
      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="url(#grid)" />
      <line x1={STAGE.cx} y1="44" x2={STAGE.cx} y2="586" stroke="#dde2ee" strokeDasharray="4 6" />
      <rect x={box.x} y="30" width={box.w} height="570" rx="22" fill="url(#flash)" opacity={flash * 0.7} />
      <text x={STAGE.cx} y="634" textAnchor="middle" className="audience">
        SEYİRCİ
      </text>

      {cueLabel && (
        <text x={box.x + 28} y="76" className="cue-label" opacity={cueLabel.alpha}>
          cucu {cueLabel.n}
        </text>
      )}

      {COUPLES.map(({ id, name }) => {
        const { F, L } = pos[id];
        // Çift yan yanayken isim altta, tek sırada sağda.
        const u = Math.min(1, Math.abs(F.y - L.y) / 38);
        const below = { x: (F.x + L.x) / 2, y: (F.y + L.y) / 2 + 38 };
        const side = { x: Math.max(F.x, L.x) + 44, y: (F.y + L.y) / 2 + 4 };
        const label = { x: below.x + (side.x - below.x) * u, y: below.y + (side.y - below.y) * u };
        const footDir = point ? (point.side === "sag" ? -1 : 1) : 0;
        const manBlink = point ? 0.3 + 0.7 * point.blink : 0;
        return (
          <g key={id}>
            {[
              { p: F, fill: PINK, letter: "F", man: false },
              { p: L, fill: BLUE, letter: "L", man: true },
            ].map(({ p, fill, letter, man }) => (
              <g key={letter}>
                {armsUp > 0 && (
                  <g opacity={armsUp} stroke="#f2a93b" strokeWidth="2.5" strokeLinecap="round">
                    <line x1={p.x - 20} y1={p.y} x2={p.x - 20 - 8 * armsUp} y2={p.y - 12 * armsUp} />
                    <line x1={p.x + 20} y1={p.y} x2={p.x + 20 + 8 * armsUp} y2={p.y - 12 * armsUp} />
                    <circle cx={p.x - 20 - 8 * armsUp} cy={p.y - 13 * armsUp} r="3.5" fill="#f2a93b" />
                    <circle cx={p.x + 20 + 8 * armsUp} cy={p.y - 13 * armsUp} r="3.5" fill="#f2a93b" />
                  </g>
                )}
                {flash > 0.03 && (
                  <circle cx={p.x} cy={p.y} r={r + 5 + flash * 7} fill="none" stroke={fill} strokeOpacity={flash * 0.55} strokeWidth="3" />
                )}
                {man && point && (
                  <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={BLUE} strokeOpacity={manBlink * 0.6} strokeWidth="3" />
                )}
                <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#fff" strokeWidth="2.5" />
                <text x={p.x} y={p.y + 5.5} textAnchor="middle" className="letter">
                  {letter}
                </text>
                {man && point && <circle cx={p.x + footDir * 11} cy={p.y + r + 8} r="3.5" fill={BLUE} opacity={manBlink} />}
              </g>
            ))}
            <text x={label.x} y={label.y} textAnchor={u > 0.5 ? "start" : "middle"} className="name">
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
