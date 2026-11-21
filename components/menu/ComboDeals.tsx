"use client";

import { useEffect, useState } from "react";
import { COMBOS, type Combo } from "@/config/combos";
import { ITEM_BY_ID } from "@/data/menu";
import { useCart, type ComboSelection } from "@/lib/cart";
import { money } from "@/lib/order";
import CustomizeSheet from "./CustomizeSheet";

const emptyPart = (slotLabel: string, itemId: string): ComboSelection => ({ itemId, slotLabel, sizeIndex: itemId === "french-fries" || itemId === "wings" ? 0 : null, spice: null, extras: [], removals: [], notes: "" });
const priceFor = (itemId: string, sizeIndex: number | null) => {
  const price = ITEM_BY_ID[itemId].price;
  return Array.isArray(price) ? price[sizeIndex ?? 0] : price;
};

function ComboBuilder({ combo, close }: { combo: Combo; close: () => void }) {
  const cart = useCart();
  const [parts, setParts] = useState<(ComboSelection | null)[]>(() => combo.slots.flatMap((slot) => Array.from({ length: slot.count }, () => null)));
  const [customIndex, setCustomIndex] = useState<number | null>(null);
  const [customItem, setCustomItem] = useState<(typeof ITEM_BY_ID)[string] | null>(null);
  const slotIndexes = combo.slots.flatMap((slot, si) => Array.from({ length: slot.count }, (_, n) => ({ slot, si, n })));
  const complete = parts.every(Boolean);
  const separate = parts.reduce((sum, part) => sum + (part ? priceFor(part.itemId, part.sizeIndex) : 0), 0);
  const choose = (i: number, id: string) => setParts((current) => current.map((part, index) => index === i ? emptyPart(slotIndexes[i].slot.label, id) : part));
  const add = () => {
    if (!complete) return;
    cart.addCombo(combo.id, parts as ComboSelection[]);
    close();
    cart.openCart();
  };
  return <div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Build ${combo.name}`}>
    <button className="absolute inset-0 bg-black/75" aria-label="Close combo builder" onClick={close} />
    <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#FF6A00]/40 bg-[#101010] p-5 sm:rounded-3xl">
      <div className="mb-4 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Build your own</p><h3 className="font-display text-2xl text-[#F5B800]">{combo.name}</h3><p className="text-sm text-[#FFF4DC]/60">Choose every item · {parts.filter(Boolean).length} of {parts.length} chosen</p></div><button onClick={close} aria-label="Close" className="min-h-[44px] min-w-[44px] text-2xl text-[#FFF4DC]/70">×</button></div>
      <div className="space-y-3">{slotIndexes.map(({ slot, n }, i) => {
        const part = parts[i]; const item = part ? ITEM_BY_ID[part.itemId] : null;
        return <div key={`${slot.label}-${i}`} className="rounded-xl border border-white/10 p-3"><label className="mb-2 block text-sm font-bold text-[#FFF4DC]">{slot.label} {slot.count > 1 ? `${n + 1}/${slot.count}` : ""}</label>
          <select value={part?.itemId ?? ""} onChange={(e) => choose(i, e.target.value)} className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#191919] px-3 text-sm text-[#FFF4DC]"><option value="">Choose {slot.label.toLowerCase()}</option>{slot.itemIds.map((id) => <option key={id} value={id}>{ITEM_BY_ID[id].name}</option>)}</select>
          {item?.customizable && <button onClick={() => { setCustomIndex(i); setCustomItem(item); }} className="mt-2 min-h-[40px] text-sm font-semibold text-[#F5B800]">Customize this item +</button>}
        </div>;
      })}</div>
      <div className="my-4 flex justify-between text-sm text-[#FFF4DC]/70"><span>Separate price {complete ? money(separate) : "when choices are complete"}</span><span>{complete ? `Save ${money(Math.max(0, separate - combo.price))}` : ""}</span></div>
      <button disabled={!complete} onClick={add} className="min-h-[50px] w-full rounded-xl bg-[#F5B800] font-extrabold text-black disabled:opacity-40">Add {combo.name} · {money(combo.price + parts.reduce((sum, p) => sum + (p?.extras.reduce((s, id) => s + (id === "extra-cheese" || id === "extra-dip" ? 50 : 0), 0) ?? 0), 0))}</button>
      {customItem && customIndex !== null && <CustomizeSheet item={customItem} onClose={() => { setCustomItem(null); setCustomIndex(null); }} initialQuantity={1} onConfirm={(input) => { setParts((current) => current.map((p, i) => i === customIndex ? { ...input, slotLabel: slotIndexes[i].slot.label } : p)); setCustomItem(null); setCustomIndex(null); }} />}
    </div>
  </div>;
}

export default function ComboDeals({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const cart = useCart();
  const [building, setBuilding] = useState<Combo | null>(null);
  useEffect(() => {
    for (const combo of COMBOS) {
      const cheapest = combo.slots.reduce((sum, slot) => {
        const prices = slot.itemIds.map((id) => { const p = ITEM_BY_ID[id].price; return Array.isArray(p) ? p[0] : p; });
        return sum + Math.min(...prices) * slot.count;
      }, 0);
      if (combo.price > cheapest) console.warn(`Combo ${combo.name} costs more than its cheapest separate parts.`);
    }
  }, []);
  return <div className="container"><div className="deals-header"><div className="section-heading"><span className="eyebrow"><span />{eyebrow}</span><h2 id="deals-title">{title.toUpperCase()}</h2><p>{description}</p></div><div className="deal-stamp" aria-hidden="true"><span>GOOD</span><strong>FOOD</strong><span>GOOD MOOD</span></div></div>
    <div className="deals-grid">{COMBOS.map((combo, i) => <article className="deal-card" key={combo.id}><div className="deal-card__top"><span className="deal-number">0{i + 1}</span><span className="deal-label">BUILD IT</span></div><div className="deal-card__illustration" aria-hidden="true">{["🎓", "🍗", "🌯", "🍟"][i]}</div><h3>{combo.name} <span className="ml-2 text-sm text-[#F5B800]">×{cart.qtyForCombo(combo.id) || ""}</span></h3><p>{combo.description}</p><div className="deal-card__bottom"><strong>{money(combo.price)}</strong><button type="button" onClick={() => setBuilding(combo)}>Build your own <span>＋</span></button></div></article>)}</div>
    {building && <ComboBuilder combo={building} close={() => setBuilding(null)} />}
  </div>;
}
