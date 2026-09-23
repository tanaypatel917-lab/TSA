import type { Metadata } from "next";

export const metadata: Metadata = { title: "My learning | Wordplay" };

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
