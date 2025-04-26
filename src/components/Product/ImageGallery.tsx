
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from '@/integrations/supabase/client';

interface ImageGalleryProps {
  images: string[];
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  isOutOfStock?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps | { product: Product }> = (props) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // If product prop is provided
  if ('product' in props) {
    const { product } = props;
    const images = Array.isArray(product.images) ? product.images : [];
    const isOutOfStock = (product.stock || 0) <= 0;
    
    // Initialize selectedImage with the first image or empty
    useEffect(() => {
      if (images.length > 0) {
        setSelectedImage(images[0]);
      }
    }, [product.id, images]);
    
    // Ensure we have images to display
    const displayImages = images.length > 0 ? images : [];
    
    return (
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
          <img
            src={selectedImage || (displayImages.length > 0 ? displayImages[0] : '/placeholder.svg')}
            alt="Product"
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
        {displayImages.length > 1 && (
          <div className="relative px-12">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2">
                {displayImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-2 basis-1/4">
                    <div
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                        selectedImage === image ? 'border-charcoal' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
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
      </div>
    );
  }
  
  // Original functionality with direct props
  const { images, selectedImage: propSelectedImage, setSelectedImage: propSetSelectedImage, isOutOfStock = false } = props;
  
  // Ensure we have images to display
  const displayImages = images && images.length > 0 ? images : [];
  
  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
        <img
          src={propSelectedImage}
          alt="Product"
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
      {displayImages.length > 1 && (
        <div className="relative px-12">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {displayImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 basis-1/4">
                  <div
                    className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                      propSelectedImage === image ? 'border-charcoal' : 'border-transparent'
                    }`}
                    onClick={() => propSetSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
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
    </div>
  );
};

export default ImageGallery;
