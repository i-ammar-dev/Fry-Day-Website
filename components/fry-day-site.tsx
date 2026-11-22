"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, pageContent, siteConfig } from "@/lib/data";
import { ITEM_BY_ID, type MenuItem } from "@/data/menu";
import { plainInput, useCart } from "@/lib/cart";
import { money } from "@/lib/order";
import { SITE } from "@/config/site";
import MenuApp from "@/components/menu/MenuApp";
import StatusChip from "@/components/menu/StatusChip";
import SitePhotoGallery from "@/components/site-photo-gallery";
import ComboDeals from "@/components/menu/ComboDeals";
import FoodImage from "@/components/menu/FoodImage";

function Logo() {
  return (
    <Link href="/" className="brand-lockup" aria-label="Fry-Day House home">
      <Image src="/images/logo-small.png" alt="Fry-Day House logo" width={751} height={605} priority className="brand-logo" />
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
    <div className={`section-heading section-heading--${align}`} data-reveal>
      <span className="eyebrow"><span />{eyebrow}</span>
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function Price({ amount }: { amount: number }) {
  return <span className="price">{formatPrice(amount)}</span>;
}

function formatHour(value: string) {
  const hour = Number(value.split(":")[0]);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12} ${suffix}`;
}

const navItems = [
  { id: "menu", label: "Menu" },
  ...(SITE.showDeals ? [{ id: "deals", label: "Deals" }] : []),
  { id: "story", label: "The Fry-Day vibe" },
  { id: "find-us", label: "Find us" },
];

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
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("");
  const [todayWeekday, setTodayWeekday] = useState("");

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

  function scrollFeatured(direction: -1 | 1) {
    const row = featuredScrollRef.current;
    if (!row) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    row.scrollBy({ left: direction * Math.max(row.clientWidth * 0.78, 280), behavior });
  }

  const directWhatsApp = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi Fry-Day House! I would like to ask about your menu.")}`;
  const openHoursLabel = `Open ${formatHour(SITE.hours.open)} to ${formatHour(SITE.hours.close)}`;
  const socialLinks = [
    { key: "instagram", label: "Instagram", shortLabel: "IG", url: siteConfig.socials.instagram },
    { key: "tiktok", label: "TikTok", shortLabel: "TT", url: siteConfig.socials.tiktok },
    { key: "facebook", label: "Facebook", shortLabel: "FB", url: siteConfig.socials.facebook },
  ].filter(({ url }) => url && !/your(handle|page)|placeholder|example\.com/i.test(url));

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveNav(current.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.15, 0.35, 0.6] },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    targets.forEach((target) => {
      target.classList.add("reveal-pending");
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove("reveal-pending"));
    };
  }, []);

  useEffect(() => {
    const updateToday = () => {
      setTodayWeekday(new Intl.DateTimeFormat("en-US", {
        timeZone: SITE.hours.timeZone,
        weekday: "long",
      }).format(new Date()));
    };
    updateToday();
    const interval = window.setInterval(updateToday, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main id="home" className="site-shell">
      <div className="top-strip">
        <span>✦</span> LATE-NIGHT CRAVINGS, SORTED <span className="top-strip__dot">•</span> TRUST COLONY FOOD CHOWK, BAHAWALPUR <span>✦</span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} aria-current={activeNav === item.id ? "location" : undefined}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <StatusChip className="header-status" />
            <a className="header-order-link" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /><span>Order now</span></a>
            <button className="cart-trigger" type="button" onClick={cart.openCart} aria-label={`Open cart, ${cart.count} items`}>
              <span className="cart-trigger__icon">▣</span><span className="cart-trigger__label">Cart</span><b>{cart.count}</b>
            </button>
          </div>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={activeNav === item.id ? "location" : undefined}>
              {item.id === "story" ? "The vibe" : item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <picture className="hero-background">
          <source media="(min-width: 768px)" srcSet="/images/hero/hero-desktop.jpg" />
          <Image src="/images/hero/hero-mobile.jpg" alt="" fill priority sizes="100vw" />
        </picture>
        <div className="hero-background-overlay" aria-hidden="true" />
        <div className="hero-warm-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy hero-copy--enter">
            <div className="hero-logo-frame">
              <Image src="/images/logo.svg" alt="Fry-Day House logo" width={225} height={181} priority className="hero-logo" />
            </div>
            <div className="hero-pill"><span className="live-dot" /> {pageContent.hero.eyebrow.toUpperCase()}</div>
            <h1 id="hero-title">{siteConfig.heroHeadline.split("\n")[0]}<br /><em>{siteConfig.heroHeadline.split("\n")[1]}</em></h1>
            <p className="hero-tagline">{siteConfig.tagline} <span>😉</span></p>
            <p className="hero-urdu">{pageContent.hero.hungerLine}</p>
            <p className="hero-description">{siteConfig.heroDescription}</p>
            <div className="hero-cta-row">
              <a className="button button--primary" href={directWhatsApp} target="_blank" rel="noreferrer"><WhatsAppIcon /> {pageContent.hero.orderButton} <span>↗</span></a>
              <a className="button button--ghost" href="#menu">{pageContent.hero.menuButton} <span>↓</span></a>
            </div>
            <div className="hero-trust-row" aria-label="Service and opening hours">
              {siteConfig.services.map((service: string) => <span key={service}>{service}</span>)}
              <span>{openHoursLabel}</span>
            </div>
          </div>

        </div>
        <div className="hero-bottom-line"><span>BURGERS</span><i /> <span>SHAWARMA</span><i /> <span>LOADED FRIES</span><i /> <span>GOOD TIMES</span></div>
      </section>

      <section className="best-sellers section-pad" aria-labelledby="best-sellers-title">
        <div className="container">
          <div className="best-sellers-heading">
            <SectionHeading id="best-sellers-title" eyebrow={pageContent.featured.eyebrow} title={pageContent.featured.title.toUpperCase()} description={pageContent.featured.description} />
            <div className="best-sellers-actions">
              <a className="text-link" href="#menu">{pageContent.featured.exploreLink} <span>↗</span></a>
              <div className="featured-controls" role="group" aria-label="Scroll House Favourites">
                <button type="button" aria-label="Scroll favourites left" onClick={() => scrollFeatured(-1)}>←</button>
                <button type="button" aria-label="Scroll favourites right" onClick={() => scrollFeatured(1)}>→</button>
              </div>
            </div>
          </div>
          <div ref={featuredScrollRef} className="featured-scroll" role="list" aria-label="House Favourites" data-reveal>
            {featuredItems.map((item, index) => {
              const featuredPrice = Array.isArray(item.price) ? item.price[0] : item.price;
              return (
                <motion.article className={`featured-card featured-card--${index % 3}`} key={item.id} role="listitem" whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <div className="featured-card__media">
                    <FoodImage id={item.imageId} name={item.name} category={item.category} className="featured-card__photo" />
                    <span className="featured-card__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="featured-card__ribbon">Fry-Day pick</span>
                  </div>
                  <div className="featured-card__content">
                    <h3>{item.name}</h3>
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

      {SITE.showDeals ? (
        <section className="deals-section section-pad" id="deals" aria-labelledby="deals-title">
          <ComboDeals eyebrow={pageContent.deals.eyebrow} title={pageContent.deals.title} description={pageContent.deals.description} />
        </section>
      ) : null}

      <section className="desi-strip" id="story">
        <div className="container desi-strip__inner">
          <div className="desi-strip__copy" data-reveal><span className="eyebrow"><span /> {pageContent.vibe.eyebrow.toUpperCase()}</span><h2>{pageContent.vibe.titleLineOne.toUpperCase()}<br /><em>{pageContent.vibe.titleLineTwo.toUpperCase()}</em></h2><p>{pageContent.vibe.description}</p><a href="#menu" className="button button--light">{pageContent.vibe.button} <span>↗</span></a></div>
          <figure className="vibe-photo">
            <Image src="/images/gallery/shop-cart-closeup.jpg" alt="Close-up of the Fry-Day House food cart at Trust Colony Food Chowk, Bahawalpur." fill sizes="(max-width: 720px) 100vw, 40vw" loading="lazy" />
            <figcaption>THE FRY-DAY VIBE</figcaption>
          </figure>
        </div>
      </section>

      <section className="how-section section-pad" aria-labelledby="how-title">
        <div className="container">
          <SectionHeading id="how-title" eyebrow={pageContent.howToOrder.eyebrow} title={pageContent.howToOrder.title.toUpperCase()} description={pageContent.howToOrder.description} align="center" />
          <div className="how-order-strip" aria-label="Three steps to order" data-reveal>
            {pageContent.howToOrder.steps.map((step) => (
              <article className="how-order-step" key={step.number}>
                <span className="how-order-step__icon" aria-hidden="true">{step.icon}</span>
                <div className="how-order-step__copy">
                  <span className="how-order-step__number">STEP {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
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
          <div className="find-side" data-reveal>
            <figure className="find-photo">
              <Image src="/images/gallery/shop-front-wide.jpg" alt="Fry-Day House food cart at night, Trust Colony Food Chowk, Bahawalpur." fill sizes="(max-width: 720px) 100vw, 42vw" loading="lazy" />
              <figcaption>FIND US AT TRUST COLONY FOOD CHOWK</figcaption>
            </figure>
            <div className="map-card"><iframe title="Map showing Trust Colony Food Chowk, Bahawalpur" src={siteConfig.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-label"><span>📍</span><div><strong>FRY-DAY HOUSE</strong><small>Trust Colony Food Chowk</small></div></div></div>
            <div className="hours-card">
              <div className="hours-card__header">
                <div><span className="mini-label">PLAN YOUR VISIT</span><h3>{pageContent.findUs.hoursTitle}</h3></div>
                <div className="hours-card__tools"><StatusChip className="find-status-chip" /><span className="hours-icon" aria-hidden="true">◷</span></div>
              </div>
              <div className="hours-list" role="list" aria-label="Opening hours">
                {siteConfig.openingHours.map((row) => {
                  const isToday = row.day === todayWeekday;
                  return (
                    <div className={`hours-row ${isToday ? "is-today" : ""}`} key={row.day} role="listitem" aria-current={isToday ? "date" : undefined}>
                      <span>{row.day}{isToday ? <small className="hours-today-label">Today</small> : null}</span>
                      <strong>{row.hours}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand"><Logo /><p>{pageContent.footer.description}</p><span className="footer-tagline">{pageContent.footer.tagline}</span></div>
          <div className="footer-links"><h4>{pageContent.footer.explore.toUpperCase()}</h4><a href="#menu">Full menu</a>{SITE.showDeals ? <a href="#deals">Deals</a> : null}<a href="#story">Our vibe</a><a href="#find-us">Find us</a></div>
          <div className="footer-links"><h4>{pageContent.footer.contact.toUpperCase()}</h4><a href={`tel:${siteConfig.phoneLink}`}>{siteConfig.phoneDisplay}</a><a href={directWhatsApp} target="_blank" rel="noreferrer">WhatsApp orders ↗</a><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
          {socialLinks.length > 0 ? (
            <div className="footer-social">
              <h4>{pageContent.footer.social.toUpperCase()}</h4>
              <div className="social-row">
                {socialLinks.map(({ key, label, shortLabel, url }) => (
                  <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={label}>{shortLabel}</a>
                ))}
              </div>
            </div>
          ) : null}
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
