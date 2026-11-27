import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/home",
    "/home/skills",
    "/home/projects",
    "/home/experience",
    "/home/contact",
    "/home/achievements",
  ];

  return routes.map((route) => ({
    url: route,
    changeFrequency: route === "/home/projects" ? "weekly" : "monthly",
    priority: route === "/" || route === "/home" ? 1.0 : 0.8,
  }));
}
