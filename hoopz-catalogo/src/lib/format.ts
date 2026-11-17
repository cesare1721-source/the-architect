export function formatPrice(n: number): string {
  return "$" + (Number.isInteger(n) ? String(n) : n.toFixed(2));
}
