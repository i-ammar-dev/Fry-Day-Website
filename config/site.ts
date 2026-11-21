// Ordering settings for the menu experience. Keep the existing menu prices in data/menu.json.
import siteJson from "@/data/site.json";

export const SITE = {
  name: siteJson.name,
  tagline: siteJson.tagline,
  whatsappNumber: siteJson.whatsappNumber,
  phoneDisplay: siteJson.phoneDisplay,
  address: siteJson.location,
  email: siteJson.email,

  currency: "Rs.",
  deliveryFee: 100,
  freeDeliveryAbove: 1500,
  minimumOrder: 500,

  hours: {
    open: "16:00",
    close: "02:00",
    timeZone: "Asia/Karachi",
  },

  spiceLevels: ["Mild", "Medium", "Hot"] as const,
  defaultSpice: "Medium",
  extras: [
    { id: "extra-cheese", label: "Extra Cheese", price: 50 },
    { id: "extra-dip", label: "Extra Dip Sauce", price: 50 },
  ],
  removals: ["No onion", "No salad", "No sauce"],
  upsellIds: ["french-fries", "dip-sauce", "cheese-slice"],
  bestSellerIds: siteJson.featuredItemIds,
} as const;

export type SiteConfig = typeof SITE;
