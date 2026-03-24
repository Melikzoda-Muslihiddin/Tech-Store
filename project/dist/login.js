import { apiSearchUser } from "./api.js";
import { qs } from "./utils.js";
import { setAuthUser } from "./storage.js";
import { initHeader } from "./ui.js";
initHeader({ enableSearch: false });
const email = qs("#email");
const password = qs("#password");
const btn = qs("#loginBtn");
const error = qs("#error");
const emailFromUrl = new URLSearchParams(location.search).get("email");
if (emailFromUrl)
    email.value = emailFromUrl;
btn.onclick = async () => {
    error.textContent = "";
    const u = await apiSearchUser(email.value.trim(), password.value.trim());
    if (!u) {
        error.textContent = "Invalid credentials";
        return;
    }
    setAuthUser({ id: u.id, name: u.name, email: u.email });
    location.href = "index.html";
};
