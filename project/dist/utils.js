export function qs(sel, root = document) {
    const el = root.querySelector(sel);
    if (!el)
        throw new Error(`Missing element: ${sel}`);
    return el;
}
export function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
}
export function getParam(name) {
    return new URLSearchParams(location.search).get(name);
}
export function money(n) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function debounce(fn, ms = 250) {
    let t;
    return (...args) => {
        if (t)
            window.clearTimeout(t);
        t = window.setTimeout(() => fn(...args), ms);
    };
}
