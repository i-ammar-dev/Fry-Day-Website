"use client";

import { useState } from "react";
import type { CategoryId } from "@/data/menu";

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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/menu/${id}.jpg`}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_at_50%_40%,rgba(255,106,0,0.25),transparent_65%)]">
          <span className="text-5xl drop-shadow">{EMOJI[category]}</span>
          <span className="font-display text-xs tracking-widest text-[#F5B800]/80">
            FRY&apos;DAY HOUSE
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
