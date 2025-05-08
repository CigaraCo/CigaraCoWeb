import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/integrations/supabase/client';

interface PublicDataContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextType | undefined>(undefined);

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context) {
    throw new Error('usePublicData must be used within a PublicDataProvider');
  }
  return context;
};

export const PublicDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPublicData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch products with their variants in a single query
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        throw new Error(`Error fetching products: ${productsError.message}`);
      }

      if (!productsData) {
        throw new Error('No products data received');
      }

      // Process the products data
      const clientProducts = productsData.map(product => {
        // Ensure images is always an array
        let images: string[] = [];
        if (product.images) {
          try {
            if (Array.isArray(product.images)) {
              images = product.images.map(String);
            } else if (typeof product.images === 'string') {
              const parsed = JSON.parse(product.images);
              images = Array.isArray(parsed) ? parsed.map(String) : [];
            }
          } catch (e) {
            console.warn('Error parsing product images:', e);
          }
        }

        // Create a properly typed product object
        return {
          ...product,
          images,
          price: product.price || 0,
          stock: product.stock || 0,
          featured: product.featured || false,
          category: product.category || '',
          description: product.description || '',
          name: product.name || '',
          variants: product.product_variants || []
        } as Product;
      });

      setProducts(clientProducts);
      setFeaturedProducts(clientProducts.filter(product => product.featured));
      
    } catch (error) {
      console.error('Error in fetchPublicData:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <PublicDataContext.Provider value={{ 
      products, 
      featuredProducts, 
      isLoading, 
      error,
      refetch: fetchPublicData 
    }}>
      {children}
    </PublicDataContext.Provider>
  );
};
