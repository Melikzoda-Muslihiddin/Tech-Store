import { CartItem, Id } from "./types.js";

const CART_KEY = "techstore_cart";
const USER_KEY = "techstore_user";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(productId: Id, qty = 1) {
  const cart = getCart();
  const found = cart.find((i) => i.productId === productId);
  if (found) found.quantity += qty;
  else cart.push({ productId, quantity: qty });
  setCart(cart);
}

export function updateQty(productId: Id, qty: number) {
  const cart = getCart();
  const found = cart.find((i) => i.productId === productId);
  if (!found) return;
  found.quantity = Math.max(1, qty);
  setCart(cart);
}

export function removeFromCart(productId: Id) {
  setCart(getCart().filter((i) => i.productId !== productId));
}

export function clearCart() {
  setCart([]);
}

export function cartCount(): number {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}

export function setAuthUser(
  user: { id: Id; name: string; email: string } | null,
) {
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): {
  id: Id;
  name: string;
  email: string;
} | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw
      ? (JSON.parse(raw) as { id: Id; name: string; email: string })
      : null;
  } catch {
    return null;
  }
}
