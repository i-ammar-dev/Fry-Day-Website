import { SITE } from "@/config/site";
import { ITEM_BY_ID } from "@/data/menu";
import type { CartLine } from "./cart";
import { COMBOS } from "@/config/combos";

export type Mode = "delivery" | "pickup";

export function computeTotals(subtotal: number, mode: Mode) {
  const deliveryFee =
    mode === "delivery" && subtotal > 0 && subtotal < SITE.freeDeliveryAbove
      ? SITE.deliveryFee
      : 0;
  return {
    deliveryFee,
    total: subtotal + deliveryFee,
    belowMinimum: subtotal < SITE.minimumOrder,
    toFreeDelivery: Math.max(0, SITE.freeDeliveryAbove - subtotal),
  };
}

export const money = (n: number) => `${SITE.currency} ${n.toLocaleString("en-PK")}`;

export function lineTitle(l: CartLine): string {
  if (l.kind === "combo") return COMBOS.find((c) => c.id === l.comboId)?.name ?? "Combo";
  const item = ITEM_BY_ID[l.itemId];
  const size = item?.sizeLabels && l.sizeIndex !== null ? ` (${item.sizeLabels[l.sizeIndex]})` : "";
  return `${item?.name ?? l.itemId}${size}`;
}

export function lineOptions(l: CartLine): string[] {
  const out: string[] = [];
  if (l.kind === "combo") {
    for (const part of l.comboSelections ?? []) {
      const item = ITEM_BY_ID[part.itemId];
      const size = item?.sizeLabels && part.sizeIndex !== null ? ` (${item.sizeLabels[part.sizeIndex]})` : "";
      const details = [part.spice ? `${part.spice} spice` : "", ...part.extras.map((id) => SITE.extras.find((e) => e.id === id)?.label ?? id), ...part.removals, part.notes.trim() ? `Note: ${part.notes.trim()}` : ""].filter(Boolean);
      out.push(`${part.slotLabel}: ${item?.name ?? part.itemId}${size}${details.length ? ` [${details.join(", ")}]` : ""}`);
    }
    return out;
  }
  if (l.spice) out.push(`${l.spice} spice`);
  for (const id of l.extras) {
    const e = SITE.extras.find((x) => x.id === id);
    if (e) out.push(`+ ${e.label}`);
  }
  out.push(...l.removals);
  if (l.notes.trim()) out.push(`Note: ${l.notes.trim()}`);
  return out;
}

export type Customer = { name: string; phone: string; address: string; notes: string; paymentMethod?: string };

export function buildWhatsAppUrl(args: {
  lines: CartLine[];
  mode: Mode;
  customer: Customer;
  subtotal: number;
  isOpen: boolean;
}): string {
  const { lines, mode, customer, subtotal, isOpen } = args;
  const t = computeTotals(subtotal, mode);

  const rows = lines.map((l, i) => {
    const opts = lineOptions(l);
    const head = `${i + 1}. ${l.qty} x ${lineTitle(l)} = ${money(l.qty * l.unitPrice)}`;
    return opts.length ? `${head}\n   (${opts.join(", ")})` : head;
  });

  const msg = [
    `*New order, ${SITE.name}*`,
    isOpen ? "" : "_Pre-order (shop currently closed)_",
    `*${mode === "delivery" ? "Home Delivery" : "Pickup"}*`,
    "",
    ...rows,
    "",
    `Subtotal: ${money(subtotal)}`,
    mode === "delivery"
      ? `Delivery: ${t.deliveryFee === 0 ? "FREE" : money(t.deliveryFee)}`
      : "Delivery: not needed (pickup)",
    `*Total: ${money(t.total)}*`,
    `Payment preference: ${customer.paymentMethod || "Cash on Delivery / JazzCash / Easypaisa"}`,
    "",
    `Name: ${customer.name.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    mode === "delivery" ? `Address: ${customer.address.trim()}` : "",
    customer.notes.trim() ? `Notes: ${customer.notes.trim()}` : "",
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");

  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}
