import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { initRadioGroups } from "./ui/radiogroup";
import { initDetails } from "./ui/detail";
import { initFilter } from "./ui/filter";
import { initSheet } from "./ui/sheet";
import { initIntro } from "./motion/intro";
import { initSmoothScroll } from "./motion/smooth-scroll";
import { initHeader } from "./motion/header";
import { initLineup } from "./motion/lineup";
import { initTicker } from "./motion/ticker";
import { initLockers } from "./motion/lockers";
import { initPlay } from "./motion/play";
import { initFab, initFooterSweep, initHeadings } from "./motion/sections";
import { scrollToEl } from "./state";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Interacción: funciona con o sin animaciones ───────────────
initRadioGroups();
initDetails();
initFilter();
initSheet();
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-scroll-to]");
  const target = a && document.querySelector(a.hash);
  if (!target) return;
  e.preventDefault();
  scrollToEl(target);
});

// ── Motion: solo si no se pidió reducir movimiento ────────────
const mm = gsap.matchMedia();
mm.add(
  {
    always: "all", // con sintaxis de objeto el callback solo corre si alguna condición se cumple
    motion: "(prefers-reduced-motion: no-preference)",
    fine: "(pointer: fine)",
  },
  (ctx) => {
    const { motion, fine } = ctx.conditions as Record<string, boolean>;
    initIntro(); // sin intro pendiente solo limpia el DOM
    if (!motion) return;
    const cleanups: (void | (() => void))[] = [];
    if (fine) cleanups.push(initSmoothScroll());
    cleanups.push(initHeader(), initTicker());
    // SplitText necesita las fuentes cargadas para medir bien
    document.fonts.ready.then(() =>
      ctx.add(() => {
        // el botón flotante después de la escena fija: su posición depende del espacio que esta ocupa
        cleanups.push(initLineup(), initFab(), initHeadings(), initLockers(), initPlay());
        initFooterSweep();
        ScrollTrigger.refresh();
      }),
    );
    return () => cleanups.forEach((c) => c?.());
  },
);
