import { apiGetProducts } from "./api.js";
import { Product } from "./types.js";
import { addToCart } from "./storage.js";
import { money, qs } from "./utils.js";
import { initHeader, refreshCartBadge } from "./ui.js";

initHeader({ enableSearch: true });

const categoriesWrap = document.querySelector<HTMLDivElement>("#categories");
const viewAllBtn = document.querySelector<HTMLButtonElement>("#viewAllCategories");
const popularWrap = document.querySelector<HTMLDivElement>("#popular");

const CATEGORIES: {
  key: string;
  title: string;
  desc: string;
  img: string;
}[] = [
  {
    key: "gaming",
    title: "Gaming",
    desc: "High refresh rates & GPU power",
    img: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "business",
    title: "Business",
    desc: "Security & all-day battery",
    img: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "student",
    title: "Student",
    desc: "Lightweight & affordable",
    img: "https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "ultrabooks",
    title: "Ultrabooks",
    desc: "Premium design & performance",
    img: "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "gaming",
    title: "Workstations",
    desc: "For heavy workloads",
    img: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "business",
    title: "Creators",
    desc: "Color accurate screens",
    img: "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "student",
    title: "Budget",
    desc: "Best price/value",
    img: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    key: "ultrabooks",
    title: "Portable",
    desc: "Ultra light laptops",
    img: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
  },
];

let showAllCats = false;

function categoryCard(c: (typeof CATEGORIES)[number]) {
  return `
  <button data-cat="${c.key}" class="text-left rounded-2xl bg-white border border-slate-100 p-4 hover:shadow-sm transition">
    <div class="flex items-center gap-3">
      <span class="inline-flex w-9 h-9 rounded-xl bg-blue-50"></span>
      <div>
        <p class="font-semibold">${c.title}</p>
        <p class="text-xs text-slate-500">${c.desc}</p>
      </div>
    </div>
    <div class="mt-4 h-36 rounded-2xl overflow-hidden bg-slate-50">
      <img class="w-full h-full object-cover" src="${c.img}" alt="${c.title}">
    </div>
  </button>`;
}

function renderCategories() {
  if (!categoriesWrap) return;
  const list = showAllCats ? CATEGORIES : CATEGORIES.slice(0, 4);
  categoriesWrap.innerHTML = list.map(categoryCard).join("");
  categoriesWrap.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((b) => {
    b.onclick = () => {
      const cat = b.dataset.cat ?? "";
      location.href = `productCatalog.html?category=${encodeURIComponent(cat)}`;
    };
  });

  if (viewAllBtn) viewAllBtn.textContent = showAllCats ? "Hide" : "View all";
}

function popularCard(p: Product) {
  return `
  <div class="rounded-2xl bg-white border border-slate-100 overflow-hidden">
    <button data-open="${p.id}" class="block w-full text-left">
      <div class="h-40 bg-slate-50">
        <img class="w-full h-full object-cover" src="${p.thumbnail}" alt="${p.title}">
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold">${p.title}</p>
            <p class="text-xs text-slate-500">${p.description}</p>
          </div>
          <span class="text-sm font-bold text-blue-600">${money(p.price)}</span>
        </div>
      </div>
    </button>
    <div class="px-4 pb-4">
      <button data-add="${p.id}" class="w-full rounded-xl bg-slate-900 text-white py-2 text-xs font-semibold">Add to Cart</button>
    </div>
  </div>`;
}

async function loadPopular() {
  if (!popularWrap) return;
  popularWrap.innerHTML = Array.from({ length: 4 })
    .map(
      () =>
        `<div class="rounded-2xl bg-white border border-slate-100 p-4 animate-pulse"><div class="h-40 bg-slate-100 rounded-xl"></div><div class="mt-4 h-4 bg-slate-100 rounded"></div><div class="mt-2 h-4 bg-slate-100 rounded w-2/3"></div></div>`,
    )
    .join("");

  const newLocal = "price";
  const newLocal_1 = "desc";
  const res = await apiGetProducts({ _page: 1, _per_page: 4, _sort: newLocal, _order: newLocal_1 });
  const items = res.data;
  popularWrap.innerHTML = items.map(popularCard).join("");

  popularWrap.querySelectorAll<HTMLButtonElement>("[data-open]").forEach((b) => {
    b.onclick = () => {
      location.href = `productDetails.html?id=${encodeURIComponent(b.dataset.open ?? "")}`;
    };
  });

  popularWrap.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.add ?? "";
      addToCart(id, 1);
      refreshCartBadge();
    };
  });
}

viewAllBtn && (viewAllBtn.onclick = () => {
  showAllCats = !showAllCats;
  renderCategories();
});

renderCategories();
loadPopular();
