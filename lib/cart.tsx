"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { SITE } from "@/config/site";
import { ITEM_BY_ID, basePrice, type MenuItem } from "@/data/menu";

export type CartLine = {
  key: string;
  itemId: string;
  sizeIndex: number | null;
  spice: string | null;
  extras: string[]; // extra ids
  removals: string[];
  notes: string;
  unitPrice: number;
  qty: number;
};

export type LineInput = Omit<CartLine, "key" | "qty" | "unitPrice">;

const STORAGE_KEY = "fry-day-house-cart-v1";

export function makeKey(l: LineInput): string {
  return [
    l.itemId,
    l.sizeIndex ?? "x",
    l.spice ?? "",
    [...l.extras].sort().join("+"),
    [...l.removals].sort().join("+"),
    l.notes.trim().toLowerCase(),
  ].join("|");
}

export function unitPriceFor(item: MenuItem, input: LineInput): number {
  const extras = input.extras.reduce(
    (sum, id) => sum + (SITE.extras.find((e) => e.id === id)?.price ?? 0),
    0
  );
  return basePrice(item, input.sizeIndex) + extras;
}

export function plainInput(item: MenuItem, sizeIndex: number | null): LineInput {
  return {
    itemId: item.id,
    sizeIndex: Array.isArray(item.price) ? sizeIndex ?? 0 : null,
    spice: null,
    extras: [],
    removals: [],
    notes: "",
  };
}

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "setQty"; key: string; qty: number }
  | { type: "removeOne"; itemId: string }
  | { type: "clear" };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const existing = state.find((l) => l.key === action.line.key);
      if (existing) {
        return state.map((l) =>
          l.key === action.line.key ? { ...l, qty: l.qty + action.line.qty } : l
        );
      }
      return [...state, action.line];
    }
    case "setQty":
      return action.qty <= 0
        ? state.filter((l) => l.key !== action.key)
        : state.map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l));
    case "removeOne": {
      // decrement the most recently added line of this item
      for (let i = state.length - 1; i >= 0; i--) {
        if (state[i].itemId === action.itemId) {
          const next = [...state];
          if (next[i].qty <= 1) next.splice(i, 1);
          else next[i] = { ...next[i], qty: next[i].qty - 1 };
          return next;
        }
      }
      return state;
    }
    case "clear":
      return [];
    default:
      return state;
  }
}

type CartApi = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (input: LineInput, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeOne: (itemId: string) => void;
  clear: () => void;
  qtyForItem: (itemId: string) => number;
  qtyForSize: (itemId: string, sizeIndex: number) => number;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  // restore after mount (avoids server/client mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<CartLine> & {
          lineId?: string;
          variantId?: string;
          variantLabel?: string;
          quantity?: number;
        }>;
        if (Array.isArray(parsed)) {
          const restored = parsed.flatMap((saved): CartLine[] => {
            const item = saved.itemId ? ITEM_BY_ID[saved.itemId] : undefined;
            if (!item) return [];

            // Keep carts saved by the previous website version usable after the upgrade.
            if (typeof saved.key !== "string") {
              const qty = Number(saved.quantity);
              if (!Number.isFinite(qty) || qty < 1) return [];
              const variantIndex = item.sizeLabels?.findIndex((label) =>
                label === saved.variantLabel || label.toLowerCase() === String(saved.variantId ?? "").toLowerCase(),
              ) ?? -1;
              const sizeIndex = Array.isArray(item.price)
                ? Math.max(0, variantIndex)
                : null;
              const input: LineInput = {
                itemId: item.id,
                sizeIndex,
                spice: null,
                extras: [],
                removals: [],
                notes: "",
              };
              return [{
                ...input,
                key: makeKey(input),
                unitPrice: Number.isFinite(saved.unitPrice) ? Number(saved.unitPrice) : unitPriceFor(item, input),
                qty,
              }];
            }

            const qty = Number(saved.qty);
            const sizeIndex = Array.isArray(item.price) && (saved.sizeIndex === 0 || saved.sizeIndex === 1)
              ? saved.sizeIndex
              : Array.isArray(item.price) ? 0 : null;
            const input: LineInput = {
              itemId: item.id,
              sizeIndex,
              spice: typeof saved.spice === "string" ? saved.spice : null,
              extras: Array.isArray(saved.extras) ? saved.extras.filter((value): value is string => typeof value === "string") : [],
              removals: Array.isArray(saved.removals) ? saved.removals.filter((value): value is string => typeof value === "string") : [],
              notes: typeof saved.notes === "string" ? saved.notes : "",
            };
            if (!Number.isFinite(qty) || qty < 1) return [];
            return [{
              ...input,
              key: makeKey(input),
              unitPrice: Number.isFinite(saved.unitPrice) ? Number(saved.unitPrice) : unitPriceFor(item, input),
              qty,
            }];
          });
          dispatch({ type: "hydrate", lines: restored });
        }
      }
    } catch {
      /* storage unavailable or corrupted, start empty */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Persistence must wait until the saved cart is restored.
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const add = useCallback((input: LineInput, qty = 1) => {
    const item = ITEM_BY_ID[input.itemId];
    if (!item) return;
    dispatch({
      type: "add",
      line: { ...input, key: makeKey(input), unitPrice: unitPriceFor(item, input), qty },
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "setQty", key, qty }), []);
  const removeOne = useCallback((itemId: string) => dispatch({ type: "removeOne", itemId }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartApi>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
    return {
      lines,
      ready,
      count,
      subtotal,
      isCartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      add,
      setQty,
      removeOne,
      clear,
      qtyForItem: (itemId) =>
        lines.filter((l) => l.itemId === itemId).reduce((n, l) => n + l.qty, 0),
      qtyForSize: (itemId, sizeIndex) =>
        lines
          .filter((l) => l.itemId === itemId && l.sizeIndex === sizeIndex)
          .reduce((n, l) => n + l.qty, 0),
    };
  }, [lines, ready, isCartOpen, add, setQty, removeOne, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
