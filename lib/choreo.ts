// Koreografi verisi: 5 çift, "3 önde 2 arkada" dizilimden 10 kişilik tek sıraya geçiş.
//
// Koordinatlar SEYİRCİ gözünden sahne planıdır (yukarıdan bakış, viewBox 800×660):
//   x: ekranın solu → sağı, y: küçük = sahnenin arkası, büyük = seyirciye yakın.
// İsimler DANSÇI gözündendir: dansçının sağı = seyircinin solu.
// Çiftte dansçı gözünden erkek (L) solda, kız (F) sağda → seyirci planında L +x, F -x.

export type CoupleId = "orta" | "sagOn" | "solOn" | "sagArka" | "solArka";
export type Role = "F" | "L";
export type Pt = { x: number; y: number };
export type DancerPos = Record<CoupleId, Record<Role, Pt>>;
export type Cues = { c1: number; c2: number; c3: number; k1: number; k2: number; turn: number };

export const COUPLES: { id: CoupleId; name: string }[] = [
  { id: "orta", name: "Orta" },
  { id: "sagOn", name: "Sağ Ön" },
  { id: "solOn", name: "Sol Ön" },
  { id: "sagArka", name: "Sağ Arka" },
  { id: "solArka", name: "Sol Arka" },
];

export const STAGE = { w: 800, h: 700, cx: 400 };
export const R = 17;
const HALF = 21; // çiftte iki dansçı arası yarım mesafe
const GAP = 38; // tek sırada iki dansçı arası
const FRONT = 440; // en öndeki dansçının y'si

type Centers = Record<CoupleId, Pt>;

/** Başlangıç: 3 çift önde, 2 çift arkada (öndekilerin aralarında). */
const C0: Centers = {
  orta: { x: 400, y: FRONT },
  sagOn: { x: 200, y: FRONT },
  solOn: { x: 600, y: FRONT },
  sagArka: { x: 300, y: 340 },
  solArka: { x: 500, y: 340 },
};

/** Tek sıra: her çiftte F önde, L arkasında. Sıra: Orta, Sağ Ön, Sol Ön, Sağ Arka, Sol Arka. */
const LINE_ORDER: CoupleId[] = ["orta", "sagOn", "solOn", "sagArka", "solArka"];
export const P2: DancerPos = Object.fromEntries(
  LINE_ORDER.map((id, i) => [
    id,
    {
      F: { x: STAGE.cx, y: FRONT - GAP * (2 * i) },
      L: { x: STAGE.cx, y: FRONT - GAP * (2 * i + 1) },
    },
  ]),
) as DancerPos;

const lineCenter = (id: CoupleId): Pt => ({ x: STAGE.cx, y: (P2[id].F.y + P2[id].L.y) / 2 });

/** 1. yürüyüş sonrası: öndeki yanlar büyük, arkadakiler küçük adımla ortaya yaklaşmış (hâlâ çift olarak). */
const STEP1: Record<CoupleId, number> = { orta: 0, sagOn: 0.55, solOn: 0.55, sagArka: 0.3, solArka: 0.3 };
const C1: Centers = Object.fromEntries(
  COUPLES.map(({ id }) => {
    const a = C0[id];
    const b = lineCenter(id);
    const u = STEP1[id];
    return [id, { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }];
  }),
) as Centers;

const pairs = (c: Centers): DancerPos =>
  Object.fromEntries(
    COUPLES.map(({ id }) => [id, { F: { x: c[id].x - HALF, y: c[id].y }, L: { x: c[id].x + HALF, y: c[id].y } }]),
  ) as DancerPos;

export const P0 = pairs(C0);
export const P1 = pairs(C1);

/** salsa34_Vokalsiz8lik_LindoCucu.mp3 içinden ölçülen zamanlar (saniye). */
export const DEFAULT_CUES: Cues = { c1: 65.37, c2: 68.05, c3: 70.73, k1: 72.93, k2: 75.45, turn: 75.45 };
export const CUE_LABELS: Record<keyof Cues, string> = {
  c1: "1. cucu",
  c2: "2. cucu",
  c3: "3. cucu",
  k1: "Cucucucu başı",
  k2: "Cucucucu sonu",
  turn: "Kol kola dönüş",
};
/** Bir vuruş (190.5 BPM). "Cu-cu" iki vuruş sürer, bir sekizlik 8 vuruş. */
export const BEAT = 0.315;
export const CUCU = 2 * BEAT;
export const EIGHT = 8 * BEAT;

