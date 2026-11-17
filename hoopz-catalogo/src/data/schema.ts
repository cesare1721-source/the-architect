import { z } from "zod";

export const CATEGORIES = ["actuales", "retro", "chaquetas", "entrenamiento"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  actuales: "Actuales",
  retro: "Leyendas",
  chaquetas: "Chaquetas",
  entrenamiento: "Entrenamiento",
};

export const storeSchema = z.object({
  name: z.string(),
  whatsapp: z.union([
    z.literal("PENDIENTE"),
    z.string().regex(/^58\d{10}$/, "Formato: 58 + 10 dígitos, ej. 584141234567"),
  ]),
  instagram: z.string().regex(/^[A-Za-z0-9._]+$/, "Usuario de Instagram sin @").nullable(),
  location: z.string(),
  shipping: z.string().nullable(),
  currency: z.literal("USD"),
  siteUrl: z.url(),
  cfAnalyticsToken: z.string().nullable(),
});

export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORIES),
  title: z.string(),
  team: z.string().nullable(),
  number: z.string().nullable(),
  /** placa del casillero: "BRYANT 24", "THUNDER" (mayúsculas, corta) */
  plate: z.string().max(14),
  season: z.string().nullable(),
  variant: z.string(),
  /** color de la prenda (≥ 4.5:1 sobre #08080A): foco, número, placa */
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  images: z
    .object({ front: z.string().optional(), back: z.string().optional() })
    .refine((i) => i.front || i.back, "Cada producto necesita al menos una imagen"),
  price: z.number().positive().nullable(),
  sizes: z.array(z.string()),
  soldOut: z.boolean(),
  /** posición en la alineación titular del inicio (1-5) o null */
  lineup: z.number().int().min(1).max(5).nullable(),
  order: z.number().int(),
});

export type Store = z.infer<typeof storeSchema>;
export type Product = z.infer<typeof productSchema>;
