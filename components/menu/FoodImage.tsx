"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryId } from "@/data/menu";

const BLUR_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const EMOJI: Record<CategoryId, string> = {
  burgers: "🍔",
  parathas: "🌯",
  shawarmas: "🥙",
  fries: "🍟",
  platters: "🍽️",
  broast: "🍗",
  sides: "🧀",
};

// Shows /images/menu/<id>.jpg. If the file is missing, shows a branded tile instead.
export default function FoodImage({
  id,
  name,
  category,
  className = "",
}: {
  id: string;
  name: string;
  category: CategoryId;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden bg-[#161616] ${className}`}>
      {!failed ? (
        <Image
          src={`/images/menu/${id}.jpg`}
          alt={name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={BLUR_PIXEL}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,rgba(255,106,0,0.25),transparent_65%)]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#F5B800]/50 bg-[#F5B800]/15 text-2xl" aria-label="Fry-Day House chef logo">👨‍🍳</span>
          <span className="text-5xl drop-shadow" aria-hidden="true">{EMOJI[category]}</span>
          <span className="font-display text-xs tracking-widest text-[#F5B800]/80">
            FRY&apos;DAY HOUSE
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
