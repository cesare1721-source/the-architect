import type { Product } from "./schema";

// ✏️ EDITA AQUÍ precios (price) y tallas (sizes). Ver COMO-ACTUALIZAR.md
const P = { price: null, sizes: [] as string[], soldOut: false }; // valores PENDIENTES por defecto

export const products: Product[] = [
  // ── ACTUALES ──────────────────────────────────────────────
  { slug: "lakers-james-23", category: "actuales", title: "LeBron James", team: "Los Angeles Lakers", number: "23", plate: "JAMES 23", season: null, variant: "Dorada", accent: "#FDB927", images: { front: "lakers-james-23-frente", back: "lakers-james-23-espalda" }, lineup: 4, order: 1, ...P },
  { slug: "knicks-barrett-9", category: "actuales", title: "RJ Barrett", team: "New York Knicks", number: "9", plate: "BARRETT 9", season: null, variant: "Naranja", accent: "#F58426", images: { front: "knicks-barrett-9-frente", back: "knicks-barrett-9-espalda" }, lineup: null, order: 2, ...P },
  { slug: "mavericks-irving-11", category: "actuales", title: "Kyrie Irving", team: "Dallas Mavericks", number: "11", plate: "IRVING 11", season: null, variant: "Azul", accent: "#6E7CFF", images: { front: "mavericks-irving-11-frente", back: "mavericks-irving-11-espalda" }, lineup: null, order: 3, ...P },
  { slug: "rockets-sheppard-15", category: "actuales", title: "Reed Sheppard", team: "Houston Rockets", number: "15", plate: "SHEPPARD 15", season: null, variant: "City Edition · Blanca", accent: "#F0384F", images: { front: "rockets-sheppard-15-frente", back: "rockets-sheppard-15-espalda" }, lineup: null, order: 4, ...P },
  { slug: "heat-butler-22", category: "actuales", title: "Jimmy Butler", team: "Miami Heat", number: "22", plate: "BUTLER 22", season: null, variant: "Azul Vice", accent: "#F05BC0", images: { front: "heat-butler-22-frente", back: "heat-butler-22-espalda" }, lineup: 2, order: 5, ...P },
  { slug: "celtics-tatum-0", category: "actuales", title: "Jayson Tatum", team: "Boston Celtics", number: "0", plate: "TATUM 0", season: null, variant: "Negra", accent: "#2BB463", images: { back: "celtics-tatum-0-espalda" }, lineup: null, order: 6, ...P },
  { slug: "sixers-george-8", category: "actuales", title: "Paul George", team: "Philadelphia 76ers", number: "8", plate: "GEORGE 8", season: null, variant: "City Edition · Blanca", accent: "#5B7BF0", images: { front: "sixers-george-8-frente", back: "sixers-george-8-espalda" }, lineup: null, order: 7, ...P },
  { slug: "grizzlies-morant-12", category: "actuales", title: "Ja Morant", team: "Memphis Grizzlies", number: "12", plate: "MORANT 12", season: null, variant: "Azul marino", accent: "#8FB0DB", images: { front: "grizzlies-morant-12-frente", back: "grizzlies-morant-12-espalda" }, lineup: null, order: 8, ...P },
  { slug: "wizards-poole-13", category: "actuales", title: "Jordan Poole", team: "Washington Wizards", number: "13", plate: "POOLE 13", season: null, variant: "City Edition · Celeste", accent: "#EE3346", images: { front: "wizards-poole-13-frente", back: "wizards-poole-13-espalda" }, lineup: null, order: 9, ...P },

  // ── LEYENDAS (RETRO) ──────────────────────────────────────
  { slug: "lakers-bryant-24", category: "retro", title: "Kobe Bryant", team: "Los Angeles Lakers", number: "24", plate: "BRYANT 24", season: "2009-10", variant: "Blanca", accent: "#FDB927", images: { front: "lakers-bryant-24-frente", back: "lakers-bryant-24-espalda" }, lineup: 1, order: 1, ...P },
  { slug: "celtics-bird-33", category: "retro", title: "Larry Bird", team: "Boston Celtics", number: "33", plate: "BIRD 33", season: "1985-86", variant: "Negra y verde", accent: "#2BB463", images: { front: "celtics-bird-33-frente", back: "celtics-bird-33-espalda" }, lineup: 3, order: 2, ...P },
  { slug: "bulls-rodman-91", category: "retro", title: "Dennis Rodman", team: "Chicago Bulls", number: "91", plate: "RODMAN 91", season: null, variant: "Roja", accent: "#F0384F", images: { front: "bulls-rodman-91-frente", back: "bulls-rodman-91-espalda" }, lineup: 5, order: 3, ...P },

  // ── CHAQUETAS ─────────────────────────────────────────────
  { slug: "chaqueta-thunder", category: "chaquetas", title: "Chaqueta Thunder", team: "Oklahoma City Thunder", number: null, plate: "THUNDER", season: null, variant: "Azul · con capucha", accent: "#2C9BE0", images: { front: "chaqueta-thunder-frente", back: "chaqueta-thunder-espalda" }, lineup: null, order: 1, ...P },
  { slug: "chaqueta-lakers", category: "chaquetas", title: "Chaqueta Lakers", team: "Los Angeles Lakers", number: null, plate: "LAKERS", season: null, variant: "Morada · con capucha", accent: "#B48CFF", images: { front: "chaqueta-lakers-frente", back: "chaqueta-lakers-espalda" }, lineup: null, order: 2, ...P },

  // ── ENTRENAMIENTO ─────────────────────────────────────────
  { slug: "esqueleto-nike-negro", category: "entrenamiento", title: "Esqueleto Nike Dri-FIT", team: null, number: null, plate: "DRI-FIT", season: null, variant: "Negro · logo dorado", accent: "#D9B54A", images: { front: "esqueleto-nike-negro-frente" }, lineup: null, order: 1, ...P },
  { slug: "esqueleto-adidas-negro", category: "entrenamiento", title: "Esqueleto Adidas", team: null, number: null, plate: "ADIDAS", season: null, variant: "Negro · detalles reflectivos", accent: "#A58BEA", images: { front: "esqueleto-adidas-negro-frente" }, lineup: null, order: 2, ...P },
  { slug: "esqueleto-nike-azul", category: "entrenamiento", title: "Esqueleto Nike Dri-FIT", team: null, number: null, plate: "DRI-FIT", season: null, variant: "Azul rey", accent: "#5C7CFF", images: { front: "esqueleto-nike-azul-frente" }, lineup: null, order: 3, ...P },
  { slug: "franela-nike-gris", category: "entrenamiento", title: "Franela Nike Running", team: null, number: null, plate: "RUNNING", season: null, variant: "Gris azulado", accent: "#9AA0D4", images: { front: "franela-nike-gris-frente" }, lineup: null, order: 4, ...P },
  { slug: "franela-adidas-beige", category: "entrenamiento", title: "Franela Adidas", team: null, number: null, plate: "ADIDAS", season: null, variant: "Beige", accent: "#F2643A", images: { front: "franela-adidas-beige-frente" }, lineup: null, order: 5, ...P },
];
