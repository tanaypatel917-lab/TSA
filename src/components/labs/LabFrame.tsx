import type { ToolSourceKey } from "@/content/toolSources";
import { SourceLine } from "../SourceLine";

export function LabFrame({ id, kicker = "Try it", title, children, note, sources }: { id: string; kicker?: string; title: string; children: React.ReactNode; note?: React.ReactNode; sources?: ToolSourceKey }) {
  return <figure className="lab" aria-labelledby={`${id}-title`}>
    <header className="lab-head"><p className="lab-kicker">{kicker}</p><h3 id={`${id}-title`}>{title}</h3></header>
    <div className="lab-body">{children}</div>
    {(note || sources) && <figcaption className="lab-note">{note}{sources && <SourceLine tool={sources} />}</figcaption>}
  </figure>;
}
