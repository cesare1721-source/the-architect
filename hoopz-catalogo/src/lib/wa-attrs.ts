/** Atributos de un link de WhatsApp. Si el número sigue PENDIENTE, el botón queda inerte y avisa. */
export function waAttrs(url: string | null): Record<string, string> {
  if (!url) return { href: "#", "aria-disabled": "true", "data-wa-pending": "" };
  return { href: url, target: "_blank", rel: "noopener" };
}
