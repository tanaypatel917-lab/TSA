import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="shell py-32">
      <p className="eyebrow"><span className="mr-3 text-accent">404</span> Off the map</p>
      <h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">This path<br /><em>drifted away.</em></h1>
      <p className="mt-10 max-w-prose text-lg leading-relaxed text-ink/75">Head back to familiar territory and keep learning.</p>
      <div className="mt-12 flex flex-wrap gap-5">
        <Link href="/" className="btn-pill">Back to the dashboard</Link>
        <Link href="/modules" className="btn-ghost">Browse modules ↗</Link>
      </div>
    </div>
  );
}
