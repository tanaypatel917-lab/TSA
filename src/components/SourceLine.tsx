import Link from "next/link";
import { referenceById, referenceNumber } from "@/content/references";
import { toolSources, type ToolSourceKey } from "@/content/toolSources";

export function SourceLine({ tool, className = "" }: { tool: ToolSourceKey; className?: string }) {
  const sources = toolSources[tool].map((id) => referenceById(id)).filter((reference) => reference !== undefined);
  return <p className={`source-line ${className}`.trim()}>Sources: {sources.map((reference, index) => <span key={reference.id}>{index > 0 && ", "}<Link href={`/references#ref-${reference.id}`}>[{referenceNumber(reference.id)}] {reference.short}</Link></span>)}</p>;
}
