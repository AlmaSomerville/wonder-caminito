const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wondercaminito.com";

export default function sitemap() {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/book`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/where-is-caminito-del-rey`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/affiliates`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
