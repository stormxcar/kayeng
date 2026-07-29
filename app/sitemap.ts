import type { MetadataRoute } from "next";
import { courseCatalog } from "./learn/catalog";
import { libraryItems } from "./library/library-data";
import { topicCategories } from "./topics/topic-data";

const baseUrl = "https://kayeng-english.nguyenkhaa223.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/learn",
    "/practice",
    "/dictionary",
    "/grammar",
    "/pronunciation",
    "/topics",
    "/library",
    "/tests",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: path === "" ? "daily" as const : "weekly" as const,
      priority: path === "" ? 1 : .8,
    })),
    ...courseCatalog.map((course) => ({
      url: `${baseUrl}/learn/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: .8,
    })),
    ...topicCategories.map((topic) => ({
      url: `${baseUrl}/topics/${topic.slug}`,
      changeFrequency: "monthly" as const,
      priority: .7,
    })),
    ...libraryItems.map((item) => ({
      url: `${baseUrl}/library/${item.type}/${item.slug}`,
      changeFrequency: "monthly" as const,
      priority: .7,
    })),
  ];
}
