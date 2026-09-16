import type { SVGProps } from "react";

type ModuleId = "foundations" | "tools" | "ethics" | "real-world" | "capstone" | string;

export function ModuleGlyph({ moduleId, ...props }: { moduleId: ModuleId } & Omit<SVGProps<SVGSVGElement>, "children">) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.25, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const known = ["foundations", "tools", "ethics", "real-world", "capstone"].some((id) => moduleId.includes(id));
  return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
    {moduleId.includes("foundations") && <><circle cx="20" cy="20" r="13" {...common} /><circle cx="20" cy="20" r="2.5" fill="currentColor" /></>}
    {moduleId.includes("tools") && <><rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" {...common} /><rect x="14" y="14" width="12" height="12" {...common} /></>}
    {moduleId.includes("ethics") && <><circle cx="15" cy="20" r="9" {...common} /><circle cx="25" cy="20" r="9" {...common} /></>}
    {moduleId.includes("real-world") && <path d="m20 6 12 7v14l-12 7-12-7V13l12-7Z" {...common} />}
    {moduleId.includes("capstone") && <path d="m20 6 4.1 8.3 9.2 1.3-6.7 6.5 1.6 9.2-8.2-4.3-8.2 4.3 1.6-9.2-6.7-6.5 9.2-1.3L20 6Z" {...common} />}
    {!known && <><circle cx="20" cy="20" r="13" {...common} /><path d="M20 14v12M14 20h12" {...common} /></>}
  </svg>;
}
