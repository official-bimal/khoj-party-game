import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/rules", "/library", "/online", "/custom"].map((route) => ({
    url: `${process.env.APP_ORIGIN || "http://localhost:3000"}${route}`,
    changeFrequency: "monthly",
    priority: route ? 0.6 : 1,
  }));
}
