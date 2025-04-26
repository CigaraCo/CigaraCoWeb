
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import ImageGallery from '@/components/Product/ImageGallery';
import ProductInfo from '@/components/Product/ProductInfo';
import { usePublicData } from '@/context/PublicDataContext';
import { Product } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { convertToClientProduct } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = usePublicData();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      
      try {
        // First check if the product is already in our context
        const contextProduct = products.find(p => p.id === id);
        
        if (contextProduct) {
          setProduct(contextProduct);
          setIsLoading(false);
          return;
        }
        
        // If not found in context, fetch from Supabase directly
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError || !productData) {
          console.error('Error fetching product:', productError);
          navigate('/');
          return;
        }
        
        // Fetch variants for this product
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id);
          
        if (variantsError) {
          console.error('Error fetching product variants:', variantsError);
        }
        
        // Ensure images is an array
        let parsedImages: string[] = [];
        if (productData.images) {
          try {
            // Handle when images is already an array
            if (Array.isArray(productData.images)) {
              parsedImages = productData.images;
            } 
            // Handle when images is a JSON string
            else if (typeof productData.images === 'string') {
              parsedImages = JSON.parse(productData.images);
            }
            // Handle when images is a JSON object from Supabase
            else {
              parsedImages = productData.images as unknown as string[];
            }
          } catch (e) {
            console.error('Error parsing product images:', e);
            parsedImages = [];
          }
        }
        
        const productWithVariants = {
          ...productData,
          images: parsedImages,
          variants: variantsData || []
        };
        
        const clientProduct = convertToClientProduct(productWithVariants);
        setProduct(clientProduct);
      } catch (error) {
        console.error('Error in fetchProduct:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, navigate, products]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="h-96 w-full rounded-md" />
              <div className="mt-4 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-md" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-32 w-full mb-6" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <h1 className="text-2xl font-medium">Product not found</h1>
          <p className="mt-4">Sorry, we couldn't find the product you're looking for.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ImageGallery product={product} />
          <ProductInfo product={product} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;
