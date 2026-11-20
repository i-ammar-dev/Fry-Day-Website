export type MenuVariant = {
  id: string;
  label: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  description: string;
  variants?: MenuVariant[];
};

export type MenuCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  items: MenuItem[];
};

export type CartLine = {
  lineId: string;
  itemId: string;
  name: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
};
