import { supabase } from '../client';
import { Product } from '../types';

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
