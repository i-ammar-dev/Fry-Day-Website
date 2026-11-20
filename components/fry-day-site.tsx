"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { allMenuItems, deals, formatPrice, menuCategories, pageContent, siteConfig } from "@/lib/data";
import type { CartLine, MenuItem, MenuVariant } from "@/lib/types";

type OrderType = "Home delivery" | "Takeaway" | "Dine-in";
type PaymentMethod = "Cash on Delivery" | "JazzCash" | "Easypaisa";

const CART_STORAGE_KEY = "fry-day-house-cart-v1";
const CUSTOMER_STORAGE_KEY = "fry-day-house-customer-v1";

function Logo() {
  return (
    <Link href="#home" className="brand-lockup" aria-label="Fry-Day House home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-chef">👨‍🍳</span>
        <span className="brand-wink">😉</span>
        <span className="brand-spatula" aria-hidden="true"><svg viewBox="0 0 24 34" width="15" height="22"><path d="M8 2h8v10c0 2.5-1.5 4-4 4s-4-1.5-4-4V2Z" fill="#fff4dc" stroke="#0d0d0d" strokeWidth="1.5"/><path d="M12 16v15" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/></svg></span>
      </span>
      <span className="brand-wordmark">
        <strong>FRY&apos;DAY</strong>
        <small>HOUSE</small>
      </span>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <span className="eyebrow"><span />{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function Price({ amount }: { amount: number }) {
  return <span className="price">{formatPrice(amount)}</span>;
}

function MenuTag({ tag }: { tag: string }) {
  const labels: Record<string, string> = {
    spicy: "Spicy",
    veg: "Veg",
    veggie: "Veg",
    "desi-fusion": "Desi Fusion",
    popular: "Fave",
    cheesy: "Cheesy",
    classic: "Classic",
  };
  return <span className={`menu-tag menu-tag--${tag}`}>{labels[tag] ?? tag}</span>;
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.4 11.7a8.35 8.35 0 0 1-12.35 7.34L3 20l.98-4.86A8.35 8.35 0 1 1 20.4 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 7.8c.2-.45.43-.46.7-.47h.48c.15 0 .35.06.48.36l.7 1.67c.08.2.08.35-.03.51l-.5.65c-.16.18-.16.35-.03.56.34.57.8 1.04 1.36 1.4.2.13.36.12.53-.06l.7-.81c.17-.2.34-.22.56-.13l1.57.74c.25.12.4.18.44.32.05.15.05.84-.37 1.36-.42.52-1.02.75-1.73.77-.7.02-1.64-.27-2.83-.97-1.57-.92-2.62-2.12-3.14-3.12-.53-1-.5-1.77-.27-2.37.23-.6.58-.99.98-1.1Z" fill="currentColor" />
    </svg>
  );
}

function MenuCard({
  item,
  selectedVariantId,
  onVariantChange,
  onAdd,
}: {
  item: MenuItem;
  selectedVariantId?: string;
  onVariantChange: (itemId: string, variantId: string) => void;
  onAdd: (item: MenuItem, variant?: MenuVariant) => void;
}) {
  const selectedVariant = item.variants?.find((variant) => variant.id === selectedVariantId) ?? item.variants?.[0];
  const itemPrice = selectedVariant?.price ?? item.price;

  return (
    <motion.article className="menu-card" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="menu-card__topline">
        <div className="menu-card__tags">
          {item.tags.slice(0, 2).map((tag) => <MenuTag key={tag} tag={tag} />)}
        </div>
        <span className="menu-card__spark" aria-hidden="true">✳</span>
      </div>
      <div className="menu-card__body">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
      </div>
      <div className="menu-card__bottom">
        <div className="menu-card__price-wrap">
          <Price amount={itemPrice} />
          {item.variants ? (
            <label className="variant-select-label">
              <span className="sr-only">Choose size for {item.name}</span>
              <select
                value={selectedVariant?.id ?? item.variants[0].id}
                onChange={(event) => onVariantChange(item.id, event.target.value)}
                aria-label={`Choose size for ${item.name}`}
              >
                {item.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>{variant.label} · {formatPrice(variant.price)}</option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <button className="add-button" type="button" onClick={() => onAdd(item, selectedVariant)} aria-label={`Add ${item.name} to cart`}>
          <span>Add</span><b>＋</b>
        </button>
      </div>
    </motion.article>
  );
}

export default function FryDaySite() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id ?? "burgers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [orderType, setOrderType] = useState<OrderType>("Home delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      const savedCustomer = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartLine[];
        if (Array.isArray(parsed)) setCart(parsed);
      }
      if (savedCustomer) {
        const details = JSON.parse(savedCustomer) as {
          name?: string; phone?: string; address?: string; notes?: string; orderType?: OrderType; paymentMethod?: PaymentMethod;
        };
        setCustomerName(details.name ?? "");
        setCustomerPhone(details.phone ?? "");
        setCustomerAddress(details.address ?? "");
        setOrderNotes(details.notes ?? "");
        if (details.orderType) setOrderType(details.orderType);
        if (details.paymentMethod) setPaymentMethod(details.paymentMethod);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      notes: orderNotes,
      orderType,
      paymentMethod,
    }));
  }, [cart, cartHydrated, customerName, customerPhone, customerAddress, orderNotes, orderType, paymentMethod]);

  const featuredItems = useMemo(
    () => siteConfig.featuredItemIds.map((id) => allMenuItems.find((item) => item.id === id)).filter((item): item is MenuItem => Boolean(item)),
    [],
  );

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return menuCategories;
    return menuCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addToCart(item: MenuItem, variant?: MenuVariant) {
    const lineId = `${item.id}${variant ? `-${variant.id}` : ""}`;
    const unitPrice = variant?.price ?? item.price;
    setCart((current) => {
      const existing = current.find((line) => line.lineId === lineId);
      if (existing) {
        return current.map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, {
        lineId,
        itemId: item.id,
        name: item.name,
        variantId: variant?.id,
        variantLabel: variant?.label,
        unitPrice,
        quantity: 1,
      }];
    });
    showToast(`${item.name} added to your order`);
  }

  function changeQuantity(lineId: string, amount: number) {
    setCart((current) => current
      .map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + amount } : line)
      .filter((line) => line.quantity > 0));
  }

  function removeLine(lineId: string) {
    setCart((current) => current.filter((line) => line.lineId !== lineId));
  }

  function whatsappOrderMessage() {
    const itemLines = cart.map((line) => {
      const variant = line.variantLabel ? ` (${line.variantLabel})` : "";
      return `• ${line.name}${variant} × ${line.quantity} = ${formatPrice(line.unitPrice * line.quantity)}`;
    }).join("\n");
    return [
      "FRY'DAY HOUSE — NEW ORDER",
      "",
      "ORDER ITEMS",
      itemLines || "No items selected",
      "",
      `TOTAL: ${formatPrice(cartTotal)}`,
      "",
      `Name: ${customerName || "Not provided"}`,
      `Phone: ${customerPhone || "Not provided"}`,
      `Order type: ${orderType}`,
      `Delivery address: ${customerAddress || "Not applicable / not provided"}`,
      `Payment preference: ${paymentMethod}`,
      `Notes: ${orderNotes || "None"}`,
      "",
      "Please confirm my order and let me know the delivery charges / estimated time. Thank you!",
    ].join("\n");
  }

  function sendWhatsAppOrder() {
    if (cart.length === 0) {
      setFormError("Add something delicious to your cart first.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError("Please add your name and phone number to continue.");
      return;
    }
    if (orderType === "Home delivery" && !customerAddress.trim()) {
      setFormError("Please add your delivery address.");
      return;
    }
    setFormError("");
    const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappOrderMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function jumpToCategory(categoryId: string) {
    setActiveCategory(categoryId);
    document.getElementById(`menu-${categoryId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changeVariant(itemId: string, variantId: string) {
    setSelectedVariants((current) => ({ ...current, [itemId]: variantId }));
  }

  const directWhatsApp = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Fry-Day House! I would like to ask about your menu.")}`;

  return (
    <main id="home" className="site-shell">
      <div className="top-strip">
        <span>✦</span> LATE-NIGHT CRAVINGS, SORTED <span className="top-strip__dot">•</span> TRUST COLONY FOOD CHOWK, BAHAWALPUR <span>✦</span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#menu">Menu</a>
            <a href="#deals">Deals</a>
            <a href="#story">The Fry-Day vibe</a>
            <a href="#find-us">Find us</a>
          </nav>
          <div className="header-actions">
            <a className="header-order-link" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /> Order now</a>
            <button className="cart-trigger" type="button" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}>
              <span className="cart-trigger__icon">▣</span><span className="cart-trigger__label">Cart</span><b>{cartCount}</b>
            </button>
          </div>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#menu">Menu</a>
          <a href="#deals">Deals</a>
          <a href="#story">The vibe</a>
          <a href="#find-us">Find us</a>
        </nav>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-glow hero-glow--one" aria-hidden="true" />
        <div className="hero-glow hero-glow--two" aria-hidden="true" />
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="hero-pill"><span className="live-dot" /> {pageContent.hero.eyebrow.toUpperCase()}</div>
            <h1 id="hero-title">{siteConfig.heroHeadline.split("\n")[0]}<br /><em>{siteConfig.heroHeadline.split("\n")[1]}</em></h1>
            <p className="hero-tagline">{siteConfig.tagline} <span>😉</span></p>
            <p className="hero-urdu">{pageContent.hero.hungerLine}</p>
            <p className="hero-description">{siteConfig.heroDescription}</p>
            <div className="hero-cta-row">
              <a className="button button--primary" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon /> {pageContent.hero.orderButton} <span>↗</span></a>
              <a className="button button--ghost" href="#menu">{pageContent.hero.menuButton} <span>↓</span></a>
            </div>
            <div className="hero-footnote"><span>✦</span> {pageContent.hero.servicesLine}</div>
          </motion.div>

          <motion.div className="hero-art" initial={{ opacity: 0, scale: 0.92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.12 }}>
            <div className="hero-art__halo" />
            <div className="hero-image-frame">
              <Image src="/images/hero.jpg" alt="Sample burger and crispy fries artwork for Fry-Day House" fill priority sizes="(max-width: 900px) 92vw, 48vw" className="hero-image" />
              <div className="hero-image-shade" />
            </div>
            <div className="hero-sticker hero-sticker--top"><span>100%</span><small>CRAVE<br />WORTHY</small></div>
            <div className="hero-sticker hero-sticker--bottom"><strong>FRY</strong><small>HARD<br />EAT GOOD</small></div>
            <div className="floating-fries floating-fries--one" aria-hidden="true">🍟</div>
            <div className="floating-fries floating-fries--two" aria-hidden="true">✦</div>
            <div className="steam steam--one" aria-hidden="true" />
            <div className="steam steam--two" aria-hidden="true" />
          </motion.div>
        </div>
        <div className="hero-bottom-line"><span>BURGERS</span><i /> <span>SHAWARMA</span><i /> <span>LOADED FRIES</span><i /> <span>GOOD TIMES</span></div>
      </section>

      <section className="best-sellers section-pad" aria-labelledby="best-sellers-title">
        <div className="container">
          <div className="best-sellers-heading">
            <SectionHeading id="best-sellers-title" eyebrow={pageContent.featured.eyebrow} title={pageContent.featured.title.toUpperCase()} description={pageContent.featured.description} />
            <a className="text-link" href="#menu">{pageContent.featured.exploreLink} <span>↗</span></a>
          </div>
          <div className="featured-scroll" role="list" aria-label="Best selling menu items">
            {featuredItems.map((item, index) => {
              const variant = item.variants?.[0];
              return (
                <motion.article className={`featured-card featured-card--${index % 3}`} key={item.id} role="listitem" whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <div className="featured-card__number">0{index + 1}</div>
                  <div className="featured-card__visual" aria-hidden="true">
                    <span>{["🍔", "🍔", "🍗", "🍟", "🍗", "🌯"][index] ?? "🍔"}</span>
                    <i>✳</i>
                  </div>
                  <div className="featured-card__content">
                    <div><span className="mini-label">FRY-DAY PICK</span><h3>{item.name}</h3></div>
                    <Price amount={variant?.price ?? item.price} />
                  </div>
                  <button type="button" className="featured-add" onClick={() => addToCart(item, variant)}>Add to cart <span>＋</span></button>
                </motion.article>
              );
            })}
          </div>
          <p className="scroll-hint"><span>←</span> Swipe to see the favourites <span>→</span></p>
        </div>
      </section>

      <section className="menu-section section-pad" id="menu" aria-labelledby="menu-title">
        <div className="container">
          <SectionHeading id="menu-title" eyebrow={pageContent.menu.eyebrow} title={pageContent.menu.title.toUpperCase()} description={pageContent.menu.description} align="center" />
          <div className="menu-callout"><span>✳</span><strong>{pageContent.menu.fusionLabel.toUpperCase()}</strong><small>Zinger · Anda Shami · Chapli Kabab · Kababish · Shawarma</small><span>✳</span></div>
          <div className="menu-toolbar">
            <div className="menu-tabs" role="navigation" aria-label="Menu categories">
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={activeCategory === category.id ? "menu-tab is-active" : "menu-tab"}
                  onClick={() => jumpToCategory(category.id)}
                >{category.name}</button>
              ))}
            </div>
            <label className="menu-search">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search menu</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={pageContent.menu.searchPlaceholder} />
              {searchQuery ? <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">×</button> : null}
            </label>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="empty-search"><span>🍟</span><h3>No bites found.</h3><p>Try another search. Your craving is out there.</p></div>
          ) : (
            <div className="menu-category-list">
              {filteredCategories.map((category) => (
                <section className="menu-category" id={`menu-${category.id}`} key={category.id} aria-labelledby={`category-${category.id}`}>
                  <div className="menu-category__heading">
                    <div><span className="mini-label">{category.eyebrow}</span><h3 id={`category-${category.id}`}>{category.name}</h3></div>
                    <p>{category.description}</p>
                  </div>
                  <div className="menu-grid">
                    {category.items.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        selectedVariantId={selectedVariants[item.id]}
                        onVariantChange={changeVariant}
                        onAdd={addToCart}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <div className="menu-bottom-note"><span>!</span> {pageContent.menu.priceNote}</div>
        </div>
      </section>

      <section className="deals-section section-pad" id="deals" aria-labelledby="deals-title">
        <div className="container">
          <div className="deals-header">
            <SectionHeading id="deals-title" eyebrow={pageContent.deals.eyebrow} title={pageContent.deals.title.toUpperCase()} description={pageContent.deals.description} />
            <div className="deal-stamp" aria-hidden="true"><span>GOOD</span><strong>FOOD</strong><span>GOOD MOOD</span></div>
          </div>
          <div className="deals-grid">
            {deals.map((deal, index) => (
              <motion.article className={`deal-card deal-card--${deal.accent}`} key={deal.id} whileHover={{ y: -6 }}>
                <div className="deal-card__top"><span className="deal-number">0{index + 1}</span><span className="deal-label">{deal.label}</span></div>
                <div className="deal-card__illustration" aria-hidden="true">{index === 0 ? "🎓" : index === 1 ? "🍗" : "🌙"}</div>
                <h3>{deal.name}</h3>
                <p>{deal.description}</p>
                <div className="deal-card__bottom"><strong>{deal.priceLabel}</strong><a href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hi Fry-Day House! I would like to ask about the ${deal.name}.`)}`} target="_blank" rel="noreferrer">Ask about deal <span>↗</span></a></div>
              </motion.article>
            ))}
          </div>
          <p className="deals-edit-note">{pageContent.deals.editNote}</p>
        </div>
      </section>

      <section className="desi-strip" id="story">
        <div className="container desi-strip__inner">
          <div className="desi-strip__copy"><span className="eyebrow"><span /> {pageContent.vibe.eyebrow.toUpperCase()}</span><h2>{pageContent.vibe.titleLineOne.toUpperCase()}<br /><em>{pageContent.vibe.titleLineTwo.toUpperCase()}</em></h2><p>{pageContent.vibe.description}</p><a href="#menu" className="button button--light">{pageContent.vibe.button} <span>↗</span></a></div>
          <div className="desi-strip__visual"><div className="desi-ring" /><span className="desi-emoji desi-emoji--burger">🍔</span><span className="desi-emoji desi-emoji--fries">🍟</span><span className="desi-emoji desi-emoji--pepper">🌶️</span><span className="desi-note">FULL<br />FLAVOUR<br />ENERGY</span></div>
        </div>
      </section>

      <section className="how-section section-pad" aria-labelledby="how-title">
        <div className="container">
          <SectionHeading id="how-title" eyebrow={pageContent.howToOrder.eyebrow} title={pageContent.howToOrder.title.toUpperCase()} description={pageContent.howToOrder.description} align="center" />
          <div className="steps-grid">
            {pageContent.howToOrder.steps.map((step, index) => (
              <motion.article className="step-card" key={step.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ delay: index * 0.1 }}>
                <div className="step-card__top"><span>{step.number}</span><i>{step.icon}</i></div>
                <h3>{step.title}</h3><p>{step.description}</p>
                {index !== 2 ? <span className="step-arrow" aria-hidden="true">⟶</span> : null}
              </motion.article>
            ))}
          </div>
          <div className="payment-note"><span>💸</span><div><strong>{pageContent.howToOrder.paymentTitle}</strong><p>{pageContent.howToOrder.paymentDescription}</p></div></div>
        </div>
      </section>

      <section className="gallery-section section-pad" aria-labelledby="gallery-title">
        <div className="container">
          <div className="gallery-heading"><SectionHeading id="gallery-title" eyebrow={pageContent.gallery.eyebrow} title={pageContent.gallery.title.toUpperCase()} description={pageContent.gallery.description} /><span className="gallery-hashtag">{pageContent.gallery.hashtag}</span></div>
          <div className="gallery-grid">
            <figure className="gallery-photo gallery-photo--large"><Image src="/images/shop-1.jpg" alt="Sample artwork placeholder for Fry-Day House counter photography" fill sizes="(max-width: 700px) 100vw, 55vw" loading="lazy" /><figcaption><span>01 / THE COUNTER</span><strong>{pageContent.gallery.captions[0]}</strong></figcaption></figure>
            <figure className="gallery-photo"><Image src="/images/shop-2.jpg" alt="Sample artwork placeholder for Fry-Day House outdoor seating photography" fill sizes="(max-width: 700px) 100vw, 40vw" loading="lazy" /><figcaption><span>02 / THE HANGOUT</span><strong>{pageContent.gallery.captions[1]}</strong></figcaption></figure>
            <figure className="gallery-photo"><Image src="/images/shop-3.jpg" alt="Sample artwork placeholder for a Fry-Day House fast-food platter photo" fill sizes="(max-width: 700px) 100vw, 40vw" loading="lazy" /><figcaption><span>03 / THE GOOD STUFF</span><strong>{pageContent.gallery.captions[2]}</strong></figcaption></figure>
          </div>
        </div>
      </section>

      <section className="find-section section-pad" id="find-us" aria-labelledby="find-title">
        <div className="container find-grid">
          <div className="find-copy">
            <SectionHeading id="find-title" eyebrow={pageContent.findUs.eyebrow} title={pageContent.findUs.title.toUpperCase()} description={pageContent.findUs.description} />
            <div className="contact-list">
              <div className="contact-row"><span className="contact-icon">⌖</span><div><small>FIND THE SPOT</small><strong>{siteConfig.location}</strong><a href="https://www.google.com/maps/search/?api=1&query=Trust+Colony+Food+Chowk+Bahawalpur+Pakistan" target="_blank" rel="noreferrer">{pageContent.findUs.directions} ↗</a></div></div>
              <div className="contact-row"><span className="contact-icon">☎</span><div><small>CALL THE HOUSE</small><strong>{siteConfig.phoneDisplay}</strong><a href={`tel:${siteConfig.phoneLink}`}>Tap to call ↗</a></div></div>
              <div className="contact-row"><span className="contact-icon">✉</span><div><small>DROP US A LINE</small><strong>{siteConfig.email}</strong><a href={`mailto:${siteConfig.email}`}>Send an email ↗</a></div></div>
            </div>
            <div className="find-actions"><a className="button button--primary" href={`tel:${siteConfig.phoneLink}`}>{pageContent.findUs.call} <span>↗</span></a><a className="button button--outline" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> {pageContent.findUs.whatsapp}</a></div>
          </div>
          <div className="find-side">
            <div className="map-card"><iframe title="Map showing Trust Colony Food Chowk, Bahawalpur" src={siteConfig.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-label"><span>📍</span><div><strong>FRY-DAY HOUSE</strong><small>Trust Colony Food Chowk</small></div></div></div>
            <div className="hours-card"><div className="hours-card__header"><div><span className="mini-label">PLAN YOUR VISIT</span><h3>{pageContent.findUs.hoursTitle}</h3></div><span className="hours-icon">◷</span></div><div className="hours-list">{siteConfig.openingHours.map((row) => <div className="hours-row" key={row.day}><span>{row.day}</span><strong>{row.hours}</strong></div>)}</div><p>{pageContent.findUs.hoursNote}</p></div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand"><Logo /><p>{pageContent.footer.description}</p><span className="footer-tagline">{pageContent.footer.tagline}</span></div>
          <div className="footer-links"><h4>{pageContent.footer.explore.toUpperCase()}</h4><a href="#menu">Full menu</a><a href="#deals">Deals</a><a href="#story">Our vibe</a><a href="#find-us">Find us</a></div>
          <div className="footer-links"><h4>{pageContent.footer.contact.toUpperCase()}</h4><a href={`tel:${siteConfig.phoneLink}`}>{siteConfig.phoneDisplay}</a><a href={directWhatsApp} target="_blank" rel="noreferrer">WhatsApp orders ↗</a><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
          <div className="footer-social"><h4>{pageContent.footer.social.toUpperCase()}</h4><div className="social-row"><a href={siteConfig.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">IG</a><a href={siteConfig.socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">TT</a><a href={siteConfig.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">FB</a></div><small>{pageContent.footer.socialNote}</small></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} Fry-Day House. {pageContent.footer.copyright}</span><span>BAHAWALPUR, PAKISTAN <b>✳</b></span></div>
      </footer>

      <a className="floating-whatsapp" href={directWhatsApp} target="_blank" rel="noreferrer" aria-label="Chat with Fry-Day House on WhatsApp"><WhatsAppIcon size={25} /><span>Order on WhatsApp</span></a>

      <AnimatePresence>
        {cartOpen ? (
          <>
            <motion.button className="cart-backdrop" type="button" aria-label="Close cart" onClick={() => setCartOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}>
              <div className="cart-drawer__header"><div><span className="mini-label">YOUR FRY-DAY PICKS</span><h2 id="cart-title">Your cart <span>({cartCount})</span></h2></div><button type="button" className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>
              <div className="cart-drawer__body">
                {cart.length === 0 ? (
                  <div className="cart-empty"><span>🍟</span><h3>Your cart is hungry.</h3><p>Add a few favourites and they&apos;ll show up here.</p><button type="button" className="button button--primary" onClick={() => { setCartOpen(false); document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }); }}>Browse menu</button></div>
                ) : (
                  <div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.lineId}><div className="cart-line__info"><strong>{line.name}</strong>{line.variantLabel ? <small>{line.variantLabel}</small> : null}<span>{formatPrice(line.unitPrice)} each</span></div><div className="cart-line__controls"><div className="quantity-control"><button type="button" onClick={() => changeQuantity(line.lineId, -1)} aria-label={`Decrease ${line.name} quantity`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => changeQuantity(line.lineId, 1)} aria-label={`Increase ${line.name} quantity`}>＋</button></div><strong>{formatPrice(line.unitPrice * line.quantity)}</strong><button type="button" className="remove-line" onClick={() => removeLine(line.lineId)}>Remove</button></div></div>)}</div>
                )}

                {cart.length > 0 ? (
                  <>
                    <div className="cart-form">
                      <div className="cart-form__heading"><span className="mini-label">A FEW DETAILS</span><h3>Where should we send it?</h3></div>
                      <label>Your name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Name" autoComplete="name" /></label>
                      <label>Phone number<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="03xx-xxxxxxx" inputMode="tel" autoComplete="tel" /></label>
                      <label>Order type<select value={orderType} onChange={(event) => setOrderType(event.target.value as OrderType)}><option>Home delivery</option><option>Takeaway</option><option>Dine-in</option></select></label>
                      {orderType === "Home delivery" ? <label>Delivery address<input value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="House, street, area" autoComplete="street-address" /></label> : <label>Address / pickup note<input value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Optional" /></label>}
                      <label>Payment preference<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}><option>Cash on Delivery</option><option>JazzCash</option><option>Easypaisa</option></select></label>
                      <label>Order notes<textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} placeholder="Extra sauce? No onions? Tell us here." rows={3} /></label>
                    </div>
                    <div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div><small>Delivery charges, if any, are confirmed by the shop on WhatsApp.</small><div className="cart-total"><span>Order total</span><strong>{formatPrice(cartTotal)}</strong></div></div>
                    {formError ? <p className="form-error" role="alert">{formError}</p> : null}
                    <button type="button" className="button button--primary cart-checkout" onClick={sendWhatsAppOrder}><WhatsAppIcon /> Send order on WhatsApp <span>↗</span></button>
                    <p className="cart-secure-note">No online payment needed. Confirm your order directly with Fry-Day House.</p>
                  </>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>{toast} <span>✓</span></motion.div> : null}
      </AnimatePresence>
    </main>
  );
}
