import type { Metadata } from "next";
import { WorldGame } from "@/components/world/WorldGame";
import "./play.css";

export const metadata: Metadata = { title: "Wordplay World | Wordplay", description: "Drive the Wordplay question mark around an island of ideas: collect AI words and pass station checks from every chapter." };

export default function PlayPage() {
  return <WorldGame />;
}
