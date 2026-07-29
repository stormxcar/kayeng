import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/profile", "/history", "/api/"],
    },
    sitemap: "https://kayeng-english.nguyenkhaa223.chatgpt.site/sitemap.xml",
  };
}
