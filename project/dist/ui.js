import { cartCount, getAuthUser, setAuthUser } from "./storage.js";
import { debounce } from "./utils.js";
function ensureProfileModal() {
    let dlg = document.querySelector("#profileModal");
    if (dlg)
        return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "profileModal";
    dlg.className = "rounded-2xl p-0 w-[360px] backdrop:bg-black/30";
    dlg.innerHTML = `
    <div class="bg-white p-5">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs text-slate-500">Signed in as</p>
          <p id="pmName" class="mt-1 font-semibold text-slate-900">—</p>
          <p id="pmEmail" class="text-sm text-slate-500">—</p>
        </div>
        <button id="pmClose" class="w-9 h-9 rounded-xl border border-slate-200">✕</button>
      </div>

      <div class="mt-5 grid gap-2">
        <a href="./cart.html" class="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Go to cart</a>
        <button id="pmLogout" class="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">Logout</button>
      </div>
    </div>
  `;
    document.body.append(dlg);
    return dlg;
}
export function initHeader(opts = {}) {
    refreshCartBadge();
    const profileBtn = document.querySelector("#profileBtn");
    if (profileBtn) {
        profileBtn.onclick = (e) => {
            e.preventDefault();
            const user = getAuthUser();
            if (!user) {
                location.href = "register.html";
                return;
            }
            const dlg = ensureProfileModal();
            const name = dlg.querySelector("#pmName");
            const email = dlg.querySelector("#pmEmail");
            if (name)
                name.textContent = user.name;
            if (email)
                email.textContent = user.email;
            dlg.querySelector("#pmClose").onclick = () => dlg.close();
            dlg.querySelector("#pmLogout").onclick = () => {
                setAuthUser(null);
                dlg.close();
                location.href = "index.html";
            };
            dlg.showModal();
        };
    }
    const search = document.querySelector("#headerSearch");
    if (opts.enableSearch && search) {
        const go = () => {
            const q = search.value.trim();
            if (!q)
                return;
            location.href = `productCatalog.html?q=${encodeURIComponent(q)}`;
        };
        search.addEventListener("keydown", (e) => {
            if (e.key === "Enter")
                go();
        });
        search.addEventListener("input", debounce(() => {
        }, 250));
    }
}
export function refreshCartBadge() {
    const cartBadge = document.querySelector("#cartCount");
    if (!cartBadge)
        return;
    const n = cartCount();
    cartBadge.textContent = String(n);
    cartBadge.classList.toggle("hidden", n === 0);
}
export function requireAuth(redirectTo = "login.html") {
    const user = getAuthUser();
    if (!user) {
        location.href = redirectTo;
        return null;
    }
    return user;
}
