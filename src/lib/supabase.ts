
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Types based on your database schema
export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  image_url: string;
  stock: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
  stock: number;
  variants?: ProductVariant[];
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  price: number;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

// Database functions for Products
export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Fetch variants for each product
    const productsWithVariants = await Promise.all(
      data.map(async (product) => {
        const { data: variants, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id);
        
        if (variantError) throw variantError;
        
        return {
          ...product,
          variants: variants || []
        };
      })
    );
    
    return productsWithVariants;
  },
  
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    // Fetch variants
    const { data: variants, error: variantError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id);
    
    if (variantError) throw variantError;
    
    return {
      ...data,
      variants: variants || []
    };
  },
  
  async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { variants, ...productData } = product;
    
    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Insert variants if any
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map(variant => ({
        ...variant,
        product_id: data.id
      }));
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);
      
      if (variantError) throw variantError;
    }
    
    return {
      ...data,
      variants: variants || []
    };
  },
  
  async update(id: string, product: Partial<Product>): Promise<void> {
    const { variants, ...productData } = product;
    
    // Update product
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id);
    
    if (error) throw error;
    
    // Handle variants if provided
    if (variants) {
      // First delete existing variants
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);
      
      if (deleteError) throw deleteError;
      
      // Then insert new ones
      if (variants.length > 0) {
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          product_id: id
        }));
        
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(variantsWithProductId);
        
        if (insertError) throw insertError;
      }
    }
  },
  
  async delete(id: string): Promise<void> {
    // Delete variants first (foreign key constraint)
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    if (variantError) throw variantError;
    
    // Then delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  async updateStock(items: { id: string; quantity: number; variantId?: string }[]): Promise<void> {
    // Process each item one by one to handle both product and variant stock
    for (const item of items) {
      // If variant is specified, update variant stock
      if (item.variantId) {
        const { error: variantError } = await supabase.rpc('decrement_variant_stock', {
          variant_id: item.variantId,
          quantity: item.quantity
        });
        
        if (variantError) throw variantError;
      }
      
      // Always update product stock
      const { error } = await supabase.rpc('decrement_product_stock', {
        product_id: item.id,
        quantity: item.quantity
      });
      
      if (error) throw error;
    }
  }
};

// Database functions for Orders
export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  async getById(id: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    
    if (itemsError) throw itemsError;
    
    return {
      order,
      items: items || []
    };
  },
  
  async create(orderData: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      variantId?: string;
      variantName?: string;
    }[];
    total: number;
  }): Promise<Order> {
    // Create the order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        customer_address: orderData.customer.address,
        total: orderData.total,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      variant_id: item.variantId || null,
      variant_name: item.variantName || null,
      price: item.price,
      quantity: item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Update product stock
    const stockItems = orderData.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      variantId: item.variantId
    }));
    
    await productService.updateStock(stockItems);
    
    return order;
  },
  
  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },
  
  async delete(id: string): Promise<void> {
    // Delete order items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);
    
    if (itemsError) throw itemsError;
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Database functions for authentication
export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  
  async isAdminUser(userId: string) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};
