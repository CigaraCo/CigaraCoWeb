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
  variantName?: string | null;
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
          variants: variants || []
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
      variants: variants || []
    };
  },
  
  async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
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
      try {
        // Instead of deleting all existing variants, update them individually
        // First, get current variants to compare
        const { data: existingVariants, error: fetchError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id);
        
        if (fetchError) throw fetchError;
        
        // Track the variants we're going to keep (by ID)
        const updatedVariantIds = new Set(variants.map(v => v.id));
        
        // For each existing variant...
        for (const existingVariant of existingVariants || []) {
          // If it's in our updates list, update it
          if (updatedVariantIds.has(existingVariant.id)) {
            const variantToUpdate = variants.find(v => v.id === existingVariant.id);
            if (variantToUpdate) {
              const { error: updateError } = await supabase
                .from('product_variants')
                .update({
                  name: variantToUpdate.name,
                  image: variantToUpdate.image,
                  stock: variantToUpdate.stock,
                  price_diff: variantToUpdate.price_diff
                })
                .eq('id', existingVariant.id);
              
              if (updateError) throw updateError;
            }
          } 
          // If it's not in our updates list and doesn't have order items referencing it,
          // we can safely delete it
          else {
            // Check if this variant is referenced by any order items
            const { data: orderItems, error: checkError } = await supabase
              .from('order_items')
              .select('id')
              .eq('variant_id', existingVariant.id)
              .limit(1);
            
            if (checkError) throw checkError;
            
            // If no order items reference this variant, we can delete it
            if (!orderItems || orderItems.length === 0) {
              const { error: deleteError } = await supabase
                .from('product_variants')
                .delete()
                .eq('id', existingVariant.id);
              
              if (deleteError) throw deleteError;
            } else {
              // If there are order items, just set stock to 0 instead of deleting
              const { error: updateError } = await supabase
                .from('product_variants')
                .update({ stock: 0 })
                .eq('id', existingVariant.id);
              
              if (updateError) throw updateError;
            }
          }
        }
        
        // Insert new variants (ones that don't exist in the database yet)
        const newVariants = variants.filter(v => 
          !existingVariants || !existingVariants.some(ev => ev.id === v.id)
        );
        
        if (newVariants.length > 0) {
          const variantsWithProductId = newVariants.map(variant => ({
            ...variant,
            product_id: id
          }));
          
          const { error: insertError } = await supabase
            .from('product_variants')
            .insert(variantsWithProductId);
          
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error updating variants:', error);
        throw error;
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
    
    try {
      // Get orders with created_at timestamp
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get all order items with product information
      const { data: allItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products:product_id (
            name,
            description
          ),
          product_variants:variant_id (
            name,
            price_diff
          )
        `);
        
      if (itemsError) throw itemsError;
      
      // Map items to their respective orders
      const ordersWithData = orders.map(order => {
        // Find items for this order
        const orderItems = allItems
          .filter(item => item.order_id === order.id)
          .map(item => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.products?.name || item.product_name || 'Unknown Product',
            quantity: item.quantity || 0,
            price: item.price || 0,
            variantName: item.product_variants?.name || item.variant_name || null
          })) || [];
        
        // Add customer property and ensure created_at is properly formatted
        return {
          ...order,
          created_at: order.created_at || new Date().toISOString(),
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address
          },
          items: orderItems
        };
      });
      
      return ordersWithData;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
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
    
    console.log("Creating order with data:", orderData);
    
    // Create the order with created_at timestamp
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        customer_address: orderData.customer.address,
        total: orderData.total,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating order:", error);
      throw error;
    }
    
    console.log("Order created:", order);
    
    // Create order items with proper product and variant information
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      variant_id: item.variantId || null,
      product_name: item.name,
      variant_name: item.variantName || null,
      price: item.price,
      quantity: item.quantity
    }));
    
    console.log("Creating order items:", orderItems);
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select(`
        *,
        products:product_id (
          name,
          description
        ),
        product_variants:variant_id (
          name,
          price_diff
        )
      `);
    
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }
    
    console.log("Order items created:", createdItems);
    
    // Update product stock
    const stockItems = orderData.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      variantId: item.variantId
    }));
    
    try {
      await productService.updateStock(stockItems);
    } catch (stockError) {
      console.error("Error updating stock:", stockError);
      // Don't throw here, we want the order to be created even if stock update fails
    }
    
    // Return order with properly mapped customer and items information
    return {
      ...order,
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        address: orderData.customer.address
      },
      items: createdItems.map(item => ({
        id: item.id,
        order_id: order.id,
        product_id: item.product_id || '',
        variant_id: item.variant_id || null,
        name: item.products?.name || item.product_name || 'Unknown Product',
        price: item.price || 0,
        quantity: item.quantity || 0,
        variantName: item.product_variants?.name || item.variant_name || null
      }))
    };
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
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (e) {
      console.error('Error checking admin status:', e);
      return false;
    }
  }
};
