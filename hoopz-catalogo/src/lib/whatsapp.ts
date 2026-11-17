import type { Product, Store } from "@/data/schema";
import { formatPrice } from "./format";

export function isWhatsAppReady(store: Store): boolean {
  return store.whatsapp !== "PENDIENTE";
}

/** Mensaje general (header, botón flotante, cierre). */
export function generalWhatsAppUrl(store: Store): string | null {
  if (!isWhatsAppReady(store)) return null;
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent("¡Hola HOOPZ! Vi el catálogo y quiero hacer un pedido.")}`;
}

/** Mensaje de pedido de un producto. `size` es null si no eligió o no hay tallas. */
export function productWhatsAppUrl(store: Store, p: Product, size: string | null): string | null {
  if (!isWhatsAppReady(store)) return null;
  const lines = ["¡Hola HOOPZ! Quiero pedir:", `• ${productLabel(p)}`, `• Talla: ${size ?? "te la confirmo por aquí"}`];
  if (p.price !== null) lines.push(`• Precio: ${formatPrice(p.price)}`);
  lines.push(`${store.siteUrl}/p/${p.slug}`);
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** "Jersey Lakers · Kobe Bryant #24 (2009-10)" | "Chaqueta Thunder" | "Esqueleto Nike Dri-FIT (Azul rey)" */
export function productLabel(p: Product): string {
  if (p.category === "actuales" || p.category === "retro") {
    const teamShort = (p.team ?? "").split(" ").at(-1);
    return `Jersey ${teamShort} · ${p.title}${p.number !== null ? ` #${p.number}` : ""}${p.season ? ` (${p.season})` : ""}`;
  }
  if (p.category === "chaquetas") return p.title;
  return `${p.title} (${p.variant})`;
}
