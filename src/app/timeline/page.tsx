import type { Metadata } from "next";
import { TimelinePage } from "./TimelinePage";
import "./timeline.css";

export const metadata: Metadata = { title: "Timeline" };

export default function Page() {
  return <TimelinePage />;
}
