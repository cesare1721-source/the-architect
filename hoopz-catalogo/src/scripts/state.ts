import type Lenis from "lenis";

/** Estado compartido entre módulos de cliente. */
export const state: { lenis: Lenis | null } = { lenis: null };

export const prefersMotion = () => matchMedia("(prefers-reduced-motion: no-preference)").matches;

export function scrollToEl(el: Element, offset = 0) {
  if (state.lenis) state.lenis.scrollTo(el as HTMLElement, { offset });
  else scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: prefersMotion() ? "smooth" : "auto" });
}

export function lockScroll(lock: boolean) {
  document.documentElement.classList.toggle("sheet-open", lock);
  if (lock) state.lenis?.stop();
  else state.lenis?.start();
}
