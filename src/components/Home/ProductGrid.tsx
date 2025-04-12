
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';

const ProductGrid = () => {
  const { products } = useAdmin();

  return (
    <section id="products" className="py-16 bg-cream">
      <div className="container-custom">
        <h2 className="text-3xl font-medium text-charcoal mb-2">Our Products</h2>
        <p className="text-dark-gray mb-12">Discover our premium collection of storage solutions.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            
            // For products with variants, check if all variants are out of stock
            const allVariantsOutOfStock = product.variants 
              ? product.variants.every(variant => variant.stock <= 0)
              : false;
            
            // Product is out of stock if either the main stock is 0 or all variants are out of stock
            const effectivelyOutOfStock = isOutOfStock || 
              (product.variants && product.variants.length > 0 && allVariantsOutOfStock);
            
            // Get the first image - either from the first variant or the product
            const displayImage = product.variants && product.variants.length > 0
              ? product.variants[0].image
              : product.images[0];
            
            return (
              <Link key={product.id} to={`/product/${product.id}`}>
                <div className="product-card group overflow-hidden">
                  <div className="h-64 overflow-hidden rounded-md mb-4 relative">
                    <img 
                      src={displayImage} 
                      alt={product.name}
                      className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${effectivelyOutOfStock ? 'opacity-50 grayscale' : ''}`}
                    />
                    {effectivelyOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-charcoal bg-opacity-70 text-cream px-4 py-2 rounded-md font-medium transform rotate-10">
                          SOLD OUT
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-medium text-charcoal mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-dark-gray">${product.price.toFixed(2)}</p>
                    {!effectivelyOutOfStock && (
                      <p className="text-sm text-dark-gray">In stock: {product.stock}</p>
                    )}
                  </div>
                  
                  {/* Show variants if available */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.variants.map((variant) => (
                        <div 
                          key={variant.id}
                          className="w-6 h-6 rounded-full border border-gray-300 overflow-hidden"
                          title={variant.name}
                        >
                          <img 
                            src={variant.image} 
                            alt={variant.name}
                            className={`w-full h-full object-cover ${variant.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;

