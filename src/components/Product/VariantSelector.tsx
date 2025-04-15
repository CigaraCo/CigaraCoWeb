
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Variant {
  id: string;
  name: string;
  image: string;
  stock: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: string | null;
  onVariantSelect: (variantId: string) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">Available Colors:</h3>
      <div className="relative px-12">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {variants.map((variant) => (
              <CarouselItem key={variant.id} className="pl-2 basis-1/4">
                <div
                  className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                    selectedVariant === variant.id ? 'border-charcoal' : 'border-transparent'
                  } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => variant.stock > 0 && onVariantSelect(variant.id)}
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
    </div>
  );
};

export default VariantSelector;

