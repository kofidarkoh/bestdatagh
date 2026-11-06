import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://data4you.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}