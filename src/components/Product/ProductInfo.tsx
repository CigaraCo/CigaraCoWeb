import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, ProductVariant } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import VariantSelector from './VariantSelector';

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
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  
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
    
    // Handle variant selection
    const handleVariantSelect = (variantId: string) => {
      setSelectedVariant(variantId);
    };
    
    // Handle add to cart
    const handleAddToCart = () => {
      let variant: ProductVariant | undefined = undefined;
      if (selectedVariant && product.variants) {
        variant = product.variants.find(v => v.id === selectedVariant);
      }
      addItem({
        id: product.id,
        name: product.name || 'Unnamed Product',
        price: variant && variant.price_diff != null ? (product.price || 0) + variant.price_diff : (product.price || 0),
        quantity: quantity,
        image: variant && variant.image ? variant.image : (product.images && product.images.length > 0 ? product.images[0] : ''),
        variantId: variant ? variant.id : undefined,
        variantName: variant ? variant.name || undefined : undefined
      });
    };
    
    return (
      <div>
        <h1 className="text-3xl font-medium text-charcoal mb-4">{product.name || 'Unnamed Product'}</h1>
        <p className="text-2xl text-charcoal mb-6">{(product.price || 0).toFixed(2)} JD</p>
        
        <div className="mb-8">
          <p className="text-dark-gray">{product.description || ''}</p>
        </div>
        
        {/* Variant Selector */}
        {product.variants && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onVariantSelect={handleVariantSelect}
          />
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
          disabled={isOutOfStock || (product.variants && product.variants.length > 0 && !selectedVariant)}
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
