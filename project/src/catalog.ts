import { LIMIT } from "./config.js";
import { apiGetProducts } from "./api.js";
import { Product } from "./types.js";
import { qs, money, debounce } from "./utils.js";
import { addToCart } from "./storage.js";
import { initHeader, refreshCartBadge } from "./ui.js";

initHeader({ enableSearch: false });

const grid = qs<HTMLDivElement>("#grid");
const pagination = qs<HTMLDivElement>("#pagination");
const results = qs<HTMLSpanElement>("#results");

const searchInput = qs<HTMLInputElement>("#search");
const sortSelect = qs<HTMLSelectElement>("#sort");
const categorySelect = qs<HTMLSelectElement>("#category");
const applyBtn = qs<HTMLButtonElement>("#apply");

let page = 1;
let allProducts: any[] = [];
let q = "";
let category = "";
let sort = "popularity";

const urlParams = new URLSearchParams(location.search);
q = urlParams.get("q") ?? "";
category = urlParams.get("category") ?? "";
if (q) searchInput.value = q;
if (category) categorySelect.value = category;

function normalizeProducts(payload: any): Product[] {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.products,
    payload?.items,
    payload?.catalog,
    payload?.data,
    payload?.result,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  const nested = [
    payload?.catalog?.products,
    payload?.catalog?.items,
    payload?.products?.items,
  ];

  for (const c of nested) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

function card(p: Product) {
  const safeTitle = p.title ?? "Untitled";
  const safeThumb =
    (p as any).thumbnail ||
    (p as any).image ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=60";

  const r =
    typeof (p as any).rating === "number" && !Number.isNaN((p as any).rating)
      ? (p as any).rating
      : 0;

  const badge = (p as any).badge ?? "";

  return `
  <div class="rounded-2xl bg-white border border-slate-100 p-4 hover:shadow-sm transition">
    <div class="h-44 rounded-xl bg-slate-50 overflow-hidden">
      <img class="w-full h-full object-cover" src="${safeThumb}" alt="${safeTitle}">
    </div>

    <div class="mt-3 flex items-center justify-between">
      <h3 class="font-semibold text-slate-900 text-sm">${safeTitle}</h3>
      <span class="text-xs text-slate-500">★ ${r.toFixed(1)}</span>
    </div>

    <div class="mt-2 flex items-center justify-between">
      <div class="text-lg font-bold">${money((p as any).price ?? 0)}</div>
      <span class="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 ${badge ? "" : "hidden"}">${badge}</span>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <button data-open="${(p as any).id}" class="rounded-xl bg-slate-900 text-white py-2 text-xs font-semibold">View</button>
      <button data-add="${(p as any).id}" class="rounded-xl bg-blue-600 text-white py-2 text-xs font-semibold">Add to Cart</button>
    </div>
  </div>`;
}

function skeleton(n = 6) {
  grid.innerHTML = Array.from({ length: n })
    .map(
      () => `
    <div class="rounded-2xl bg-white border border-slate-100 p-4 animate-pulse">
      <div class="h-44 rounded-xl bg-slate-100"></div>
      <div class="mt-3 h-4 bg-slate-100 rounded"></div>
      <div class="mt-2 h-4 bg-slate-100 rounded w-1/2"></div>
      <div class="mt-4 h-9 bg-slate-100 rounded-xl"></div>
    </div>
  `,
    )
    .join("");
}

function renderPagination(total: number) {
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  pagination.innerHTML = "";

  const make = (label: string, p: number, disabled = false, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    btn.className =
      "w-9 h-9 rounded-xl border text-sm " +
      (active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50") +
      (disabled ? " opacity-40 cursor-not-allowed" : "");
    btn.onclick = () => {
      page = p;
      load();
    };
    return btn;
  };

  pagination.append(make("‹", page - 1, page === 1));

  for (let p = 1; p <= pages; p++) {
    pagination.append(make(String(p), p, false, p === page));
  }

  pagination.append(make("›", page + 1, page === pages));
}

function renderResults(total: number) {
  const start = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);
  results.textContent = `Showing ${start}-${end} of ${total} results`;
}

async function load() {
  skeleton(9);

  if (allProducts.length === 0) {
    const res = await apiGetProducts({}); 
    const data = res.data as any;
    allProducts = Array.isArray(data) ? data : [];
  }

  let filtered = allProducts;

  const query = q.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter((p: any) =>
      String(p.title ?? "")
        .toLowerCase()
        .includes(query),
    );
  }

  if (category && category !== "all") {
    const cat = category.toLowerCase();
    filtered = filtered.filter(
      (p: any) => String(p.category).toLowerCase() === cat,
    );
  }

  if (sort === "price_asc") {
    filtered = [...filtered].sort(
      (a: any, b: any) => (a.price ?? 0) - (b.price ?? 0),
    );
  } else if (sort === "price_desc") {
    filtered = [...filtered].sort(
      (a: any, b: any) => (b.price ?? 0) - (a.price ?? 0),
    );
  } else {
    filtered = [...filtered].sort(
      (a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0),
    );
  }

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  if (page > pages) page = pages;

  const startIndex = (page - 1) * LIMIT;
  const pageItems = filtered.slice(startIndex, startIndex + LIMIT);

  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const p of pageItems) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = card(p);
    if (wrapper.firstElementChild)
      fragment.appendChild(wrapper.firstElementChild);
  }
  grid.appendChild(fragment);

  grid.querySelectorAll<HTMLButtonElement>("[data-open]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.open ?? "";
      location.href = `productDetails.html?id=${encodeURIComponent(id)}`;
    };
  });

  grid.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.add ?? "";
      addToCart(id, 1);
      refreshCartBadge();
    };
  });

  renderResults(total);
  renderPagination(total);
}

applyBtn.onclick = () => {
  q = searchInput.value;
  category = categorySelect.value;
  sort = sortSelect.value;
  page = 1;
  load();
};

searchInput.addEventListener(
  "input",
  debounce(() => {
    q = searchInput.value;
    page = 1;
    load();
  }, 300),
);

console.log("CATALOG LOADED");
refreshCartBadge();
load();
