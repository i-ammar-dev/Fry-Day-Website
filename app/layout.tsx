import type { Metadata, Viewport } from "next";
import { Bangers, Inter } from "next/font/google";
import { siteConfig } from "@/lib/data";
import "./globals.css";

const displayFont = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frydayhouse.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fry-Day House | Fast Food in Bahawalpur",
    template: "%s | Fry-Day House",
  },
  description:
    "Craving zinger burgers, loaded fries, shawarmas and desi-fusion street food? Visit Fry-Day House at Trust Colony Food Chowk, Bahawalpur, or order on WhatsApp.",
  applicationName: "Fry-Day House",
  keywords: [
    "fast food in Bahawalpur",
    "Fry-Day House",
    "burgers in Bahawalpur",
    "zinger burger Bahawalpur",
    "shawarma Bahawalpur",
    "loaded fries Bahawalpur",
    "food delivery Bahawalpur",
    "Trust Colony Food Chowk",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Fry-Day House",
    title: "Fry-Day House | Big Bites. Bold Nights.",
    description:
      "Desi fusion, zinger crunch and loaded fries at Trust Colony Food Chowk, Bahawalpur. Order direct on WhatsApp.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Fry-Day House fast food in Bahawalpur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fry-Day House | Fast Food in Bahawalpur",
    description: "Big bites. Bold nights. Order your favourites on WhatsApp.",
    images: ["/og-image.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0D",
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Restaurant"],
  name: siteConfig.name,
  image: `${siteUrl}/og-image.svg`,
  url: siteUrl,
  telephone: "+923067279801",
  email: siteConfig.email,
  priceRange: "Rs. 50 - Rs. 480",
  servesCuisine: ["Pakistani", "Fast Food", "Burgers", "Shawarma", "Street Food"],
  acceptsReservations: false,
  menu: `${siteUrl}/#menu`,
  hasMenu: `${siteUrl}/#menu`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Trust Colony Food Chowk",
    addressLocality: "Bahawalpur",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  areaServed: {
    "@type": "City",
    name: "Bahawalpur",
  },
  sameAs: [siteConfig.socials.instagram, siteConfig.socials.tiktok, siteConfig.socials.facebook],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
