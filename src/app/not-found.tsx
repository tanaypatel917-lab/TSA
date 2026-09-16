import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="shell py-16 sm:py-24">
      <div className="card mx-auto max-w-xl text-center">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Page not found</h1>
        <p className="mt-3 text-slate-600">
          Looks like this path drifted off the map. Head back to familiar territory and keep learning.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="button-primary">Back to the dashboard</Link>
          <Link href="/modules" className="button-secondary">Browse modules</Link>
        </div>
      </div>
    </div>
  );
}
