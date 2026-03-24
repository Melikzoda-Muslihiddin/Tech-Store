export function qs<T extends Element>(
  sel: string,
  root: Document | Element = document,
): T {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el as T;
}

export function qsa<T extends Element>(
  sel: string,
  root: Document | Element = document,
): T[] {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

export function getParam(name: string): string | null {
  return new URLSearchParams(location.search).get(name);
}

export function money(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function debounce<F extends (...args: any[]) => void>(fn: F, ms = 250) {
  let t: number | undefined;
  return (...args: Parameters<F>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}
