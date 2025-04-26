
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';

interface ProductInfoProps {
  name: string;
  price: number;
  description: string;
  availableStock: number;
  isOutOfStock: boolean;
  quantity: number;
  onQuantityChange: (amount: number) => void;
  onAddToCart: () => void;
}

// Add support for both direct props and product prop
const ProductInfo: React.FC<ProductInfoProps | { product: Product }> = (props) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // If we receive a product prop, extract the necessary values
  if ('product' in props) {
    const { product } = props;
    const isOutOfStock = (product.stock || 0) <= 0;
    const availableStock = product.stock || 0;
    
    // Handle quantity changes
    const handleQuantityChange = (amount: number) => {
      const newQuantity = quantity + amount;
      if (newQuantity >= 1 && newQuantity <= availableStock) {
        setQuantity(newQuantity);
      }
    };
    
    // Handle add to cart
    const handleAddToCart = () => {
      addToCart({
        id: product.id,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined
      });
    };
    
    return (
      <div>
        <h1 className="text-3xl font-medium text-charcoal mb-4">{product.name || 'Unnamed Product'}</h1>
        <p className="text-2xl text-charcoal mb-6">{(product.price || 0).toFixed(2)} JD</p>
        
        <div className="mb-8">
          <p className="text-dark-gray">{product.description || ''}</p>
        </div>
        
        {!isOutOfStock && (
          <div className="text-dark-gray mb-4">
            <span className="font-medium">Available Stock:</span> {availableStock} units
          </div>
        )}
        
        {/* Quantity Selection */}
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="mx-4 min-w-8 text-center">{quantity}</span>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= availableStock || isOutOfStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className="btn-primary w-full flex items-center justify-center"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    );
  }
  
  // Original functionality for direct props
  const { name, price, description, availableStock, isOutOfStock, quantity: propQuantity, onQuantityChange, onAddToCart } = props;
  
  return (
    <div>
      <h1 className="text-3xl font-medium text-charcoal mb-4">{name}</h1>
      <p className="text-2xl text-charcoal mb-6">{price.toFixed(2)} JD</p>
      
      <div className="mb-8">
        <p className="text-dark-gray">{description}</p>
      </div>
      
      {!isOutOfStock && (
        <div className="text-dark-gray mb-4">
          <span className="font-medium">Available Stock:</span> {availableStock} units
        </div>
      )}
      
      {/* Quantity Selection */}
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onQuantityChange(-1)}
          disabled={propQuantity <= 1 || isOutOfStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="mx-4 min-w-8 text-center">{propQuantity}</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onQuantityChange(1)}
          disabled={propQuantity >= availableStock || isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        className="btn-primary w-full flex items-center justify-center"
        onClick={onAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
      </Button>
    </div>
  );
};

export default ProductInfo;
