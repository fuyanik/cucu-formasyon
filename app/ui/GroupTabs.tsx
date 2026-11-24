"use client";

import { memo } from "react";

const GROUPS = ["1.Grup", "2.Grup", "3.Grup", "4.Grup"];

/** Kayan seçicili grup sekmeleri. Müzik çalarken her karede yeniden çizilmesin diye ayrı ve memo'lu. */
function GroupTabs({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <div className="groups" role="tablist" aria-label="Grup seçimi">
      <span className="groups-thumb" style={{ transform: `translateX(${value * 100}%)` }} />
      {GROUPS.map((g, i) => (
        <button
          key={g}
          type="button"
          role="tab"
          aria-selected={value === i}
          className={value === i ? "on" : ""}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onChange(i)}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

export default memo(GroupTabs);
