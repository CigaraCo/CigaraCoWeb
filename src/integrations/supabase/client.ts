// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gberhjjwltvpdttflgfi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXJoamp3bHR2cGR0dGZsZ2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTIxMDEsImV4cCI6MjA2MDQ2ODEwMX0.BrCNewuCvEH2y4CV7I-kZtNI1r7da2f1Y1AgrmEtxMw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Export fixed types that match what our UI is expecting
export type ProductVariant = {
  id: string;
  product_id: string;
  name: string | null;
  stock: number | null;
  price_diff: number | null;
  image?: string; // UI requirement but not in DB
};

export type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  stock: number | null;
  created_at: string | null;
  images?: string[] | undefined; // Updated to handle undefined case
  variants?: ProductVariant[];
  category?: string | null; // Updated to handle null
  featured?: boolean | null; // Updated to handle null
  parent_id?: string | null; // Added for variant products
};

export type OrderItem = {
  id: string;
  order_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  name?: string | null;         // Frontend property mapped from product_name
  product_name?: string | null; // Actual database column
  quantity: number | null;
  price: number | null;
  variantName?: string | null;  // Frontend property mapped from variant_name
  variant_name?: string | null; // Actual database column
};

export type Order = {
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
};
