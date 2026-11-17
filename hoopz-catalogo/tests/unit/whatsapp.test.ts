import { describe, expect, it } from "vitest";
import type { Product, Store } from "@/data/schema";
import { products } from "@/data/products";
import { store as realStore } from "@/data/store";
import { generalWhatsAppUrl, productLabel, productWhatsAppUrl } from "@/lib/whatsapp";

const store: Store = { ...realStore, whatsapp: "584141234567" };
const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;
const decode = (url: string | null) => decodeURIComponent(new URL(url!).searchParams.get("text")!);

describe("productWhatsAppUrl", () => {
  const heat: Product = { ...bySlug("heat-butler-22"), price: 35, sizes: ["S", "M", "L"] };

  it("incluye producto, talla, precio y link", () => {
    const url = productWhatsAppUrl(store, heat, "M");
    expect(url!.startsWith("https://wa.me/584141234567?text=")).toBe(true);
    const text = decode(url);
    expect(text).toContain("Jersey Heat · Jimmy Butler #22");
    expect(text).toContain("Talla: M");
    expect(text).toContain("Precio: $35");
    expect(text).toContain("https://hoopz.pages.dev/p/heat-butler-22");
  });

  it("sin precio omite la línea; sin talla pide confirmarla", () => {
    const text = decode(productWhatsAppUrl(store, { ...heat, price: null }, null));
    expect(text).not.toContain("Precio");
    expect(text).toContain("Talla: te la confirmo por aquí");
  });

  it("con el WhatsApp PENDIENTE no hay link", () => {
    expect(productWhatsAppUrl({ ...store, whatsapp: "PENDIENTE" }, heat, "M")).toBeNull();
    expect(generalWhatsAppUrl({ ...store, whatsapp: "PENDIENTE" })).toBeNull();
  });
});

describe("productLabel", () => {
  it("leyendas con temporada", () => expect(productLabel(bySlug("lakers-bryant-24"))).toBe("Jersey Lakers · Kobe Bryant #24 (2009-10)"));
  it("76ers", () => expect(productLabel(bySlug("sixers-george-8"))).toBe("Jersey 76ers · Paul George #8"));
  it("conserva el 0", () => expect(productLabel(bySlug("celtics-tatum-0"))).toBe("Jersey Celtics · Jayson Tatum #0"));
  it("chaquetas y entrenamiento", () => {
    expect(productLabel(bySlug("chaqueta-thunder"))).toBe("Chaqueta Thunder");
    expect(productLabel(bySlug("esqueleto-nike-azul"))).toBe("Esqueleto Nike Dri-FIT (Azul rey)");
  });
});
