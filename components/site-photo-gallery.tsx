"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const photos = [
  {
    src: "/images/gallery/shop-front-wide.jpg",
    alt: "Fry-Day House food cart at night, Trust Colony Food Chowk, Bahawalpur.",
    caption: "Pull up hungry.",
    label: "THE FOOD CHOWK",
    width: 1800,
    height: 1005,
    className: "gallery-photo gallery-photo--wide",
  },
  {
    src: "/images/gallery/shop-street-seating-portrait.jpg",
    alt: "Outdoor street-side seating at Fry-Day House in Trust Colony, Bahawalpur.",
    caption: "Stay for the vibes.",
    label: "THE HANGOUT",
    width: 1200,
    height: 1600,
    className: "gallery-photo",
  },
  {
    src: "/images/gallery/shop-cart-closeup.jpg",
    alt: "Close view of the Fry-Day House food cart at night in Bahawalpur.",
    caption: "Made for the craving.",
    label: "THE COUNTER",
    width: 1112,
    height: 1600,
    className: "gallery-photo",
  },
  {
    src: "/images/gallery/shop-corner-portrait.jpg",
    alt: "Corner view of Fry-Day House and its A-frame board at Trust Colony Food Chowk, Bahawalpur.",
    caption: "Meet you at the chowk.",
    label: "THE CORNER SPOT",
    width: 1025,
    height: 1600,
    className: "gallery-photo",
  },
];

export default function SitePhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  const close = () => setActiveIndex(null);
  const showPrevious = () => setActiveIndex((current) => current === null ? null : (current + photos.length - 1) % photos.length);
  const showNext = () => setActiveIndex((current) => current === null ? null : (current + 1) % photos.length);

  useEffect(() => {
    if (activeIndex === null) {
      returnFocus.current?.focus();
      returnFocus.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "Tab") {
        const controls = Array.from(document.querySelectorAll<HTMLButtonElement>(".photo-lightbox button"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            className={photo.className}
            key={photo.src}
            type="button"
            onClick={(event) => { returnFocus.current = event.currentTarget; setActiveIndex(index); }}
            aria-label={`Enlarge photo ${index + 1} of ${photos.length}: ${photo.caption}`}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 720px) 50vw, (max-width: 980px) 25vw, 25vw" loading="lazy" />
            <span className="gallery-photo__caption"><span>{String(index + 1).padStart(2, "0")} / {photo.label}</span><strong>{photo.caption}</strong></span>
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={close}>
          <button className="photo-lightbox__close" ref={closeButton} type="button" onClick={close} aria-label="Close enlarged photo">×</button>
          <button className="photo-lightbox__nav photo-lightbox__nav--previous" type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} aria-label="Previous photo">‹</button>
          <div
            className="photo-lightbox__content"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              const endX = event.changedTouches[0]?.clientX;
              if (touchStartX.current === null || endX === undefined) return;
              const distance = endX - touchStartX.current;
              if (Math.abs(distance) > 48) {
                if (distance > 0) showPrevious();
                else showNext();
              }
              touchStartX.current = null;
            }}
          >
            <Image src={activePhoto.src} alt={activePhoto.alt} width={activePhoto.width} height={activePhoto.height} sizes="90vw" className="photo-lightbox__image" priority />
            <p>{activePhoto.caption}</p>
            <span>{activeIndex! + 1} / {photos.length} · Swipe or use the arrow keys</span>
          </div>
          <button className="photo-lightbox__nav photo-lightbox__nav--next" type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} aria-label="Next photo">›</button>
        </div>
      ) : null}
    </>
  );
}

