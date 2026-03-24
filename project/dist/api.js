import { BASE_URL } from "./config.js";
export async function apiGetProducts(params) {
    return axios.get(`${BASE_URL}/products`, { params });
}
export async function apiGetProduct(id) {
    const res = await axios.get(`${BASE_URL}/products/${id}`);
    return res.data;
}
export async function apiSearchUser(email, password) {
    const res = await axios.get(`${BASE_URL}/users`, {
        params: { email, password },
    });
    return res.data[0] ?? null;
}
export async function apiGetUserByEmail(email) {
    const res = await axios.get(`${BASE_URL}/users`, {
        params: { email },
    });
    return res.data[0] ?? null;
}
export async function apiRegisterUser(payload) {
    const res = await axios.post(`${BASE_URL}/users`, payload);
    return res.data;
}
export async function apiGetProductsByIds(ids) {
    const uniq = Array.from(new Set(ids));
    const products = await Promise.all(uniq.map((id) => apiGetProduct(id)));
    return products;
}
