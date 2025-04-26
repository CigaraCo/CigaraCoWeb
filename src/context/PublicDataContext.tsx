
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/integrations/supabase/client';
import { convertToClientProduct } from '@/lib/supabase';

interface PublicDataContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
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

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      try {
        // Fetch products with their variants
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return;
        }

        // Fetch all variants
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*');

        if (variantsError) {
          console.error('Error fetching product variants:', variantsError);
          return;
        }

        // Map variants to their respective products
        const productsWithVariants = productsData.map(product => {
          const productVariants = variantsData.filter(
            variant => variant.product_id === product.id
          );
          
          // Convert JSON images to array if needed
          let parsedImages: string[] = [];
          if (product.images) {
            try {
              // Handle when images is already an array
              if (Array.isArray(product.images)) {
                parsedImages = product.images;
              } 
              // Handle when images is a JSON string
              else if (typeof product.images === 'string') {
                parsedImages = JSON.parse(product.images);
              }
              // Handle when images is a JSON object from Supabase
              else {
                parsedImages = product.images as unknown as string[];
              }
            } catch (e) {
              console.error('Error parsing product images:', e);
              parsedImages = [];
            }
          }
          
          return {
            ...product,
            images: parsedImages,
            variants: productVariants
          };
        });

        // Convert to client product format and ensure proper type handling
        const clientProducts = productsWithVariants.map(product => {
          // Use the convertToClientProduct function but ensure images are arrays
          const clientProduct = convertToClientProduct(product);
          // Double check that images is always an array
          if (!clientProduct.images || !Array.isArray(clientProduct.images)) {
            clientProduct.images = [];
          }
          return clientProduct;
        });
        
        setProducts(clientProducts);
        
        // Set featured products
        const featured = clientProducts.filter(product => product.featured);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error in fetchPublicData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <PublicDataContext.Provider value={{ products, featuredProducts, isLoading }}>
      {children}
    </PublicDataContext.Provider>
  );
};
