import { apiGetProduct, apiGetProducts } from "./api.js";
import { qs, getParam, money } from "./utils.js";
import { addToCart } from "./storage.js";
import { initHeader, refreshCartBadge } from "./ui.js";
initHeader({ enableSearch: false });
const mainImg = qs("#mainImg");
const thumbs = qs("#thumbs");
const titleEl = qs("#title");
const priceEl = qs("#price");
const descEl = qs("#desc");
const addBtn = qs("#addBtn");
const buyBtn = qs("#buyBtn");
const similar = qs("#similar");
const crumb = document.querySelector("#titleCrumb");
const colorsWrap = document.querySelector("#colors");
const DEFAULT_COLORS = ["#111827", "#2563EB", "#10B981", "#F59E0B", "#EF4444"];
function renderThumb(src, active = false) {
    const btn = document.createElement("button");
    btn.className =
        "h-16 w-24 rounded-xl overflow-hidden border " +
            (active ? "border-blue-600" : "border-slate-200");
    btn.innerHTML = `<img class="w-full h-full object-cover" src="${src}" alt="thumb">`;
    btn.onclick = () => {
        mainImg.src = src;
        thumbs
            .querySelectorAll("button")
            .forEach((b) => b.classList.remove("border-blue-600"));
        btn.classList.add("border-blue-600");
    };
    return btn;
}
function similarCard(p) {
    return `
  <div class="bg-white rounded-2xl border border-slate-100 p-4">
    <div class="h-36 rounded-xl bg-slate-50 overflow-hidden">
      <img class="w-full h-full object-cover" src="${p.thumbnail}" alt="${p.title}">
    </div>
    <div class="mt-3 flex items-center justify-between">
      <div class="text-sm font-semibold">${p.title}</div>
      <div class="text-xs text-slate-500">★ ${p.rating.toFixed(1)}</div>
    </div>
    <div class="mt-2 flex items-center justify-between">
      <div class="font-bold">${money(p.price)}</div>
      <button data-open="${p.id}" class="w-9 h-9 rounded-xl bg-blue-600 text-white">+</button>
    </div>
  </div>`;
}
async function load() {
    const idStr = getParam("id");
    if (!idStr)
        throw new Error("Missing id param");
    const id = idStr;
    const p = await apiGetProduct(id);
    titleEl.textContent = p.title;
    priceEl.textContent = money(p.price);
    descEl.textContent = p.description;
    if (crumb)
        crumb.textContent = p.title;
    mainImg.src = p.thumbnail;
    thumbs.innerHTML = "";
    const images = p.images && p.images.length ? p.images : [p.thumbnail];
    images.forEach((src, idx) => thumbs.append(renderThumb(src, idx === 0)));
    mainImg.src = images[0];
    if (colorsWrap) {
        const colors = p.colors && p.colors.length ? p.colors : DEFAULT_COLORS;
        colorsWrap.innerHTML = colors
            .map((c, idx) => `<button data-color="${c}" title="${c}" class="w-9 h-9 rounded-full border ${idx === 0 ? "border-blue-600" : "border-slate-200"}" style="background:${c}"></button>`)
            .join("");
        colorsWrap.querySelectorAll("[data-color]").forEach((b) => {
            b.onclick = () => {
                colorsWrap
                    .querySelectorAll("button")
                    .forEach((x) => x.classList.remove("border-blue-600"));
                b.classList.add("border-blue-600");
            };
        });
    }
    const res = await apiGetProducts({
        _page: 1,
        _limit: 4,
        category: p.category,
        _sort: "rating",
        _order: "desc",
    });
    const sim = res.data.filter((x) => x.id !== p.id);
    similar.innerHTML = sim.map(similarCard).join("");
    similar.querySelectorAll("[data-open]").forEach((btn) => {
        btn.onclick = () => {
            const nextId = Number(btn.dataset.open);
            location.href = `productDetails.html?id=${nextId}`;
        };
    });
    addBtn.onclick = () => {
        addToCart(p.id, 1);
        refreshCartBadge();
    };
    buyBtn.onclick = () => {
        addToCart(p.id, 1);
        refreshCartBadge();
        location.href = "cart.html";
    };
    refreshCartBadge();
}
load();
