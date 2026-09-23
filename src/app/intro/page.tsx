import type { Metadata } from "next";
import { IntroExperience } from "@/components/IntroExperience";
import "./intro.css";

export const metadata: Metadata = { title: "Interactive introduction | Wordplay", description: "A short scroll-driven introduction to asking better questions about AI." };

export default function IntroPage() {
  return <IntroExperience />;
}
