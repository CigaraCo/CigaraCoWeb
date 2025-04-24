import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './SupabaseAuthContext';
import { 
  supabase, 
  productService, 
  orderService, 
  Product as InternalProduct, 
  convertToClientProduct,
  convertFromClientVariant
} from '@/lib/supabase';
import { Product, ProductVariant, Order, OrderItem } from '@/integrations/supabase/client';

// Re-export the client types
export type { Product, ProductVariant, Order };

interface AdminContextType {
  products: Product[];
  orders: Order[];
  addProduct: (productData: Omit<InternalProduct, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<InternalProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (order: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      variantId?: string;
      variantName?: string;
    }[];
    total: number;
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  updateProductStock: (items: { id: string; quantity: number; variantId?: string }[]) => Promise<void>;
  pendingOrders: Order[];
  completedOrders: Order[];
  getActiveRevenue: () => number;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, signOut, isAuthenticated } = useAuth();

  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'processing'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled'
  );

  const getActiveRevenue = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.total || 0), 0);
  };

  useEffect(() => {
    if (isAdmin) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const productsData = await productService.getAll();
          setProducts(productsData.map(p => convertToClientProduct(p)));
          
          const ordersData = await orderService.getAll();
          setOrders(ordersData);
        } catch (error) {
          console.error('Error loading admin data:', error);
          toast({
            title: "Error loading data",
            description: "Please check your connection and try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [isAdmin]);

  const addProduct = async (productData: Omit<InternalProduct, 'id' | 'created_at'>) => {
    try {
      const newProduct = await productService.create(productData);
      
      const clientProduct = convertToClientProduct(newProduct);
      setProducts(prev => [clientProduct, ...prev]);
      
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added to your inventory`,
      });
      
      return clientProduct;
    } catch (error: any) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<InternalProduct>) => {
    try {
      await productService.update(id, productData);
      
      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          const updatedInternalProduct = {
            ...product,
            ...productData,
            id,
            images: product.images || [],
            category: product.category || '',
            featured: typeof product.featured === 'boolean' ? product.featured : false
          } as InternalProduct;
          
          return convertToClientProduct(updatedInternalProduct);
        }
        return product;
      }));
      
      toast({
        title: "Product updated",
        description: `Product has been updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      
      setProducts(prev => {
        const productToDelete = prev.find(p => p.id === id);
        if (productToDelete) {
          toast({
            title: "Product deleted",
            description: `${productToDelete.name} has been deleted`,
          });
        }
        return prev.filter(product => product.id !== id);
      });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addOrder = async (orderData: {
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      variantId?: string;
      variantName?: string;
    }[];
    total: number;
  }) => {
    try {
      console.log("Adding order with data:", orderData);
      const newOrder = await orderService.create(orderData);
      
      const completeOrder: Order = {
        ...newOrder,
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
        },
        items: orderData.items.map(item => ({
          id: item.id,
          order_id: newOrder.id,
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant_id: item.variantId || null,
          variantName: item.variantName || null,
        })),
      };
      
      setOrders(prev => [completeOrder, ...prev]);
      
      toast({
        title: "Order added",
        description: `Order #${newOrder.id} has been added`,
      });
      
      return completeOrder;
    } catch (error: any) {
      toast({
        title: "Error adding order",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await orderService.updateStatus(id, status);
      
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, status } : order
        )
      );
      
      toast({
        title: "Order status updated",
        description: `Order #${id} status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderService.delete(id);
      
      setOrders(prev => prev.filter(order => order.id !== id));
      
      toast({
        title: "Order deleted",
        description: `Order #${id} has been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting order",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProductStock = async (items: { id: string; quantity: number; variantId?: string }[]) => {
    try {
      await productService.updateStock(items);
      
      setProducts(prev => {
        return prev.map(product => {
          const orderItem = items.find(item => item.id === product.id);
          
          if (orderItem) {
            if (orderItem.variantId && product.variants) {
              return {
                ...product,
                variants: product.variants.map(variant => 
                  variant.id === orderItem.variantId
                    ? { ...variant, stock: Math.max(0, variant.stock - orderItem.quantity) }
                    : variant
                ),
                stock: Math.max(0, product.stock - orderItem.quantity)
              };
            }
            
            return { 
              ...product, 
              stock: Math.max(0, product.stock - orderItem.quantity)
            };
          }
          
          return product;
        });
      });
    } catch (error: any) {
      toast({
        title: "Error updating product stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AdminContext.Provider value={{
      products,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      isAuthenticated: isAdmin,
      logout,
      updateProductStock,
      pendingOrders,
      completedOrders,
      getActiveRevenue,
      isLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
};
