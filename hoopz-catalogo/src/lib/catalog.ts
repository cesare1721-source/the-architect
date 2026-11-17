import { z } from "zod";
import { CATEGORIES, productSchema, storeSchema, type Category, type Product, type Store } from "@/data/schema";
import { store as rawStore } from "@/data/store";
import { products as rawProducts } from "@/data/products";

/** Build de tests E2E: datos ficticios solo en memoria (nunca toca los archivos). */
const TEST_FIXTURES = import.meta.env?.PUBLIC_TEST_FIXTURES === "1";

function parse<T>(schema: z.ZodType<T>, data: unknown, what: string): T {
  const r = schema.safeParse(data);
  if (!r.success) throw new Error(`Datos inválidos en ${what}:\n${z.prettifyError(r.error)}`);
  return r.data;
}

export function getStore(): Store {
  const s = parse(storeSchema, rawStore, "src/data/store.ts");
  return TEST_FIXTURES ? { ...s, whatsapp: "580000000000" } : s;
}

let cache: Product[] | null = null;

export function getProducts(): Product[] {
  if (cache) return cache;
  let list = parse(z.array(productSchema), rawProducts, "src/data/products.ts");
  if (TEST_FIXTURES) list = list.map((p) => ({ ...p, price: p.price ?? 35, sizes: p.sizes.length ? p.sizes : ["S", "M", "L", "XL"] }));
  const slugs = new Set<string>();
  for (const p of list) {
    if (slugs.has(p.slug)) throw new Error(`Slug repetido en products.ts: "${p.slug}"`);
    slugs.add(p.slug);
  }
  const lineup = list.filter((p) => p.lineup !== null).map((p) => p.lineup).sort();
  if (lineup.join() !== "1,2,3,4,5") throw new Error(`La alineación (lineup) debe usar 1, 2, 3, 4 y 5 una vez cada uno (hay: ${lineup.join(", ")})`);
  cache = [...list].sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.order - b.order);
  return cache;
}

export const getProduct = (slug: string) => getProducts().find((p) => p.slug === slug);

/** Los 5 titulares del inicio, en orden. */
export const lineup = () => getProducts().filter((p) => p.lineup !== null).sort((a, b) => a.lineup! - b.lineup!);

export const byCategory = (c: Category) => getProducts().filter((p) => p.category === c);

export function countsByCategory(): Record<Category | "todo", number> {
  const list = getProducts();
  const counts = { todo: list.length } as Record<Category | "todo", number>;
  for (const c of CATEGORIES) counts[c] = list.filter((p) => p.category === c).length;
  return counts;
}

export function related(p: Product, n = 4): Product[] {
  const others = getProducts().filter((x) => x.slug !== p.slug);
  return [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category && x.category === "actuales")].slice(0, n);
}
