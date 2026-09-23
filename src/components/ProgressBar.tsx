export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div><div className="progress-label"><span>{label}</span><span>{Math.round(safe)}%</span></div><div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="progress-track"><div style={{ width: `${safe}%` }} /></div></div>;
}
