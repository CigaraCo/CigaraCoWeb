
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

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

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  price,
  description,
  availableStock,
  isOutOfStock,
  quantity,
  onQuantityChange,
  onAddToCart,
}) => {
  return (
    <div>
      <h1 className="text-3xl font-medium text-charcoal mb-4">{name}</h1>
      <p className="text-2xl text-charcoal mb-6">${price.toFixed(2)}</p>
      
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
          disabled={quantity <= 1 || isOutOfStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="mx-4 min-w-8 text-center">{quantity}</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onQuantityChange(1)}
          disabled={quantity >= availableStock || isOutOfStock}
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

