// Servidor estático mínimo (con gzip, como Cloudflare) para pruebas y Lighthouse.
// Uso: node scripts/serve-static.mjs <carpeta> <puerto>
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createGzip } from "node:zlib";

const root = resolve(process.argv[2] ?? "dist");
const port = Number(process.argv[3] ?? 4321);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".txt": "text/plain",
};

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  else if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  const found = existsSync(file) && file.startsWith(root);
  if (!found) file = join(root, "404.html");
  const type = types[extname(file)] ?? "application/octet-stream";
  const gzip = /text|javascript|json|svg/.test(type) && /gzip/.test(String(req.headers["accept-encoding"]));
  res.writeHead(found ? 200 : 404, { "content-type": type, ...(gzip ? { "content-encoding": "gzip" } : {}) });
  (gzip ? createReadStream(file).pipe(createGzip()) : createReadStream(file)).pipe(res);
}).listen(port, () => console.log(`Sirviendo ${root} en http://localhost:${port}`));
