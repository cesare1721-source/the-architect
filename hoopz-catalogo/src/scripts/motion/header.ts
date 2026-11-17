import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** El header se oculta al bajar y vuelve al subir; siempre visible arriba del todo. */
export function initHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;
  const html = document.documentElement;
  let hidden = false;
  const set = (hide: boolean) => {
    if (hide === hidden) return;
    hidden = hide;
    html.classList.toggle("header-hidden", hide);
    gsap.to(header, { yPercent: hide ? -100 : 0, duration: 0.25, ease: "power3.out", overwrite: true });
  };
  const st = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      if (!html.classList.contains("sheet-open")) set(self.scroll() > innerHeight * 0.6 && self.direction === 1);
    },
  });
  return () => {
    st.kill();
    html.classList.remove("header-hidden");
  };
}
