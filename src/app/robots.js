const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wondercaminito.com";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/partner", "/api"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
