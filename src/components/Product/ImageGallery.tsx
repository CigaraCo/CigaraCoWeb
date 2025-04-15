
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageGalleryProps {
  images: string[];
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  isOutOfStock?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedImage,
  setSelectedImage,
  isOutOfStock = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
        <img
          src={selectedImage}
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
      {images.length > 1 && (
        <div className="relative px-12">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {images.map((image, index) => (
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
};

export default ImageGallery;

