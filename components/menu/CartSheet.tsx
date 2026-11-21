"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/config/site";
import { ITEM_BY_ID } from "@/data/menu";
import { plainInput, useCart } from "@/lib/cart";
import {
  buildWhatsAppUrl,
  computeTotals,
  lineOptions,
  lineTitle,
  money,
  type Mode,
} from "@/lib/order";
import { useShopStatus } from "./StatusChip";

const FORM_KEY = "fry-day-house-customer-v1";

export default function CartSheet({ onClose }: { onClose: () => void }) {
  const cart = useCart();
  const status = useShopStatus();
  const isOpen = status?.isOpen ?? true;

  const [mode, setMode] = useState<Mode>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [tried, setTried] = useState(false);
  const [formHydrated, setFormHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_KEY);
      if (raw) {
        const f = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore saved order details after browser hydration.
        setName(f.name ?? "");
        setPhone(f.phone ?? "");
        setAddress(f.address ?? "");
        setNotes(f.notes ?? "");
        if (f.mode === "pickup" || f.mode === "delivery") setMode(f.mode);
        else if (f.orderType) setMode(f.orderType === "Home delivery" ? "delivery" : "pickup");
        if (f.paymentMethod) setPaymentMethod(f.paymentMethod);
      }
    } catch {
      /* ignore */
    } finally {
      setFormHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!formHydrated) return;
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify({
        name,
        phone,
        address,
        notes,
        mode,
        orderType: mode === "delivery" ? "Home delivery" : "Takeaway",
        paymentMethod,
      }));
    } catch {
      /* ignore */
    }
  }, [name, phone, address, notes, mode, paymentMethod, formHydrated]);

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

  const t = computeTotals(cart.subtotal, mode);

  const upsell = useMemo(
    () =>
      SITE.upsellIds
        .filter((id) => ITEM_BY_ID[id] && cart.qtyForItem(id) === 0)
        .slice(0, 3),
    [cart]
  );

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const errors = {
    name: name.trim().length < 2,
    phone: !phoneOk,
    address: mode === "delivery" && address.trim().length < 6,
  };
  const formOk = !errors.name && !errors.phone && !errors.address;
  const canOrder = cart.count > 0 && !t.belowMinimum;

  const send = () => {
    setTried(true);
    if (!canOrder || !formOk) return;
    const url = buildWhatsAppUrl({
      lines: cart.lines,
      mode,
      customer: { name, phone, address, notes, paymentMethod },
      subtotal: cart.subtotal,
      isOpen,
    });
    window.open(url, "_blank", "noopener");
  };

  const progress = Math.min(100, (cart.subtotal / SITE.freeDeliveryAbove) * 100);
  const field =
    "w-full rounded-xl border bg-black/40 p-3 text-sm text-[#FFF4DC] placeholder:text-[#FFF4DC]/40";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Your cart">
      <button aria-label="Close cart" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#FF6A00]/40 bg-[#101010] p-5 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-[#F5B800]">Your order</h2>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] text-2xl text-[#FFF4DC]/70">
            ×
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <p className="py-10 text-center text-[#FFF4DC]/60">
            Your cart is empty. Bhook lagi? Add something tasty!
          </p>
        ) : (
          <>
            <ul className="mb-4 divide-y divide-white/10">
              {cart.lines.map((l) => {
                const opts = lineOptions(l);
                return (
                  <li key={l.key} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#FFF4DC]">{lineTitle(l)}</p>
                      {opts.length > 0 && (
                        <p className="text-xs text-[#FFF4DC]/55">{opts.join(" · ")}</p>
                      )}
                      <p className="mt-1 text-sm font-bold text-[#F5B800]">
                        {money(l.unitPrice * l.qty)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center rounded-xl border border-[#F5B800]/50">
                      <button
                        aria-label={`Decrease ${lineTitle(l)}`}
                        onClick={() => cart.setQty(l.key, l.qty - 1)}
                        className="min-h-[44px] min-w-[44px] text-xl font-bold text-[#F5B800]"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm font-extrabold text-[#FFF4DC]">
                        {l.qty}
                      </span>
                      <button
                        aria-label={`Increase ${lineTitle(l)}`}
                        onClick={() => cart.setQty(l.key, l.qty + 1)}
                        className="min-h-[44px] min-w-[44px] text-xl font-bold text-[#F5B800]"
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {upsell.length > 0 && (
              <section className="mb-4 rounded-2xl border border-[#F5B800]/30 bg-[#F5B800]/5 p-3">
                <h3 className="mb-2 text-sm font-bold text-[#F5B800]">Complete your order</h3>
                <div className="flex flex-wrap gap-2">
                  {upsell.map((id) => {
                    const it = ITEM_BY_ID[id];
                    const price = Array.isArray(it.price) ? it.price[0] : it.price;
                    return (
                      <button
                        key={id}
                        onClick={() => cart.add(plainInput(it, 0), 1)}
                        className="min-h-[44px] rounded-full border border-[#F5B800]/60 px-4 text-sm font-semibold text-[#FFF4DC] active:scale-95"
                      >
                        + {it.name}
                        {Array.isArray(it.price) && it.sizeLabels ? ` (${it.sizeLabels[0]})` : ""} ·{" "}
                        {money(price)}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-black/40 p-1" role="radiogroup" aria-label="Order type">
              {(["delivery", "pickup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`min-h-[44px] rounded-xl text-sm font-extrabold ${
                    mode === m ? "bg-[#FF6A00] text-black" : "text-[#FFF4DC]/70"
                  }`}
                >
                  {m === "delivery" ? "🛵 Delivery" : "🛍️ Pickup"}
                </button>
              ))}
            </div>

            {mode === "delivery" && (
              <div className="mb-4">
                <p className="mb-1 text-xs text-[#FFF4DC]/70">
                  {t.toFreeDelivery > 0
                    ? `Add ${money(t.toFreeDelivery)} more for free delivery`
                    : "You got free delivery! 🎉"}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-[#F5B800] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                aria-invalid={tried && errors.name}
                className={`${field} ${tried && errors.name ? "border-[#E63B2E]" : "border-white/15"}`}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (03xx-xxxxxxx)"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={tried && errors.phone}
                className={`${field} ${tried && errors.phone ? "border-[#E63B2E]" : "border-white/15"}`}
              />
              {mode === "delivery" && (
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full delivery address"
                  rows={2}
                  autoComplete="street-address"
                  aria-invalid={tried && errors.address}
                  className={`${field} ${tried && errors.address ? "border-[#E63B2E]" : "border-white/15"}`}
                />
              )}
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes (optional)"
                className={`${field} border-white/15`}
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                aria-label="Payment preference"
                className={`${field} border-white/15`}
              >
                <option>Cash on Delivery</option>
                <option>JazzCash</option>
                <option>Easypaisa</option>
              </select>
            </div>

            <dl className="mb-3 space-y-1 text-sm text-[#FFF4DC]/80">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{money(cart.subtotal)}</dd>
              </div>
              {mode === "delivery" && (
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd>{t.deliveryFee === 0 ? "FREE" : money(t.deliveryFee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-extrabold text-[#F5B800]">
                <dt>Total</dt>
                <dd>{money(t.total)}</dd>
              </div>
            </dl>

            {t.belowMinimum && (
              <p className="mb-3 rounded-xl bg-[#E63B2E]/15 p-3 text-sm text-[#ff8a7e]" role="alert">
                Minimum order is {money(SITE.minimumOrder)}. Add {money(SITE.minimumOrder - cart.subtotal)} more to continue.
              </p>
            )}
            {tried && !formOk && (
              <p className="mb-3 text-sm text-[#ff8a7e]" role="alert">
                Please fill in the highlighted details.
              </p>
            )}
            {!isOpen && (
              <p className="mb-3 text-xs text-[#FFF4DC]/60">
                We are closed right now. Your order will be sent as a pre-order and we will confirm when we open.
              </p>
            )}

            <button
              onClick={send}
              disabled={!canOrder}
              className="min-h-[52px] w-full touch-manipulation rounded-2xl bg-[#25D366] text-base font-extrabold text-black disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
            >
              {isOpen ? "Order on WhatsApp" : "Order for later on WhatsApp"}
            </button>
            <p className="mt-2 text-center text-[11px] text-[#FFF4DC]/50">
              Cash on Delivery · JazzCash / Easypaisa accepted
            </p>
            <button
              onClick={() => {
                if (confirm("Clear your cart?")) cart.clear();
              }}
              className="mt-2 w-full min-h-[44px] text-xs text-[#FFF4DC]/50 underline"
            >
              Clear cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
