
import { ProductVariant as ClientProductVariant, Product as ClientProduct } from '@/integrations/supabase/client';
import { Product, ProductVariant } from './types';

export const convertToClientVariant = (variant: ProductVariant): ClientProductVariant => ({
  id: variant.id,
  product_id: variant.product_id,
  name: variant.name,
  stock: variant.stock,
  price_diff: variant.price_diff || null,
  image: variant.image_url || variant.image || ''
});

export const convertFromClientVariant = (variant: ClientProductVariant, productId: string = ''): ProductVariant => ({
  id: variant.id,
  product_id: variant.product_id || productId,
  name: variant.name,
  stock: variant.stock,
  price_diff: variant.price_diff,
  image: variant.image
});

export const convertToClientProduct = (product: Product): ClientProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  created_at: product.created_at,
  images: product.images,
  variants: product.variants?.map(convertToClientVariant),
  category: product.category,
  featured: product.featured
});

export const convertFromClientProduct = (product: ClientProduct): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  created_at: product.created_at,
  images: product.images || [],
  variants: product.variants?.map(v => convertFromClientVariant(v, product.id)),
  category: product.category || '',
  featured: product.featured || false
});
