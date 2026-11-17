import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { state } from "../state";

/** Lenis solo en desktop (pointer: fine). En táctil, el scroll nativo. */
export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.1 });
  state.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
    state.lenis = null;
  };
}
