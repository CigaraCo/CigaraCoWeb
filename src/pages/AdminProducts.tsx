import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash, Plus, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import VariantForm from '@/components/Product/VariantForm';
import { ProductVariant as ClientProductVariant, Product } from '@/integrations/supabase/client';
import { convertFromClientVariant, Product as InternalProduct } from '@/lib/supabase';

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
  stock: number;
  variants?: ClientProductVariant[];
}

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  const initialFormData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    images: [],
    category: 'cigarette-case',
    featured: false,
    stock: 10,
    variants: []
  };
  
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  
  React.useEffect(() => {
    if (!isDialogOpen) {
      setFormData(initialFormData);
      setEditingProduct(null);
    }
  }, [isDialogOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      featured: checked,
    });
  };
  
  const handleEditProduct = (product: Product) => {
    const formProduct: ProductFormData = {
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      category: product.category || 'cigarette-case',
      featured: product.featured || false,
      stock: product.stock || 0,
      variants: product.variants || []
    };
    
    setFormData(formProduct);
    setEditingProduct(formProduct);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId);
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setFormData({
          ...formData,
          images: [...formData.images, event.target.result.toString()],
        });
      }
    };
    
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };
  
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product image",
        variant: "destructive",
      });
      return;
    }
    
    if (editingProduct && editingProduct.id) {
      let variantsWithPreservedIds: ClientProductVariant[] = [];
      
      if (formData.variants && formData.variants.length > 0) {
        variantsWithPreservedIds = formData.variants.map(newVariant => {
          if (editingProduct.variants) {
            const originalVariant = editingProduct.variants.find(v => v.id === newVariant.id);
            if (originalVariant) {
              return {
                ...newVariant,
                id: originalVariant.id,
                product_id: editingProduct.id || ''
              };
            }
          }
          return {
            ...newVariant,
            id: newVariant.id || crypto.randomUUID(),
            product_id: editingProduct.id || ''
          };
        });
      }
      
      const productId = editingProduct.id;
      const productData: Partial<InternalProduct> = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        images: formData.images,
        category: formData.category,
        featured: formData.featured
      };
      
      if (variantsWithPreservedIds.length > 0) {
        productData.variants = variantsWithPreservedIds.map(v => 
          convertFromClientVariant(v, productId)
        );
      }
      
      updateProduct(editingProduct.id, productData);
    } else {
      const productData: Omit<InternalProduct, 'id' | 'created_at'> = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        images: formData.images,
        category: formData.category,
        featured: formData.featured
      };
      
      if (formData.variants && formData.variants.length > 0) {
        productData.variants = formData.variants.map(v => 
          convertFromClientVariant(v, '')
        );
      }
      
      addProduct(productData);
    }
    
    setIsDialogOpen(false);
  };
  
  const handleAddPlaceholderImage = () => {
    const placeholderImages = [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579705379575-25b6259e69fe?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610261041218-6f6d3f27124c?q=80&w=800&auto=format&fit=crop"
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    
    setFormData({
      ...formData,
      images: [...formData.images, randomImage],
    });
  };

  const handleVariantChange = (variants: ClientProductVariant[]) => {
    setFormData({
      ...formData,
      variants
    });
  };
  
  return (
    <AdminLayout title="Products">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-dark-gray">
          Manage your product inventory
        </p>
        <Button
          className="btn-primary"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                          alt={product.name || 'Product'}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{product.name || 'Unnamed Product'}</p>
                      </TableCell>
                      <TableCell>${(product.price || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="capitalize">{(product.category || 'uncategorized').replace('-', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <span className={product.stock <= 0 ? 'text-red-500 font-medium' : ''}>
                          {product.stock <= 0 ? 'Out of stock' : product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.featured ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(product.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange as any}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="cigarette-case">Cigarette Case</option>
                  <option value="terea-box">TEREA Box</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              
              <div>
                <Label className="mb-2 block">Product Images</Label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative h-20 w-20 rounded-md overflow-hidden border"
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPlaceholderImage}
                  >
                    Add Placeholder Image
                  </Button>
                </div>
              </div>
              
              <VariantForm
                variants={formData.variants || []}
                onVariantChange={handleVariantChange}
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
