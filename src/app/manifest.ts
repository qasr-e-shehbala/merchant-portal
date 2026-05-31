import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qasar-e-Shehbala — Merchant Portal",
    short_name: "Qasar Admin",
    description: "Back-office portal for Qasar-e-Shehbala.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f2e9",
    theme_color: "#B5532A",
    icons: [{ src: "/logos/q-s-logo.jpeg", sizes: "any", type: "image/jpeg" }],
  };
}
