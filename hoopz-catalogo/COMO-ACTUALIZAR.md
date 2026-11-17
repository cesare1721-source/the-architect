# Cómo actualizar el catálogo HOOPZ

Todo lo que cambia (WhatsApp, precios, tallas, productos) vive en **dos archivos**:

- `src/data/store.ts`: datos de la tienda
- `src/data/products.ts`: los 19 productos

Puedes editarlos en GitHub: abre el archivo, toca el lápiz ✏️, cambia lo necesario y pulsa **"Commit changes"**. Si el sitio está conectado a Cloudflare Pages, se publica solo en ~1 minuto.

## 1. Número de WhatsApp (obligatorio para publicar)

En `src/data/store.ts` cambia `whatsapp: "PENDIENTE",` por tu número: **58 + el número sin el 0, sin espacios**.

| Tu número | Se escribe |
|---|---|
| 0414-123-4567 | `"584141234567"` |

Ahí mismo puedes poner `instagram: "hoopz.ve"` (sin @) y `shipping: "Envíos a toda Venezuela"`.

## 2. Precios y tallas

En `src/data/products.ts`, cada producto es una línea que termina en `...P` (precio y tallas pendientes). Agrega `price` y `sizes` **después** de `...P`:

```ts
{ slug: "lakers-bryant-24", ..., order: 1, ...P, price: 40, sizes: ["M", "L", "XL"] },
```

Sin precio, el catálogo dice "Precio por WhatsApp". Sin tallas, el cliente te la confirma por el chat.

**Agotado:** agrega `soldOut: true` al final de la línea.

## 3. La alineación titular (los 5 del inicio)

Cada producto tiene `lineup`: `1` a `5` para los titulares (en ese orden) y `null` para el resto. Para cambiar uno, pásale su número a otro producto y pon `null` al que sale. Siempre tiene que haber exactamente un 1, un 2, un 3, un 4 y un 5.

## 4. Producto nuevo (necesita computadora)

1. Foto con la prenda derecha, sobre **fondo liso**, con **luz pareja y sin flash**: frente y, si es jersey, espalda.
2. Guárdala como `assets-src/fotos/<nombre>-frente.jpg` (minúsculas y guiones, p. ej. `nuggets-jokic-15-frente.jpg`).
3. Recorta el fondo: `pnpm images nuggets-jokic-15-frente nuggets-jokic-15-espalda`
4. Copia una línea parecida en `products.ts` y cambia sus datos. `plate` es la placa del casillero (máx. 11 letras, p. ej. `"JOKIC 15"`). `accent` es el color de la prenda; los tests avisan si es muy oscuro.
5. `pnpm check:data`, `pnpm build` y `pnpm dev` para revisar.

## 5. Ver qué falta

`pnpm check:data` lista lo pendiente: WhatsApp, Instagram, envíos, precios y tallas.
