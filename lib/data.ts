import menuJson from "@/data/menu.json";
import siteJson from "@/data/site.json";
import dealsJson from "@/data/deals.json";
import contentJson from "@/data/content.json";
import type { MenuCategory } from "@/lib/types";

export const menuCategories = menuJson.categories as MenuCategory[];
export const siteConfig = siteJson;
export const deals = dealsJson;
export const pageContent = contentJson;

export const allMenuItems = menuCategories.flatMap((category) => category.items);

export function formatPrice(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function getMenuItem(itemId: string) {
  return allMenuItems.find((item) => item.id === itemId);
}
