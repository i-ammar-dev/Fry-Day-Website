"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { basePrice, type MenuItem } from "@/data/menu";
import { useCart, type LineInput } from "@/lib/cart";
import { money } from "@/lib/order";

export default function CustomizeSheet({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const cart = useCart();
  const [spice, setSpice] = useState<string>(SITE.defaultSpice);
  const [extras, setExtras] = useState<string[]>([]);
  const [removals, setRemovals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const extrasTotal = extras.reduce(
    (s, id) => s + (SITE.extras.find((e) => e.id === id)?.price ?? 0),
    0
  );
  const unit = basePrice(item, null) + extrasTotal;

  const confirm = () => {
    const input: LineInput = {
      itemId: item.id,
      sizeIndex: null,
      spice,
      extras,
      removals,
      notes,
    };
    cart.add(input, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Customize ${item.name}`}>
      <button aria-label="Close" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[#FF6A00]/40 bg-[#101010] p-5 pb-6 sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[#F5B800]">{item.name}</h2>
            <p className="text-xs text-[#FFF4DC]/60">{item.description}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] text-2xl text-[#FFF4DC]/70">
            ×
          </button>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-bold text-[#FFF4DC]">Spice level</legend>
          <div className="flex gap-2">
            {SITE.spiceLevels.map((s) => (
              <button
                key={s}
                onClick={() => setSpice(s)}
                aria-pressed={spice === s}
                className={`min-h-[44px] flex-1 rounded-xl border text-sm font-bold ${
                  spice === s
                    ? "border-[#E63B2E] bg-[#E63B2E] text-white"
                    : "border-white/15 text-[#FFF4DC]/80"
                }`}
              >
                {s === "Hot" ? "🌶🌶 " : s === "Medium" ? "🌶 " : ""}
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-bold text-[#FFF4DC]">Extras</legend>
          {SITE.extras.map((e) => (
            <label
              key={e.id}
              className="mb-2 flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl border border-white/10 px-3"
            >
              <span className="flex items-center gap-3 text-sm text-[#FFF4DC]">
                <input
                  type="checkbox"
                  checked={extras.includes(e.id)}
                  onChange={() => setExtras(toggle(extras, e.id))}
                  className="h-5 w-5 accent-[#F5B800]"
                />
                {e.label}
              </span>
              <span className="text-sm font-bold text-[#F5B800]">+{money(e.price)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-bold text-[#FFF4DC]">Remove</legend>
          <div className="flex flex-wrap gap-2">
            {SITE.removals.map((r) => (
              <button
                key={r}
                onClick={() => setRemovals(toggle(removals, r))}
                aria-pressed={removals.includes(r)}
                className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold ${
                  removals.includes(r)
                    ? "border-[#F5B800] bg-[#F5B800]/15 text-[#F5B800]"
                    : "border-white/15 text-[#FFF4DC]/80"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-bold text-[#FFF4DC]">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={120}
            rows={2}
            placeholder="e.g. cut in half, extra crispy"
            className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm text-[#FFF4DC] placeholder:text-[#FFF4DC]/40"
          />
        </label>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/20">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="min-h-[48px] min-w-[44px] text-xl font-bold text-[#F5B800]"
            >
              −
            </button>
            <span className="min-w-8 text-center font-extrabold text-[#FFF4DC]">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty(Math.min(20, qty + 1))}
              className="min-h-[48px] min-w-[44px] text-xl font-bold text-[#F5B800]"
            >
              +
            </button>
          </div>
          <button
            onClick={confirm}
            className="min-h-[48px] flex-1 touch-manipulation rounded-xl bg-[#F5B800] text-base font-extrabold text-black active:scale-95"
          >
            Add to cart · {money(unit * qty)}
          </button>
        </div>
      </div>
    </div>
  );
}
