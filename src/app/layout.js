import "./globals.css";
import localFont from "next/font/local";

// Her two brand fonts, self-hosted (fast, no Google request — GDPR-friendly), subset for all 10 languages.
const sans = localFont({ src: "./fonts/jakarta.woff2", variable: "--font-sans", weight: "200 800", display: "swap" });
const display = localFont({ src: "./fonts/bodoni.woff2", variable: "--font-display", weight: "400 900", display: "swap" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wondercaminito.com";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Caminito del Rey Tickets & Guided Tours — Even for Tomorrow | Wonder",
    template: "%s | Wonder Caminito del Rey",
  },
  description:
    "Official Caminito del Rey guided tours with official local guides. First 9AM slot, max 10 people, €52 all inclusive — ticket, guide, shuttle, welcome pack. Tickets available even for tomorrow when the official site is sold out.",
  keywords: [
    "Caminito del Rey", "Caminito del Rey tickets", "Caminito del Rey tickets sold out",
    "Caminito del Rey guided tour", "Caminito del Rey tomorrow", "where is Caminito del Rey",
    "El Chorro", "Álora", "Málaga day trip", "Caminito del Rey entradas",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Wonder — Caminito del Rey",
    title: "Caminito del Rey guided tours — tickets even for tomorrow",
    description: "9AM first slot · max 10 people · €52 all inclusive · official local guide.",
    locale: "en_US",
    alternateLocale: ["es_ES", "de_DE", "fr_FR", "nl_NL", "pl_PL", "it_IT", "pt_PT", "sv_SE", "da_DK"],
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Caminito del Rey boardwalk in the misty Gaitanes gorge" }],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TouristTrip",
      name: "Caminito del Rey Official Guided Tour — First 9AM Slot",
      description:
        "Small-group (max 10) guided walk of the Caminito del Rey with an official local guide. Includes official entry ticket, shuttle bus and welcome pack.",
      touristType: ["Hikers", "Families", "Photographers"],
      itinerary: { "@type": "Place", name: "Caminito del Rey, El Chorro, Málaga, Spain" },
      offers: {
        "@type": "Offer",
        price: "52",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${SITE}/book`,
      },
      provider: {
        "@type": "LocalBusiness",
        name: "Wonder Caminito",
        areaServed: "Málaga, Andalucía, Spain",
        address: { "@type": "PostalAddress", addressLocality: "Álora", addressRegion: "Málaga", addressCountry: "ES" },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Where is the Caminito del Rey?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Caminito del Rey is in the Desfiladero de los Gaitanes gorge in Málaga province, southern Spain, between Álora, Ardales and El Chorro — about 60 km northwest of Málaga city.",
          },
        },
        {
          "@type": "Question",
          name: "Official Caminito del Rey tickets are sold out. Can I still go?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Guided tours have separate ticket allocations. Wonder has guided access with official entry included, often available even for the next day when the official website shows sold out.",
          },
        },
        {
          "@type": "Question",
          name: "Can I book the Caminito del Rey for tomorrow?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Usually yes — Wonder keeps next-day availability for its 9AM small-group guided tour. Book online in under a minute or ask on WhatsApp.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
