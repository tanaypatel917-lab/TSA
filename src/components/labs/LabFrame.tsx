import type { ToolSourceKey } from "@/content/toolSources";
import { SourceLine } from "../SourceLine";
import { UnderTheHood } from "./UnderTheHood";

type LabFrameProps = {
  id: string;
  kicker?: string;
  title: string;
  children: React.ReactNode;
  note?: React.ReactNode;
  sources?: ToolSourceKey;
  hood?: { spec: string; content: React.ReactNode };
  onHoodOpenChange?: (open: boolean) => void;
};

export function LabFrame({ id, kicker = "Try it", title, children, note, sources, hood, onHoodOpenChange }: LabFrameProps) {
  return <figure className="lab" id={id} aria-labelledby={`${id}-title`}>
    <header className="lab-head"><p className="lab-kicker">{kicker}</p><h3 id={`${id}-title`}>{title}</h3></header>
    <div className="lab-body">{children}</div>
    {hood && <UnderTheHood id={`${id}-hood-panel`} spec={hood.spec} onOpenChange={onHoodOpenChange}>{hood.content}</UnderTheHood>}
    {(note || sources) && <figcaption className="lab-note">{note}{sources && <SourceLine tool={sources} />}</figcaption>}
  </figure>;
}
