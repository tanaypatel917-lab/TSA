export function LabFrame({ id, kicker = "Try it", title, children, note }: { id: string; kicker?: string; title: string; children: React.ReactNode; note?: React.ReactNode }) {
  return <figure className="lab" aria-labelledby={`${id}-title`}>
    <header className="lab-head"><p className="lab-kicker">{kicker}</p><h3 id={`${id}-title`}>{title}</h3></header>
    <div className="lab-body">{children}</div>
    {note && <figcaption className="lab-note">{note}</figcaption>}
  </figure>;
}
