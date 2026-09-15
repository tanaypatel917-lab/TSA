export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
        <span className="font-pixel uppercase tracking-wide">{label}</span><span className="font-pixel">{Math.round(safe)}%</span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
