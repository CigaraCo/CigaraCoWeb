
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string | null;
  image_url?: string;
  image?: string;
  stock: number | null;
  price_diff?: number | null;
  created_at?: string;
}

export type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  images: string[];
  category: string;
  featured: boolean;
  stock: number | null;
  variants?: ProductVariant[];
  created_at: string | null;
};

export interface OrderItem {
  id: string;
  order_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  name: string | null;
  quantity: number | null;
  price: number | null;
}

export interface Order {
  id: string;
  user_id: string;
  status: string | null;
  total: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  created_at: string | null;
  customer?: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items?: OrderItem[];
}
