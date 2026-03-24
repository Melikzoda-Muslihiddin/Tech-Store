export type Category = "gaming" | "business" | "student" | "ultrabooks";

export type Id = string;

export interface Product {
  id: Id;
  title: string;
  category: Category;
  price: number;
  rating: number;
  stock: number;
  badge?: string;
  thumbnail: string;
  description: string;
  images?: string[];
  colors?: string[];
}

export interface User {
  id: Id;
  name: string;
  email: string;
  password: string;
}

export interface CartItem {
  productId: Id;
  quantity: number;
}
