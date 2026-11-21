export type ComboSlot = { label: string; itemIds: string[]; count: number };
export type Combo = { id: string; name: string; description: string; price: number; slots: ComboSlot[] };

// Keep prices and eligible items here so deals can be updated without editing UI.
export const COMBOS: Combo[] = [
  { id: "student-deal", name: "Student Deal", description: "Pick a burger and add small fries.", price: 199, slots: [
    { label: "Burger", itemIds: ["sada-shami", "anda-shami", "chicken-burger"], count: 1 },
    { label: "Small fries", itemIds: ["french-fries"], count: 1 },
  ] },
  { id: "zinger-combo", name: "Zinger Combo", description: "Zinger burger, small fries and a dip sauce.", price: 449, slots: [
    { label: "Burger", itemIds: ["zinger"], count: 1 },
    { label: "Small fries", itemIds: ["french-fries"], count: 1 },
    { label: "Dip sauce", itemIds: ["dip-sauce"], count: 1 },
  ] },
  { id: "shawarma-duo", name: "Shawarma Duo", description: "Choose two shawarmas to share.", price: 299, slots: [
    { label: "Shawarma", itemIds: ["chicken-shawarma", "chicken-cheese-shawarma", "chapli-kabab-shawarma", "zinger-shawarma", "zinger-cheese-shawarma", "kababish-shawarma", "kababish-cheese-shawarma"], count: 2 },
  ] },
  { id: "family-feast", name: "Family Feast", description: "Two zingers, loaded fries, wings and two dips.", price: 1199, slots: [
    { label: "Zinger burger", itemIds: ["zinger"], count: 2 },
    { label: "Loaded fries", itemIds: ["loaded-fries"], count: 1 },
    { label: "Small wings", itemIds: ["wings"], count: 1 },
    { label: "Dip sauce", itemIds: ["dip-sauce"], count: 2 },
  ] },
];
