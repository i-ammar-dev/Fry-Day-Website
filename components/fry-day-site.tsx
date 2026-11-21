"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { deals, formatPrice, pageContent, siteConfig } from "@/lib/data";
import { ITEM_BY_ID, type MenuItem } from "@/data/menu";
import { plainInput, useCart } from "@/lib/cart";
import { money } from "@/lib/order";
import MenuApp from "@/components/menu/MenuApp";
import StatusChip from "@/components/menu/StatusChip";
import SitePhotoGallery from "@/components/site-photo-gallery";

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

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.4 11.7a8.35 8.35 0 0 1-12.35 7.34L3 20l.98-4.86A8.35 8.35 0 1 1 20.4 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 7.8c.2-.45.43-.46.7-.47h.48c.15 0 .35.06.48.36l.7 1.67c.08.2.08.35-.03.51l-.5.65c-.16.18-.16.35-.03.56.34.57.8 1.04 1.36 1.4.2.13.36.12.53-.06l.7-.81c.17-.2.34-.22.56-.13l1.57.74c.25.12.4.18.44.32.05.15.05.84-.37 1.36-.42.52-1.02.75-1.73.77-.7.02-1.64-.27-2.83-.97-1.57-.92-2.62-2.12-3.14-3.12-.53-1-.5-1.77-.27-2.37.23-.6.58-.99.98-1.1Z" fill="currentColor" />
    </svg>
  );
}

export default function FryDaySite() {
  const cart = useCart();
  const [toast, setToast] = useState("");

  const featuredItems = useMemo(
    () => siteConfig.featuredItemIds.map((id) => ITEM_BY_ID[id]).filter((item): item is MenuItem => Boolean(item)),
    [],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addToCart(item: MenuItem) {
    cart.add(plainInput(item, Array.isArray(item.price) ? 0 : null));
    showToast(`${item.name} added to your order`);
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
            <StatusChip />
            <a className="header-order-link" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /> Order now</a>
            <button className="cart-trigger" type="button" onClick={cart.openCart} aria-label={`Open cart, ${cart.count} items`}>
              <span className="cart-trigger__icon">▣</span><span className="cart-trigger__label">Cart</span><b>{cart.count}</b>
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
        <picture className="hero-background">
          <source media="(min-width: 768px)" srcSet="/images/hero/hero-desktop.jpg" />
          <Image src="/images/hero/hero-mobile.jpg" alt="" fill priority sizes="100vw" />
        </picture>
        <div className="hero-background-overlay" aria-hidden="true" />
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
              const featuredPrice = Array.isArray(item.price) ? item.price[0] : item.price;
              return (
                <motion.article className={`featured-card featured-card--${index % 3}`} key={item.id} role="listitem" whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <div className="featured-card__number">0{index + 1}</div>
                  <div className="featured-card__visual" aria-hidden="true">
                    <span>{["🍔", "🍔", "🍗", "🍟", "🍗", "🌯"][index] ?? "🍔"}</span>
                    <i>✳</i>
                  </div>
                  <div className="featured-card__content">
                    <div><span className="mini-label">FRY-DAY PICK</span><h3>{item.name}</h3></div>
                    <Price amount={featuredPrice} />
                  </div>
                  <button type="button" className="featured-add" onClick={() => addToCart(item)}>Add to cart <span>＋</span></button>
                </motion.article>
              );
            })}
          </div>
          <p className="scroll-hint"><span>←</span> Swipe to see the favourites <span>→</span></p>
        </div>
      </section>

      <section className="menu-section section-pad" id="menu" aria-labelledby="menu-title">
        <MenuApp />
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
          <figure className="vibe-photo">
            <Image src="/images/gallery/shop-cart-closeup.jpg" alt="Close-up of the Fry-Day House food cart at Trust Colony Food Chowk, Bahawalpur." fill sizes="(max-width: 720px) 100vw, 40vw" loading="lazy" />
            <figcaption>THE FRY-DAY VIBE</figcaption>
          </figure>
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
          <SitePhotoGallery />
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
            <figure className="find-photo">
              <Image src="/images/gallery/shop-front-wide.jpg" alt="Fry-Day House food cart at night, Trust Colony Food Chowk, Bahawalpur." fill sizes="(max-width: 720px) 100vw, 42vw" loading="lazy" />
              <figcaption>FIND US AT TRUST COLONY FOOD CHOWK</figcaption>
            </figure>
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

      {cart.count > 0 ? (
        <button className="floating-whatsapp" type="button" onClick={cart.openCart} aria-label={`Review ${cart.count} items and order on WhatsApp for ${money(cart.subtotal)}`}>
          <WhatsAppIcon size={25} /><span>Order · {cart.count} · {money(cart.subtotal)}</span>
        </button>
      ) : (
        <a className="floating-whatsapp" href={directWhatsApp} target="_blank" rel="noreferrer" aria-label="Chat with Fry-Day House on WhatsApp"><WhatsAppIcon size={25} /><span>Order on WhatsApp</span></a>
      )}

      <AnimatePresence>
        {toast ? <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>{toast} <span>✓</span></motion.div> : null}
      </AnimatePresence>
    </main>
  );
}

