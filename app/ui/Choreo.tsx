"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CUE_LABELS, DEFAULT_CUES, fmt, frameAt, LOOP_END, LOOP_START, marks, VIEW_END, VIEW_START, type Cues } from "@/lib/choreo";
import StageTop from "./StageTop";
import Timeline from "./Timeline";

const STORAGE_KEY = "cucu-formasyon-cues-v2";
const RATES = [0.93, 0.96, 1];
const GROUPS = ["1.Grup", "2.Grup", "3.Grup", "4.Grup"];
const CUE_KEYS = Object.keys(DEFAULT_CUES) as (keyof Cues)[];

export default function Choreo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(true);
  const [cues, setCues] = useState<Cues>(DEFAULT_CUES);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(false);
  const [group, setGroup] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width / Math.max(1, e.contentRect.height) < 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setCues({ ...DEFAULT_CUES, ...JSON.parse(s) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(cues));
  }, [cues, loaded]);

  // Müzikle senkron animasyon döngüsü.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        if (loop && !a.paused && a.currentTime >= LOOP_END && a.currentTime < LOOP_END + 1) a.currentTime = LOOP_START;
        setT(a.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const a = audioRef.current;
    if (a && a.readyState >= 1 && isFinite(a.duration)) setDuration(a.duration);
  }, []);

  const seek = useCallback((to: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, to);
    setT(a.currentTime);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      // Döngü açıkken ilk oynatmada doğrudan çalışılan bölüme git.
      if (loop && (a.currentTime < LOOP_START || a.currentTime > LOOP_END)) a.currentTime = LOOP_START;
      void a.play();
    } else a.pause();
  }, [loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement;
      if (["INPUT", "SELECT", "BUTTON"].includes(el.tagName)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const frame = frameAt(t, cues);
  const pct = (x: number) => `${((x - VIEW_START) / (VIEW_END - VIEW_START)) * 100}%`;

  return (
    <main className="page">
      <div className="groups" role="tablist" aria-label="Grup seçimi">
        <span className="groups-thumb" style={{ transform: `translateX(${group * 100}%)` }} />
        {GROUPS.map((g, i) => (
          <button key={g} role="tab" aria-selected={group === i} className={group === i ? "on" : ""} onClick={() => setGroup(i)}>
            {g}
          </button>
        ))}
      </div>

      <div className="stage-wrap" ref={wrapRef}>
        <StageTop frame={frame} compact={compact} />
      </div>

      <div className="player">
        <audio
          ref={audioRef}
          src="/muzik.mp3"
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        {settings && (
          <div className="settings">
            <div className="settings-title">Zamanlar</div>
            {CUE_KEYS.map((k) => (
              <div key={k} className="cue-row">
                <span>{CUE_LABELS[k]}</span>
                <input
                  type="number"
                  step={0.01}
                  value={cues[k]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (isFinite(v)) setCues((c) => ({ ...c, [k]: v }));
                  }}
                />
                <span className="muted">{fmt(cues[k])}</span>
                <button className="ghost" onClick={() => setCues((c) => ({ ...c, [k]: Math.round(t * 100) / 100 }))}>
                  Şu an
                </button>
              </div>
            ))}
            <button className="ghost" onClick={() => setCues(DEFAULT_CUES)}>
              Varsayılan
            </button>
          </div>
        )}

        <input
          className="seekbar"
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={t}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Şarkı konumu"
          style={{ ["--p" as string]: `${duration ? (t / duration) * 100 : 0}%` }}
        />

        <div className="player-row">
          <button className="play" onClick={toggle} aria-label={playing ? "Durdur" : "Oynat"}>
            {playing ? (
              <svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg>
            )}
          </button>

          <div className="tl">
            <div className="tl-marks">
              {[
                { at: cues.c1, s: "1" },
                { at: cues.c2, s: "2" },
                { at: cues.c3, s: "3" },
                { at: cues.k1, s: "4" },
                { at: cues.turn, s: "5" },
                { at: marks(cues).circle, s: "6" },
              ].map(({ at, s }) => (
                <span key={s} style={{ left: pct(at) }}>
                  {s}
                </span>
              ))}
            </div>
            <Timeline t={t} cues={cues} onSeek={seek} />
          </div>

          <div className="pills">
            <div className="seg">
              {RATES.map((r) => (
                <button key={r} className={rate === r ? "on" : ""} onClick={() => setRate(r)}>
                  {r}×
                </button>
              ))}
            </div>
            <button className={`pill ${loop ? "on" : ""}`} onClick={() => setLoop((l) => !l)} title="1:00–1:30 arası döngü">
              Döngü
            </button>
            <button className={`icon ${settings ? "on" : ""}`} onClick={() => setSettings((s) => !s)} aria-label="Ayarlar" title="Cucu zamanlarını ayarla">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
