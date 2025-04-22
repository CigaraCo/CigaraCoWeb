import { createClient } from '@supabase/supabase-js';
import { 
  ProductVariant as ClientProductVariant, 
  Product as ClientProduct,
  Order as ClientOrder,
  OrderItem as ClientOrderItem
} from '@/integrations/supabase/client';

// Get Supabase credentials - first try from environment variables, then from the integrations file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gberhjjwltvpdttflgfi.supabase.co' || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXJoamp3bHR2cGR0dGZsZ2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTIxMDEsImV4cCI6MjA2MDQ2ODEwMX0.BrCNewuCvEH2y4CV7I-kZtNI1r7da2f1Y1AgrmEtxMw' || '';

// Check if the required environment variables are available
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

// Create the Supabase client only if credentials are available
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log warning if credentials are missing
if (!hasSupabaseCredentials) {
  console.warn(
    'Supabase connection cannot be established. Missing environment variables: ' +
    (!supabaseUrl ? 'VITE_SUPABASE_URL ' : '') +
    (!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : '') +
    '. Please set these in your environment.'
  );
}

// Types based on your database schema but compatible with client.ts
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

// Helper function to convert between variant types
export const convertToClientVariant = (variant: ProductVariant): ClientProductVariant => ({
  id: variant.id,
  product_id: variant.product_id,
  name: variant.name,
  stock: variant.stock,
  price_diff: variant.price_diff || null,
  image: variant.image_url || variant.image || ''
});

// Helper function to convert from client variant to internal variant
export const convertFromClientVariant = (variant: ClientProductVariant, productId: string = ''): ProductVariant => ({
  id: variant.id,
  product_id: variant.product_id || productId,
  name: variant.name,
  stock: variant.stock,
  price_diff: variant.price_diff,
  image: variant.image
});

// Helper function to convert internal product to client product
export const convertToClientProduct = (product: Product): ClientProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  created_at: product.created_at,
  images: product.images,
  variants: product.variants?.map(convertToClientVariant),
  category: product.category,
  featured: product.featured
});

// Helper function to convert client product to internal product
export const convertFromClientProduct = (product: ClientProduct): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  created_at: product.created_at,
  images: product.images || [],
  variants: product.variants?.map(v => convertFromClientVariant(v, product.id)),
  category: product.category || '',
  featured: product.featured || false
});

// Helper function to convert client order item to internal order item
export const convertFromClientOrderItem = (item: ClientOrderItem): OrderItem => ({
  id: item.id,
  order_id: item.order_id,
  product_id: item.product_id,
  variant_id: item.variant_id,
  name: item.name,
  quantity: item.quantity,
  price: item.price
});

// Database functions for Products
export const productService = {
  async getAll(): Promise<Product[]> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }
    
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
          variants: variants || [],
          // Ensure we have default values for category and featured if they're null
          category: product.category || 'cigarette-case',
          featured: product.featured || false
        };
      })
    );
    
    return productsWithVariants;
  },
  
  async getById(id: string): Promise<Product | null> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }
    
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
      variants: variants || [],
      // Ensure we have default values for category and featured if they're null
      category: data.category || 'cigarette-case',
      featured: data.featured || false
    };
  },
  
  async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { variants, ...productData } = product;
    
    // Insert product - explicitly include category and featured
    const productToInsert = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      featured: productData.featured
    };
    
    console.log('Creating product with data:', productToInsert);
    
    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    // Insert variants if any
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map(variant => ({
        ...variant,
        product_id: data.id
      }));
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);
      
      if (variantError) {
        console.error('Error creating product variants:', variantError);
        throw variantError;
      }
    }
    
    // Return the complete product with images and other fields
    return {
      ...data,
      variants: variants || [],
      images: productData.images || [],
      category: data.category || 'cigarette-case',
      featured: data.featured || false
    };
  },
  
  async update(id: string, product: Partial<Product>): Promise<void> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return [];
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add customer property to match component expectations
    return data.map(order => ({
      ...order,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address
      }
    }));
  },
  
  async getById(id: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return null;
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },
  
  async delete(id: string): Promise<void> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  async logout() {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getCurrentUser() {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  
  async isAdminUser(userId: string) {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return false;
    }
    
    try {
      console.log(`Checking admin status for user ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      console.log('Admin check result:', data);
      
      // If data is empty array, user is not an admin
      if (!data || data.length === 0) {
        console.log('User is not an admin - no matching records found');
        return false;
      }
      
      // Found matching admin record
      console.log('User is an admin');
      return true;
    } catch (e) {
      console.error('Exception when checking admin status:', e);
      return false;
    }
  }
};
