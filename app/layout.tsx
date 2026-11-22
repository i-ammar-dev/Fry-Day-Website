import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { siteConfig } from "@/lib/data";
import { CartProvider } from "@/lib/cart";
import "./globals.css";
import "@/styles/menu.css";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
    title: "Fry-Day House | Fast Food in Bahawalpur",
    description:
      "Looking for fast food in Bahawalpur? Get zinger burgers, loaded fries and desi-fusion street food at Trust Colony Food Chowk or order on WhatsApp.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Fry-Day House fast food in Bahawalpur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fry-Day House | Fast Food in Bahawalpur",
    description: "Fast food in Bahawalpur: zinger burgers, loaded fries and desi-fusion favourites. Order on WhatsApp.",
    images: ["/og-image.jpg"],
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
  image: `${siteUrl}/og-image.jpg`,
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
        <CartProvider>{children}</CartProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
