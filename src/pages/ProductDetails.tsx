import React, { useState, useEffect } from 'react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useAdmin();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSoldOutDialog, setShowSoldOutDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  
  const product = products.find(p => p.id === id);
  
  useEffect(() => {
    if (product) {
      // Initialize with the first product image
      setSelectedImage(product.images[0]);
      setDisplayImage(product.images[0]);
      
      // If product has variants, select the first one by default
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].id);
        setDisplayImage(product.variants[0].image);
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
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Get the current variant's stock if selected
  const currentVariant = selectedVariant 
    ? product.variants?.find(v => v.id === selectedVariant)
    : null;
  
  // Check if product or selected variant is in stock
  const isOutOfStock = currentVariant
    ? currentVariant.stock <= 0
    : product.stock <= 0;
  
  const availableStock = currentVariant
    ? currentVariant.stock
    : product.stock;
  
  useEffect(() => {
    // Show sold out dialog when navigating to out-of-stock product
    if (isOutOfStock) {
      setShowSoldOutDialog(true);
    }
  }, [isOutOfStock]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    
    // Don't allow quantity to exceed available stock
    if (newQuantity > 0 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = product.variants?.find(v => v.id === variantId);
    if (variant) {
      setDisplayImage(variant.image);
      setSelectedImage(variant.image);
      
      // Reset quantity if necessary
      if (quantity > variant.stock) {
        setQuantity(variant.stock > 0 ? 1 : 0);
      }
    }
  };
  
  const handleAddToCart = () => {
    // Double check if we have enough stock
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
      image: displayImage,
      quantity,
      variantId: selectedVariant || undefined
    });
    
    navigate('/cart');
  };
  
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
              <img
                src={selectedImage || displayImage}
                alt={product.name}
                className={`w-full h-[400px] object-cover object-center ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-charcoal bg-opacity-70 text-cream px-6 py-3 rounded-md text-xl font-medium transform rotate-10">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Carousel */}
            {product.images.length > 1 && !selectedVariant && (
              <div className="relative px-12">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {product.images.map((image, index) => (
                      <CarouselItem key={index} className="pl-2 basis-1/4">
                        <div
                          className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                            selectedImage === image ? 'border-charcoal' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            )}

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="relative px-12">
                <Carousel className="w-full">
                  <CarouselContent className="-ml-2">
                    {product.variants.map((variant) => (
                      <CarouselItem key={variant.id} className="pl-2 basis-1/4">
                        <div
                          className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                            selectedVariant === variant.id ? 'border-charcoal' : 'border-transparent'
                          } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => variant.stock > 0 && handleVariantSelect(variant.id)}
                        >
                          <img
                            src={variant.image}
                            alt={variant.name}
                            className="w-full h-20 object-cover"
                          />
                          <div className="p-1 text-center text-sm bg-gray-50">
                            {variant.name}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-medium text-charcoal mb-4">{product.name}</h1>
            <p className="text-2xl text-charcoal mb-6">${product.price.toFixed(2)}</p>
            
            <div className="mb-8">
              <p className="text-dark-gray">{product.description}</p>
            </div>
            
            {/* Variant Selection Info */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Available Colors:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => variant.stock > 0 && handleVariantSelect(variant.id)}
                      className={`px-4 py-2 rounded-md text-sm ${
                        selectedVariant === variant.id
                          ? 'bg-charcoal text-white'
                          : 'bg-gray-100 text-charcoal'
                      } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={variant.stock <= 0}
                    >
                      {variant.name} {variant.stock <= 0 && '(Sold Out)'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!isOutOfStock && (
              <div className="text-dark-gray mb-4">
                <span className="font-medium">Available Stock:</span> {availableStock} units
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
