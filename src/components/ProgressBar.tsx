export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div><div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink/55"><span>{label}</span><span>{Math.round(safe)}%</span></div><div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="h-0.5 bg-line"><div className="h-full bg-accent transition-[width]" style={{ width: `${safe}%` }} /></div></div>;
}
