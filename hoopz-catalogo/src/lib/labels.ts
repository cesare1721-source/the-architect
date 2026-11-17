import type { Product } from "@/data/schema";
import { formatPrice } from "./format";

export const isJersey = (p: Product) => p.category === "actuales" || p.category === "retro";
export const teamShort = (p: Product) => (p.team ? p.team.split(" ").at(-1)! : null);
export const priceText = (p: Product) => (p.price !== null ? formatPrice(p.price) : null);

/** Línea secundaria: "Lakers · Blanca" en jerseys; la variante en lo demás. */
export const subtitle = (p: Product) => (isJersey(p) ? `${teamShort(p)} · ${p.variant}` : p.variant);

/** Texto alternativo descriptivo. */
export function imageAlt(p: Product, side: "front" | "back"): string {
  const vista = side === "front" ? "vista de frente" : "vista de espalda";
  if (isJersey(p)) return `Jersey ${p.team} de ${p.title}${p.number !== null ? `, número ${p.number}` : ""}, ${p.variant.toLowerCase()}, ${vista}`;
  return `${p.title}, ${p.variant.toLowerCase()}, ${vista}`;
}

/** Imagen de tarjeta (frente si existe) y de escena (espalda si existe: nombre y número). */
export const cardImage = (p: Product) => (p.images.front ?? p.images.back)!;
export const stageImage = (p: Product) => (p.images.back ?? p.images.front)!;
