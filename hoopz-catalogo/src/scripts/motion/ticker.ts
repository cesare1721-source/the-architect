import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Cinta EN VIVO: corre sola; el scroll la acelera y le cambia el sentido. */
export function initTicker() {
  const track = document.querySelector<HTMLElement>("[data-ticker]");
  if (!track) return;
  const half = track.scrollWidth / 2;
  const tween = gsap.fromTo(track, { x: 0 }, { x: -half, duration: half / 45, ease: "none", repeat: -1 });
  const st = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (Math.abs(v) < 20) return;
      const dir = v > 0 ? 1 : -1;
      gsap.to(tween, { timeScale: dir * gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 700), duration: 0.15, overwrite: true });
      gsap.to(tween, { timeScale: dir, duration: 0.8, delay: 0.15 });
    },
  });
  return () => {
    st.kill();
    tween.kill();
  };
}
