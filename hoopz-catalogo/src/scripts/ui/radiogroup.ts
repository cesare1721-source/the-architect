/** Flechas del teclado en cualquier [role=radiogroup] (filtros y tallas). Activa con click(). */
export function initRadioGroups() {
  document.addEventListener("keydown", (e) => {
    const radio = (e.target as HTMLElement).closest<HTMLElement>('[role="radio"]');
    const group = radio?.closest('[role="radiogroup"]');
    const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (!radio || !group || !step) return;
    e.preventDefault();
    const radios = [...group.querySelectorAll<HTMLElement>('[role="radio"]')];
    const next = radios[(radios.indexOf(radio) + step + radios.length) % radios.length]!;
    next.focus();
    next.click();
  });
}

export function checkRadio(group: Element, radio: Element) {
  for (const r of group.querySelectorAll('[role="radio"]')) {
    const on = r === radio;
    r.setAttribute("aria-checked", String(on));
    r.setAttribute("tabindex", on ? "0" : "-1");
  }
}
