export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mono-label mb-2 flex justify-between text-mute">
        <span>{label}</span><span className="tabular-nums">{Math.round(safe)}%</span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="h-2 border border-ink bg-transparent p-[1px]">
        <div className="h-full bg-signal transition-[width] duration-500" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
