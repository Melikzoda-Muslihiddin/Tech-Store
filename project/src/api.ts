import { BASE_URL } from "./config.js";
import { Id, Product, User } from "./types.js";

type HeadersMap = Record<string, string>;

type AxiosResponse<T> = {
  data: T;
  headers: HeadersMap;
};

type AxiosStatic = {
  get<T>(
    url: string,
    config?: { params?: Record<string, string | number | boolean> },
  ): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
};

declare const axios: AxiosStatic;

export async function apiGetProducts(
  params: Record<string, string | number | boolean>,
) {
  return axios.get<Product[]>(`${BASE_URL}/products`, { params });
}

export async function apiGetProduct(id: Id) {
  const res = await axios.get<Product>(`${BASE_URL}/products/${id}`);
  return res.data;
}

export async function apiSearchUser(email: string, password: string) {
  const res = await axios.get<User[]>(`${BASE_URL}/users`, {
    params: { email, password },
  });
  return res.data[0] ?? null;
}

export async function apiGetUserByEmail(email: string) {
  const res = await axios.get<User[]>(`${BASE_URL}/users`, {
    params: { email },
  });
  return res.data[0] ?? null;
}

export async function apiRegisterUser(payload: Omit<User, "id">) {
  const res = await axios.post<User>(`${BASE_URL}/users`, payload);
  return res.data;
}

export async function apiGetProductsByIds(ids: Id[]) {
  const uniq = Array.from(new Set(ids));
  const products = await Promise.all(uniq.map((id) => apiGetProduct(id)));
  return products;
}
