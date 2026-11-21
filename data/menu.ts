// Adapts the site's existing JSON menu to the richer menu/cart model from the integration bundle.
// Prices and descriptions remain sourced from data/menu.json.
import menuJson from "@/data/menu.json";

export type CategoryId =
  | "burgers"
  | "parathas"
  | "shawarmas"
  | "fries"
  | "platters"
  | "broast"
  | "sides";

export type MenuItem = {
  id: string;
  imageId: string;
  name: string;
  category: CategoryId;
  price: number | [number, number];
  sizeLabels?: [string, string];
  description: string;
  tags?: string[];
  customizable?: boolean;
};

type SourceCategory = (typeof menuJson.categories)[number];
type SourceItem = SourceCategory["items"][number];

const categoryIds: Record<string, CategoryId> = {
  burgers: "burgers",
  parathas: "parathas",
  shawarmas: "shawarmas",
  "finger-fries": "fries",
  platters: "platters",
  broast: "broast",
  sides: "sides",
};

const categoryEmojis: Record<CategoryId, string> = {
  burgers: "🍔",
  parathas: "🌯",
  shawarmas: "🥙",
  fries: "🍟",
  platters: "🍽️",
  broast: "🍗",
  sides: "🧀",
};

const imageIds: Record<string, string> = {
  "sada-shami": "sada-shami-burger",
  "anda-shami": "anda-shami-burger",
  "anda-shami-cheese": "anda-shami-cheese-burger",
  "double-anda-shami": "double-anda-shami-burger",
  "chicken-anda": "chicken-anda-burger",
  "chicken-cheese": "chicken-cheese-burger",
  zinger: "zinger-burger",
  "zinger-cheese": "zinger-cheese-burger",
  "zinger-tower-cheese": "zinger-tower-cheese-burger",
  mighty: "mighty-burger",
  "fully-loaded": "fully-loaded-burger",
  patty: "patty-burger",
  "patty-zinger": "patty-zinger-burger",
};

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] =
  menuJson.categories.map((category) => {
    const id = categoryIds[category.id];
    return { id, label: category.name, emoji: categoryEmojis[id] };
  });

function toMenuItem(category: SourceCategory, item: SourceItem): MenuItem {
  const id = categoryIds[category.id];
  const variants = item.variants;
  const sizeLabels = variants?.length === 2
    ? [variants[0].label, variants[1].label] as [string, string]
    : undefined;

  if (sizeLabels && (item.id === "wings" || item.id === "nuggets")) {
    sizeLabels[0] = "Small";
  }

  return {
    id: item.id,
    imageId: imageIds[item.id] ?? item.id,
    name: item.name,
    category: id,
    price: variants?.length === 2
      ? [variants[0].price, variants[1].price]
      : item.price,
    sizeLabels,
    description: item.description,
    tags: item.tags,
    customizable: ["burgers", "parathas", "shawarmas", "platters"].includes(id),
  };
}

export const MENU: MenuItem[] = menuJson.categories.flatMap((category) =>
  category.items.map((item) => toMenuItem(category, item)),
);

export const ITEM_BY_ID: Record<string, MenuItem> = Object.fromEntries(
  MENU.map((item) => [item.id, item]),
);

export function basePrice(item: MenuItem, sizeIndex: number | null): number {
  return Array.isArray(item.price) ? item.price[sizeIndex ?? 0] : item.price;
}
