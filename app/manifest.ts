import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kayeng English",
    short_name: "Kayeng",
    description: "Học tiếng Anh giao tiếp, phát âm, từ vựng và ngữ pháp theo lộ trình CEFR.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#183b35",
    categories: ["education", "productivity"],
    lang: "vi",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
