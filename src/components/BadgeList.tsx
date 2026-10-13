"use client";
import { modules } from "@/content";
import { badgeProgress, type BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

const tones = ["clay", "sky", "ink"] as const;

const kindOf = (id: string) => id === "ai-ally" ? "legend" : id.startsWith("module-") ? "chapter" : id.startsWith("world-") || id === "word-collector" ? "world" : id === "first-steps" || id.startsWith("streak-") ? "habit" : "skill";

const tilt = (event: React.PointerEvent<HTMLLIElement>) => {
  const box = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  event.currentTarget.style.setProperty("--tx", `${(x - 0.5) * 16}deg`);
  event.currentTarget.style.setProperty("--ty", `${(0.5 - ((event.clientY - box.top) / box.height)) * 12}deg`);
  event.currentTarget.style.setProperty("--gx", x.toFixed(3));
};
const untilt = (event: React.PointerEvent<HTMLLIElement>) => {
  event.currentTarget.style.setProperty("--tx", "0deg");
  event.currentTarget.style.setProperty("--ty", "0deg");
};

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state, hydrated } = useProgress();
  const earned = (id: string) => hydrated && state.badges.includes(id);
  const count = badges.filter((badge) => earned(badge.id)).length;
  const progress = new Map(badges.map((badge) => [badge.id, badgeProgress(badge.id, state, modules)]));
  const closest = hydrated ? badges.filter((badge) => !earned(badge.id) && (progress.get(badge.id)?.value ?? 0) > 0).sort((a, b) => (progress.get(b.id)?.value ?? 0) - (progress.get(a.id)?.value ?? 0))[0]?.id : undefined;
  const total = String(badges.length).padStart(2, "0");
  return <><p className="badge-summary"><strong>{hydrated ? count : "–"}</strong><span>{hydrated ? `of ${badges.length} badges earned on this device` : "Checking this device’s badges…"}</span></p><ul className="badge-grid">{badges.map((badge, index) => {
    const has = earned(badge.id);
    const meter = progress.get(badge.id);
    const kind = kindOf(badge.id);
    return <li key={badge.id} className="badge-patch" data-earned={has} data-kind={kind} data-tone={tones[index % tones.length]} data-closest={badge.id === closest} data-reveal={index % 4} style={{ "--value": hydrated && !has ? meter?.value ?? 0 : 0 } as React.CSSProperties} onPointerMove={tilt} onPointerLeave={untilt}>
      {badge.id === closest && <span className="badge-closest">Next up</span>}
      <div className="badge-card-top" aria-hidden="true"><span>{kind}</span><span>No. {String(index + 1).padStart(2, "0")}</span></div>
      <div className="badge-art" aria-hidden="true"><span className="badge-mark" data-mark={badge.mark}>{badge.mark}</span></div>
      <h2>{badge.name}</h2>
      <p>{badge.description}</p>
      {!has && hydrated && meter?.label && <div className="badge-progress"><span className="badge-meter" aria-hidden="true" /><span>{meter.label}</span></div>}
      <div className="badge-card-foot"><span className="badge-state">{has ? "Earned" : "Locked"}</span><span className="badge-card-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}/{total}</span></div>
    </li>;
  })}</ul></>;
}
