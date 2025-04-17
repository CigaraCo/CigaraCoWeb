
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { useCart } from '@/context/CartContext';
import MainLayout from '@/components/Layout/MainLayout';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageGallery from '@/components/Product/ImageGallery';
import VariantSelector from '@/components/Product/VariantSelector';
import ProductInfo from '@/components/Product/ProductInfo';
import { ProductVariant } from '@/integrations/supabase/client';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useAdmin();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSoldOutDialog, setShowSoldOutDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  
  const product = products.find(p => p.id === id);
  
  useEffect(() => {
    if (product) {
      // Set default selected image to first product image
      if (product.images && product.images.length > 0) {
        setSelectedImage(product.images[0]);
      }
      
      // Set default selected variant if variants exist
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].id);
        // Use variant image as the selected image
        setSelectedImage(product.variants[0].image);
      }
    }
  }, [product]);
  
  if (!product) {
    return (
      <MainLayout>
        <div className="container-custom py-20 text-center">
          <h2 className="text-2xl font-medium mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }
  
  const currentVariant = selectedVariant 
    ? product.variants?.find(v => v.id === selectedVariant)
    : null;
  
  const isOutOfStock = currentVariant
    ? currentVariant.stock <= 0
    : product.stock <= 0;
  
  const availableStock = currentVariant
    ? currentVariant.stock
    : product.stock;
  
  useEffect(() => {
    if (isOutOfStock) {
      setShowSoldOutDialog(true);
    }
  }, [isOutOfStock]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = product.variants?.find(v => v.id === variantId);
    if (variant) {
      setSelectedImage(variant.image);
      if (quantity > variant.stock) {
        setQuantity(variant.stock > 0 ? 1 : 0);
      }
    }
  };
  
  const handleAddToCart = () => {
    if (quantity > availableStock) {
      toast({
        title: "Not enough stock",
        description: `Only ${availableStock} units available.`,
        variant: "destructive",
      });
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name + (currentVariant ? ` - ${currentVariant.name}` : ''),
      price: product.price,
      image: selectedImage,
      quantity,
      variantId: selectedVariant || undefined
    });
    
    navigate('/cart');
  };
  
  // Determine the display images - either product images or variant images
  const displayImages = product.variants && product.variants.length > 0
    ? product.variants.map(v => v.image)
    : product.images;
  
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ImageGallery
            images={displayImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isOutOfStock={isOutOfStock}
          />
          
          <div>
            <ProductInfo
              name={product.name}
              price={product.price}
              description={product.description}
              availableStock={availableStock}
              isOutOfStock={isOutOfStock}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
            />
            
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantSelect={handleVariantSelect}
              />
            )}
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
