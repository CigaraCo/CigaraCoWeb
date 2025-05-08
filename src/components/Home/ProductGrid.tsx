import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePublicData } from '@/context/PublicDataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProductGrid = () => {
  const { products, isLoading, error, refetch } = usePublicData();

  // Retry loading if there was an error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        refetch();
      }, 5000); // Retry after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, refetch]);

  // Filter out variant products and only show parent products
  const parentProducts = products.filter(product => !product.parent_id);

  if (error) {
    return (
      <section id="products" className="py-16 bg-cream">
        <div className="container-custom">
          <h2 className="text-3xl font-medium text-charcoal mb-2">Our Products</h2>
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading the products. Retrying...
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-card">
                <Skeleton className="h-64 rounded-md mb-4" />
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="products" className="py-16 bg-cream">
        <div className="container-custom">
          <h2 className="text-3xl font-medium text-charcoal mb-2">Our Products</h2>
          <p className="text-dark-gray mb-12">Discover our premium collection of storage solutions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="product-card animate-pulse">
                <Skeleton className="h-64 rounded-md mb-4" />
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show a message when there are no products
  if (parentProducts.length === 0) {
    return (
      <section id="products" className="py-16 bg-cream">
        <div className="container-custom">
          <h2 className="text-3xl font-medium text-charcoal mb-2">Our Products</h2>
          <p className="text-dark-gray mb-4">Discover our premium collection of storage solutions.</p>
          
          <div className="p-8 rounded-lg bg-gray-50 text-center">
            <h3 className="text-xl mb-2 text-charcoal">No products available</h3>
            <p className="text-dark-gray">Please check back later for our latest products.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 bg-cream">
      <div className="container-custom">
        <h2 className="text-3xl font-medium text-charcoal mb-2">Our Products</h2>
        <p className="text-dark-gray mb-12">Discover our premium collection of storage solutions.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parentProducts.map((product) => {
            const variants = products.filter(p => p.parent_id === product.id);
            const isOutOfStock = product.stock <= 0;
            const allVariantsOutOfStock = variants.length > 0 
              ? variants.every(variant => variant.stock <= 0)
              : false;
            
            const effectivelyOutOfStock = isOutOfStock && 
              (variants.length === 0 || allVariantsOutOfStock);
            
            const displayImage = variants.length > 0 && variants[0].images?.length > 0
              ? variants[0].images[0]
              : product.images && product.images.length > 0
                ? product.images[0]
                : '/placeholder.svg';
            
            return (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="product-card group overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="h-64 overflow-hidden rounded-md mb-4 relative bg-white">
                  <img 
                    src={displayImage} 
                    alt={product.name || 'Product'}
                    className={`w-full h-full object-cover object-center transition-all duration-500 ${
                      effectivelyOutOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                  />
                  {effectivelyOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-charcoal bg-opacity-70 text-cream px-4 py-2 rounded-md font-medium transform rotate-10">
                        SOLD OUT
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-medium text-charcoal mb-2 transition-colors duration-300 group-hover:text-blue-600">
                  {product.name || 'Unnamed Product'}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-dark-gray">
                    {variants.length > 0 
                      ? `From ${Math.min(...variants.map(v => v.price || 0)).toFixed(2)} JD`
                      : product.price 
                        ? `${product.price.toFixed(2)} JD` 
                        : '0.00 JD'
                    }
                  </p>
                  {!effectivelyOutOfStock && (
                    <p className="text-sm text-dark-gray">In stock</p>
                  )}
                </div>
                
                {variants.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {variants.map((variant) => (
                      <div 
                        key={variant.id}
                        className="w-6 h-6 rounded-full border border-gray-300 overflow-hidden"
                        title={variant.name || ''}
                      >
                        {variant.images && variant.images[0] ? (
                          <img 
                            src={variant.images[0]} 
                            alt={variant.name || ''}
                            className={`w-full h-full object-cover ${variant.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
