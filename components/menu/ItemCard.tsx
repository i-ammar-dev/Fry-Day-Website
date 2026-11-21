"use client";

import { useState } from "react";
import { SITE } from "@/config/site";
import { basePrice, type MenuItem } from "@/data/menu";
import { plainInput, makeKey, useCart } from "@/lib/cart";
import { money } from "@/lib/order";
import FoodImage from "./FoodImage";

const TAG_STYLE: Record<string, string> = {
  spicy: "bg-[#E63B2E]/20 text-[#ff8a7e]",
  cheesy: "bg-[#F5B800]/20 text-[#F5B800]",
  desi: "bg-[#FF6A00]/20 text-[#ff9a4d]",
  "desi-fusion": "bg-[#FF6A00]/20 text-[#ff9a4d]",
  classic: "bg-white/10 text-[#FFF4DC]/75",
  popular: "bg-[#F5B800]/20 text-[#F5B800]",
  veg: "bg-green-500/15 text-green-300",
  veggie: "bg-green-500/15 text-green-300",
};

export default function ItemCard({
  item,
  onCustomize,
}: {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}) {
  const cart = useCart();
  const sized = Array.isArray(item.price);
  const [size, setSize] = useState(0);
  const [photoOpen, setPhotoOpen] = useState(false);

  const total = cart.qtyForItem(item.id);
  const selected = total > 0;
  const bestSeller = SITE.bestSellerIds.includes(item.id);

  const input = plainInput(item, sized ? size : null);
  const key = makeKey(input);
  const qtyHere = sized ? cart.qtyForSize(item.id, size) : total;

  const sizeSummary =
    sized && item.sizeLabels
      ? ([0, 1] as const)
          .map((i) => ({ i, q: cart.qtyForSize(item.id, i) }))
          .filter((x) => x.q > 0)
          .map((x) => `${item.sizeLabels![x.i]} x${x.q}`)
          .join(", ")
      : "";

  const addDirect = () => cart.add(input, 1);

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#141414] transition-all duration-300 ${
        selected
          ? "border-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.35)]"
          : "border-white/10"
      }`}
    >
      <div className="relative">
        <button type="button" onClick={() => setPhotoOpen(true)} className="block w-full text-left" aria-label={`Preview ${item.name} photo`}>
          <FoodImage id={item.imageId} name={item.name} category={item.category} />
        </button>
        {bestSeller && (
          <span className="absolute left-2 top-2 rounded-full bg-[#FF6A00] px-2 py-0.5 text-[11px] font-bold text-black">
            🔥 Best Seller
          </span>
        )}
        {selected && (
          <span
            key={total}
            aria-label={`${total} in cart`}
            className="pop absolute right-2 top-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#F5B800] px-2 text-sm font-extrabold text-black shadow-lg"
          >
            x{total}
          </span>
        )}
      </div>

      {photoOpen && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${item.name} preview`}>
          <button aria-label="Close preview" className="absolute inset-0 bg-black/80" onClick={() => setPhotoOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-[#FF6A00]/40 bg-[#101010] sm:rounded-3xl">
            <div className="relative"><FoodImage id={item.imageId} name={item.name} category={item.category} /></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-2xl text-[#F5B800]">{item.name}</h2><p className="mt-1 text-sm text-[#FFF4DC]/65">{item.description}</p></div><button onClick={() => setPhotoOpen(false)} aria-label="Close" className="min-h-[44px] min-w-[44px] text-2xl text-[#FFF4DC]/70">×</button></div>
              <p className="my-4 font-display text-xl text-[#F5B800]">{sized ? `from ${money(basePrice(item, 0))}` : money(basePrice(item, null))}</p>
              <button onClick={() => { setPhotoOpen(false); if (item.customizable) onCustomize(item); else addDirect(); }} className="min-h-[48px] w-full rounded-xl bg-[#F5B800] font-extrabold text-black">{item.customizable ? "Add or customize" : "Add to cart"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          {item.tags?.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TAG_STYLE[t] ?? "bg-white/10 text-[#FFF4DC]/75"}`}
            >
              {t === "spicy" ? "🌶 spicy" : t}
            </span>
          ))}
        </div>

        <h3 className="font-display text-lg leading-tight text-[#FFF4DC]">{item.name}</h3>
        <p className="text-xs leading-snug text-[#FFF4DC]/60">{item.description}</p>

        {sized && item.sizeLabels && (
          <div className="mt-1 flex gap-2" role="radiogroup" aria-label="Size">
            {item.sizeLabels.map((label, i) => (
              <button
                key={label}
                role="radio"
                aria-checked={size === i}
                onClick={() => setSize(i)}
                className={`min-h-[44px] flex-1 rounded-xl border text-xs font-bold ${
                  size === i
                    ? "border-[#F5B800] bg-[#F5B800] text-black"
                    : "border-white/15 text-[#FFF4DC]/80"
                }`}
              >
                {label} · {money((item.price as [number, number])[i])}
              </button>
            ))}
          </div>
        )}

        {sizeSummary && (
          <p className="text-xs font-semibold text-[#F5B800]">In cart: {sizeSummary}</p>
        )}
        {!sized && item.customizable && selected && (
          <p className="text-xs font-semibold text-[#F5B800]">
            In cart: {total} (tap Add for another style)
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-display text-xl text-[#F5B800]">
            {sized ? `from ${money(basePrice(item, 0))}` : money(basePrice(item, null))}
          </span>

          {item.customizable ? (
            <div className="flex items-center gap-2">
              {selected && (
                <button
                  aria-label={`Remove one ${item.name}`}
                  onClick={() => cart.removeOne(item.id)}
                  className="min-h-[44px] min-w-[44px] touch-manipulation rounded-xl border border-white/20 text-xl font-bold text-[#FFF4DC]"
                >
                  −
                </button>
              )}
              <button
                onClick={() => onCustomize(item)}
                className="min-h-[44px] touch-manipulation rounded-xl bg-[#F5B800] px-4 text-sm font-extrabold text-black active:scale-95"
              >
                Add +
              </button>
            </div>
          ) : qtyHere > 0 ? (
            <div className="flex items-center gap-1 rounded-xl border border-[#F5B800]/60 bg-black/40">
              <button
                aria-label={`Remove one ${item.name}`}
                onClick={() => cart.setQty(key, qtyHere - 1)}
                className="min-h-[44px] min-w-[44px] touch-manipulation text-xl font-bold text-[#F5B800]"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-extrabold text-[#FFF4DC]">
                {qtyHere}
              </span>
              <button
                aria-label={`Add one ${item.name}`}
                onClick={addDirect}
                className="min-h-[44px] min-w-[44px] touch-manipulation text-xl font-bold text-[#F5B800]"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={addDirect}
              className="min-h-[44px] touch-manipulation rounded-xl bg-[#F5B800] px-4 text-sm font-extrabold text-black active:scale-95"
            >
              Add +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
