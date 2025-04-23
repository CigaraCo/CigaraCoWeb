
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Plus } from 'lucide-react';
import { ProductVariant } from '@/integrations/supabase/client';

interface VariantFormProps {
  variants: ProductVariant[];
  onVariantChange: (variants: ProductVariant[]) => void;
}

const VariantForm: React.FC<VariantFormProps> = ({ variants, onVariantChange }) => {
  const handleAddVariant = () => {
    onVariantChange([
      ...variants,
      {
        id: crypto.randomUUID(), // Using crypto.randomUUID() instead of a custom string format
        product_id: '', // Will be set by parent component
        name: '',
        image: '',
        stock: 0,
        price_diff: 0
      }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    onVariantChange(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = variants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    onVariantChange(updatedVariants);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        handleVariantChange(index, 'image', event.target.result.toString());
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Product Variants</Label>
        <Button type="button" onClick={handleAddVariant} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.map((variant, index) => (
        <div key={variant.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => handleRemoveVariant(index)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div>
            <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
            <Input
              id={`variant-name-${index}`}
              value={variant.name || ''}
              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
              placeholder="e.g., Red, Large, etc."
            />
          </div>

          <div>
            <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
            <Input
              id={`variant-stock-${index}`}
              type="number"
              min="0"
              value={variant.stock || 0}
              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor={`variant-price-diff-${index}`}>Price Difference</Label>
            <Input
              id={`variant-price-diff-${index}`}
              type="number"
              value={variant.price_diff || 0}
              onChange={(e) => handleVariantChange(index, 'price_diff', parseFloat(e.target.value))}
              placeholder="Additional price for this variant"
            />
          </div>

          <div className="col-span-1">
            <Label>Variant Image</Label>
            <div className="flex items-center gap-4">
              {variant.image && (
                <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                  <img
                    src={variant.image}
                    alt={variant.name || ''}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Label
                htmlFor={`variant-image-${index}`}
                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Label>
              <Input
                id={`variant-image-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VariantForm;