export const LOOP_START = 60;
export const LOOP_END = 90;
export const VIEW_START = 62;
export const VIEW_END = 91;

/** Sekizlik zamanları: dönüş 1, dönüş 2, yavaşça çembere geçiş, çember 2 sekizlik, indirme. */
export function marks(c: Cues) {
  const b = c.turn + EIGHT;
  const trans = c.turn + 2 * EIGHT;
  const circle = c.turn + 3 * EIGHT;
  const lower = c.turn + 5 * EIGHT;
  return { b, trans, circle, lower, end: lower + 4 * BEAT };
}

export type SegKind = "bekle" | "cucu" | "yuru" | "son" | "cucucu" | "don" | "gecis" | "cember" | "indir";
export type Segment = { from: number; to: number; kind: SegKind };

export function segments(c: Cues): Segment[] {
  const m = marks(c);
  return [
    { from: 0, to: c.c1, kind: "bekle" },
    { from: c.c1, to: c.c1 + CUCU, kind: "cucu" },
    { from: c.c1 + CUCU, to: c.c2, kind: "yuru" },
    { from: c.c2, to: c.c2 + CUCU, kind: "cucu" },
    { from: c.c2 + CUCU, to: c.c3, kind: "yuru" },
    { from: c.c3, to: c.k1, kind: "son" },
    { from: c.k1, to: c.k2, kind: "cucucu" },
    { from: c.k2, to: c.turn, kind: "bekle" },
    { from: c.turn, to: m.trans, kind: "don" },
    { from: m.trans, to: m.circle, kind: "gecis" },
    { from: m.circle, to: m.lower, kind: "cember" },
    { from: m.lower, to: m.end, kind: "indir" },
    { from: m.end, to: Infinity, kind: "bekle" },
  ];
}

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
export const ease = (u: number) => {
  const v = clamp01(u);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
const lerp = (a: Pt, b: Pt, u: number): Pt => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const polar = (c: Pt, r: number, a: number): Pt => ({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
const DEG = Math.PI / 180;

function blend(a: DancerPos, b: DancerPos, u: number): DancerPos {
  const out = {} as DancerPos;
  for (const { id } of COUPLES) out[id] = { F: lerp(a[id].F, b[id].F, u), L: lerp(a[id].L, b[id].L, u) };
  return out;
}

// --- Çember: L'ler el ele, yüzleri içe; her F iki L'nin elleri arasında oturur. ---
export const RING_C: Pt = { x: STAGE.cx, y: 280 };
const RING_L = 115;
const RING_F = 100;
/** L açıları (ekran koordinatı, 90° = seyirciye doğru). Sağlar ekranın solunda. */
const RING_ANGLE: Record<CoupleId, number> = { solOn: 18, orta: 90, sagOn: 162, sagArka: 234, solArka: 306 };
/** Çemberde el ele sırası. */
export const RING_ORDER: CoupleId[] = ["solOn", "orta", "sagOn", "sagArka", "solArka"];

function ringPos(rot: number): DancerPos {
  const out = {} as DancerPos;
  for (const { id } of COUPLES) {
    const a = RING_ANGLE[id] * DEG + rot;
    out[id] = { L: polar(RING_C, RING_L, a), F: polar(RING_C, RING_F, a + 36 * DEG) };
  }
  return out;
}

/** Kol kola dönüş: her çift kendi ortası etrafında döner (F başta önde). */
function hookPos(angle: number): DancerPos {
  const out = {} as DancerPos;
  for (const { id } of COUPLES) {
    const c = lerp(P2[id].F, P2[id].L, 0.5);
    const r = Math.abs(P2[id].F.y - P2[id].L.y) / 2;
    const a = 90 * DEG + angle;
    out[id] = { F: polar(c, r, a), L: polar(c, r, a + Math.PI) };
  }
  return out;
}

export type Frame = {
  pos: DancerPos;
  /** 0..1 cucu parlaması (her "cu" hecesinde). */
  flash: number;
  /** Cucu hareketi sırasında yerinde zıplama ölçeği (1 = normal). */
  bounce: number;
  cueLabel: { n: number; alpha: number } | null;
  /** 0..1 eller yukarı. */
  armsUp: number;
  /** 1. yürüyüşte erkeklerin sağ–sol point'i. */
  point: { side: "sag" | "sol"; blink: number } | null;
  /** Cucucucu'da sadece en öndeki F yanıp söner (0..1). */
  frontBlink: number;
  /** 0..1 kol kola bağlantı çizgisi. */
  hook: number;
  /** 0..1 L'lerin el ele çemberi. */
  ring: number;
  /** 0..1 kızların kaldırılması. */
  lift: number;
};

export function frameAt(t: number, c: Cues): Frame {
  const w1 = c.c1 + CUCU;
  const w2 = c.c2 + CUCU;
  const m = marks(c);

  let pos: DancerPos;
  let hook = 0;
  let ring = 0;
  let lift = 0;
  if (t < w1) pos = P0;
  else if (t < c.c2) pos = blend(P0, P1, ease((t - w1) / Math.max(0.1, c.c2 - w1)));
  else if (t < w2) pos = P1;
  else if (t < c.c3) pos = blend(P1, P2, ease((t - w2) / Math.max(0.1, c.c3 - w2)));
  else if (t < c.turn) pos = P2;
  else if (t < m.b) {
    // 1. sekizlik: kol kola bir yöne tam tur.
    const u = (t - c.turn) / EIGHT;
    pos = hookPos(2 * Math.PI * ease(u));
    hook = Math.min(1, u * 4);
  } else if (t < m.trans) {
    // 2. sekizlik: kollar değişir, ters yöne tam tur.
    pos = hookPos(-2 * Math.PI * ease((t - m.b) / EIGHT));
    hook = 1;
  } else if (t < m.circle) {
    // 3. sekizlik: yavaşça çembere geçiş.
    const u = (t - m.trans) / EIGHT;
    const w = ease(u);
    pos = blend(hookPos(0), ringPos(0), w);
    hook = 1 - w;
    ring = ease((u - 0.5) * 2);
  } else {
    // Çember: 2 sekizlikte bir tam tur; kızlar oturur, kaldırılır, sonra indirilir.
    const rot = 2 * Math.PI * ease((t - m.circle) / (m.lower - m.circle));
    pos = ringPos(rot);
    ring = 1;
    lift = ease((t - m.circle - CUCU) / CUCU) * (1 - ease((t - m.lower) / (m.end - m.lower)));
  }

  const cueTimes = [c.c1, c.c2, c.c3];
  let flash = 0;
  let bounce = 1;
  let cueLabel: Frame["cueLabel"] = null;
  cueTimes.forEach((x, i) => {
    const d = t - x;
    for (const e of [0, BEAT]) {
      const de = d - e;
      if (de >= 0 && de < 0.8) flash = Math.max(flash, Math.exp(-de / 0.18));
    }
    if (d >= 0 && d < CUCU) bounce = 1 + 0.16 * Math.abs(Math.sin((Math.PI * d) / BEAT));
    if (d >= 0 && d < 1.2) cueLabel = { n: i + 1, alpha: 1 - d / 1.2 };
  });

  let point: Frame["point"] = null;
  if (t >= w1 && t < c.c2) {
    const k = (t - w1) / (2 * BEAT);
    point = { side: Math.floor(k) % 2 === 0 ? "sag" : "sol", blink: 1 - (k - Math.floor(k)) };
  }

  let frontBlink = 0;
  if (t >= c.k1 && t < c.k2) {
    const k = (t - c.k1) / BEAT;
    frontBlink = 1 - (k - Math.floor(k));
  }

  const armsUp = ease((t - c.c3) / (2 * BEAT)) * (1 - ease((t - c.k1) / (2 * BEAT)));

  return { pos, flash, bounce, cueLabel, armsUp, point, frontBlink, hook, ring, lift };
}

export function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
