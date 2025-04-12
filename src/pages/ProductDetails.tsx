
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { useCart } from '@/context/CartContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useAdmin();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSoldOutDialog, setShowSoldOutDialog] = useState(false);
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return (
      <MainLayout>
        <div className="container-custom py-20 text-center">
          <h2 className="text-2xl font-medium mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Check if product is in stock
  const isOutOfStock = product.stock <= 0;
  
  React.useEffect(() => {
    // Show sold out dialog when navigating to out-of-stock product
    if (isOutOfStock) {
      setShowSoldOutDialog(true);
    }
  }, [isOutOfStock]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    
    // Don't allow quantity to exceed available stock
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    // Double check if we have enough stock
    if (quantity > product.stock) {
      toast({
        title: "Not enough stock",
        description: `Only ${product.stock} units available.`,
        variant: "destructive",
      });
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity
    });
    
    navigate('/cart');
  };
  
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover object-center ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-charcoal bg-opacity-70 text-cream px-6 py-3 rounded-md text-xl font-medium transform rotate-10">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-medium text-charcoal mb-4">{product.name}</h1>
            <p className="text-2xl text-charcoal mb-6">${product.price.toFixed(2)}</p>
            
            <div className="mb-8">
              <p className="text-dark-gray">{product.description}</p>
            </div>
            
            {!isOutOfStock && (
              <div className="text-dark-gray mb-4">
                <span className="font-medium">Available Stock:</span> {product.stock} units
              </div>
            )}
            
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
                disabled={quantity >= product.stock || isOutOfStock}
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
        </div>
      </div>
      
      {/* Sold Out Dialog */}
      <Dialog open={showSoldOutDialog} onOpenChange={setShowSoldOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Out of Stock
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Due to high demand, this product is currently sold out. We are waiting for supplies 
            to restock. Thank you for your patience and interest in our products.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ProductDetails;
