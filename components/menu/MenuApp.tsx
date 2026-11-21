"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, MENU, type CategoryId, type MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/order";
import CartSheet from "./CartSheet";
import CustomizeSheet from "./CustomizeSheet";
import ItemCard from "./ItemCard";

function MenuInner() {
  const cart = useCart();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CategoryId>("burgers");
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const cartOpen = cart.isCartOpen;
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? MENU.filter((m) => (m.name + " " + m.description + " " + (m.tags ?? []).join(" ")).toLowerCase().includes(q))
        : [],
    [q]
  );

  // highlight the tab of the section currently in view
  useEffect(() => {
    if (q) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.getAttribute("data-cat") as CategoryId);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [q]);

  const goTo = (id: CategoryId) => {
    setActive(id);
    window.requestAnimationFrame(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="menu-title" className="font-display text-3xl text-[#F5B800]">Our Menu</h2>
      </div>

      <div className="sticky top-[150px] z-30 -mx-4 border-b border-white/10 bg-[#0D0D0D]/95 px-4 py-3 backdrop-blur md:top-[108px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your craving..."
          aria-label="Search menu"
          className="mb-3 min-h-[44px] w-full rounded-xl border border-white/15 bg-black/50 px-4 text-sm text-[#FFF4DC] placeholder:text-[#FFF4DC]/40"
        />
        <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Menu categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setQuery("");
                goTo(c.id);
              }}
              aria-current={active === c.id && !q}
              className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-bold ${
                active === c.id && !q
                  ? "border-[#F5B800] bg-[#F5B800] text-black"
                  : "border-white/15 text-[#FFF4DC]/80"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </nav>
      </div>

      {q ? (
        <section className="mt-6" aria-live="polite">
          <p className="mb-3 text-sm text-[#FFF4DC]/60">
            {results.length} result{results.length === 1 ? "" : "s"} for &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => (
              <ItemCard key={m.id} item={m} onCustomize={setCustomizing} />
            ))}
          </div>
        </section>
      ) : (
        CATEGORIES.map((c) => (
          <section
            key={c.id}
            data-cat={c.id}
            ref={(el) => {
              sectionRefs.current[c.id] = el;
            }}
            className="scroll-mt-36 pt-8"
          >
            <h3 className="mb-4 font-display text-2xl text-[#FF6A00]">
              {c.emoji} {c.label}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MENU.filter((m) => m.category === c.id).map((m) => (
                <ItemCard key={m.id} item={m} onCustomize={setCustomizing} />
              ))}
            </div>
          </section>
        ))
      )}

      {cart.count > 0 && !cartOpen && (
        <button
          onClick={cart.openCart}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex min-h-[56px] max-w-lg touch-manipulation items-center justify-between rounded-2xl bg-[#F5B800] px-5 font-extrabold text-black shadow-[0_8px_30px_rgba(245,184,0,0.35)] active:scale-[0.98]"
        >
          <span>🛒 View cart · {cart.count} item{cart.count === 1 ? "" : "s"}</span>
          <span>{money(cart.subtotal)}</span>
        </button>
      )}

      {customizing && <CustomizeSheet item={customizing} onClose={() => setCustomizing(null)} />}
      {cartOpen && <CartSheet onClose={cart.closeCart} />}
    </div>
  );
}

export default function MenuApp() {
  return <MenuInner />;
}
