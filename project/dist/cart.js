import { apiGetProduct } from "./api.js";
import { SHIPPING, TAX_RATE } from "./config.js";
import { qs, money } from "./utils.js";
import { getCart, updateQty, removeFromCart } from "./storage.js";
import { initHeader, refreshCartBadge } from "./ui.js";
initHeader({ enableSearch: false });
const rows = qs("#cartRows");
const subtotalEl = qs("#subtotal");
const shippingEl = qs("#shipping");
const taxEl = qs("#tax");
const totalEl = qs("#total");
const checkoutBtn = qs("#checkoutBtn");
function row(line) {
    const p = line.product;
    return `
  <div class="grid grid-cols-12 items-center gap-4 py-4 border-b border-slate-100">
    <div class="col-span-5 flex items-center gap-4">
      <div class="h-16 w-16 rounded-xl bg-slate-50 overflow-hidden">
        <img class="w-full h-full object-cover" src="${p.thumbnail}" alt="${p.title}">
      </div>
      <div>
        <div class="font-semibold">${p.title}</div>
        <div class="text-xs text-slate-500">${p.category}</div>
      </div>
    </div>

    <div class="col-span-4 flex items-center gap-2">
      <button data-dec="${p.id}" class="w-9 h-9 rounded-xl border border-slate-200 bg-white">-</button>
      <div class="w-10 text-center font-semibold">${line.qty}</div>
      <button data-inc="${p.id}" class="w-9 h-9 rounded-xl border border-slate-200 bg-white">+</button>
      <button data-del="${p.id}" class="ml-2 w-9 h-9 rounded-xl border border-slate-200 bg-white">🗑</button>
    </div>

    <div class="col-span-3 text-right font-bold">${money(p.price * line.qty)}</div>
  </div>`;
}
async function load() {
    const cart = getCart();
    if (cart.length === 0) {
        rows.innerHTML = `<div class="py-10 text-center text-slate-500">Cart is empty</div>`;
        subtotalEl.textContent = money(0);
        shippingEl.textContent = money(0);
        taxEl.textContent = money(0);
        totalEl.textContent = money(0);
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add("opacity-50");
        refreshCartBadge();
        return;
    }
    const lines = [];
    for (const item of cart) {
        const product = await apiGetProduct(item.productId);
        lines.push({ product, qty: item.quantity });
    }
    rows.innerHTML = lines.map(row).join("");
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const shipping = subtotal > 0 ? SHIPPING : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;
    subtotalEl.textContent = money(subtotal);
    shippingEl.textContent = money(shipping);
    taxEl.textContent = money(tax);
    totalEl.textContent = money(total);
    rows.querySelectorAll("[data-inc]").forEach((b) => {
        b.onclick = () => {
            const id = b.dataset.inc ?? "";
            const cur = getCart().find((i) => i.productId === id)?.quantity ?? 1;
            updateQty(id, cur + 1);
            load();
        };
    });
    rows.querySelectorAll("[data-dec]").forEach((b) => {
        b.onclick = () => {
            const id = b.dataset.dec ?? "";
            const cur = getCart().find((i) => i.productId === id)?.quantity ?? 1;
            updateQty(id, Math.max(1, cur - 1));
            load();
        };
    });
    rows.querySelectorAll("[data-del]").forEach((b) => {
        b.onclick = () => {
            const id = b.dataset.del ?? "";
            removeFromCart(id);
            load();
        };
    });
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove("opacity-50");
    checkoutBtn.onclick = () => alert("Checkout (demo)");
    refreshCartBadge();
}
load();
