import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sign-in", "/sign-up"],
      disallow: ["/dashboard", "/history", "/trends", "/settings", "/log", "/api/"],
    },
    sitemap: "https://vitaliq.vercel.app/sitemap.xml",
  };
}
