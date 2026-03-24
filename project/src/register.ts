import { apiGetUserByEmail, apiRegisterUser } from "./api.js";
import { qs } from "./utils.js";
import { setAuthUser } from "./storage.js";
import { initHeader } from "./ui.js";

initHeader({ enableSearch: false });

const nameEl = qs<HTMLInputElement>("#name");
const emailEl = qs<HTMLInputElement>("#email");
const passEl = qs<HTMLInputElement>("#password");
const btn = qs<HTMLButtonElement>("#registerBtn");
const error = qs<HTMLElement>("#error");

btn.onclick = async () => {
  error.textContent = "";
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  if (!name || !email || password.length < 4) {
    error.textContent = "Fill all fields (password min 4)";
    return;
  }

  const exists = await apiGetUserByEmail(email);
  if (exists) {
    location.href = `login.html?email=${encodeURIComponent(email)}`;
    return;
  }

  const u = await apiRegisterUser({ name, email, password });
  setAuthUser({ id: u.id, name: u.name, email: u.email });
  location.href = "index.html";
};