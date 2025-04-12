
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
            
            return (
              <Link key={product.id} to={`/product/${product.id}`}>
                <div className="product-card group overflow-hidden">
                  <div className="h-64 overflow-hidden rounded-md mb-4 relative">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                    />
                    {isOutOfStock && (
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
                    {!isOutOfStock && (
                      <p className="text-sm text-dark-gray">In stock: {product.stock}</p>
                    )}
                  </div>
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
