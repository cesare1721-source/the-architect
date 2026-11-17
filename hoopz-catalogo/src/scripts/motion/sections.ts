import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/** Títulos de sección: las palabras suben desde su máscara al entrar. */
export function initHeadings() {
  const splits = gsap.utils.toArray<HTMLElement>("[data-split-words]").map((h) => {
    const s = SplitText.create(h, { type: "words", mask: "words" });
    gsap.from(s.words, { yPercent: 115, duration: 0.9, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: h, start: "top 86%", once: true } });
    return s;
  });
  return () => splits.forEach((s) => s.revert());
}

/** Barrido de luz sobre el logo del cierre, una vez. */
export function initFooterSweep() {
  const wrap = document.querySelector<HTMLElement>("[data-logo-sweep]");
  const sweep = wrap?.querySelector("[data-sweep]");
  if (!wrap || !sweep) return;
  gsap.fromTo(sweep, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: wrap, start: "top 85%", once: true } });
}

/** Botón flotante de WhatsApp: aparece al terminar la alineación (no tapa sus rótulos); un solo pulso. */
export function initFab() {
  const fab = document.querySelector<HTMLElement>("[data-fab]");
  const cover = document.querySelector("[data-lineup]");
  if (!fab || !cover) return; // en la página de producto queda siempre visible
  const ring = fab.querySelector("[data-fab-ring]");
  gsap.set(fab, { autoAlpha: 0, scale: 0.6 });
  let pulsed = false;
  const st = ScrollTrigger.create({
    trigger: cover,
    start: "bottom 85%",
    onEnter: () => {
      gsap.to(fab, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "expo.out", overwrite: true });
      if (!pulsed && ring) {
        pulsed = true;
        gsap.fromTo(ring, { scale: 1, opacity: 0.8 }, { scale: 1.8, opacity: 0, duration: 1, ease: "power2.out", delay: 0.3 });
      }
    },
    onLeaveBack: () => gsap.to(fab, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.in", overwrite: true }),
  });
  return () => {
    st.kill();
    gsap.set(fab, { clearProps: "all" });
  };
}
