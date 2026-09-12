import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Us Two — Couple App",
    short_name: "Us Two",
    description: "A gentle daily ritual for growing closer.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f5",
    theme_color: "#e11d48",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
