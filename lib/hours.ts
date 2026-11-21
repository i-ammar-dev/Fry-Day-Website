import { SITE } from "@/config/site";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const label12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
};

export function getStatus(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE.hours.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const mins = h * 60 + m;

  const open = toMin(SITE.hours.open);
  const close = toMin(SITE.hours.close);
  const crossesMidnight = close <= open;

  const isOpen = crossesMidnight
    ? mins >= open || mins < close
    : mins >= open && mins < close;

  return {
    isOpen,
    label: isOpen
      ? `Open now, closes at ${label12(SITE.hours.close)}`
      : `Closed, opens at ${label12(SITE.hours.open)}`,
  };
}
