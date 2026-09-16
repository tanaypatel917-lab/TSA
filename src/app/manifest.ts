import type { MetadataRoute } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Compass",
    short_name: "AI Compass",
    description: "An interactive AI learning portal for grades 9–12: fundamentals, tools and techniques, and responsible use, with XP, badges, and quizzes.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#6366f1",
    icons: [
      { src: `${basePath}/icons/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
