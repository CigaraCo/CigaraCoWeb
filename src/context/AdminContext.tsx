
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './SupabaseAuthContext';
import { 
  supabase, 
  productService, 
  orderService, 
  Product, 
  Order,
  ProductVariant
} from '@/lib/supabase';

export type { Product, ProductVariant, Order };

interface AdminContextType {
  products: Product[];
  orders: Order[];
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
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
      .reduce((sum, order) => sum + order.total, 0);
  };

  // Load products and orders from Supabase when admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Load products
          const productsData = await productService.getAll();
          setProducts(productsData);
          
          // Load orders
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

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const newProduct = await productService.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added to your inventory`,
      });
      
      return newProduct;
    } catch (error: any) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await productService.update(id, productData);
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === id 
          ? { ...product, ...productData } 
          : product
      ));
      
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
      
      // Update local state
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
      const newOrder = await orderService.create(orderData);
      
      // Update local state
      setOrders(prev => [newOrder, ...prev]);
      
      toast({
        title: "Order added",
        description: `Order #${newOrder.id} has been added`,
      });
      
      return newOrder;
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
      
      // Update local state
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
      
      // Update local state
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
      
      // Update local state
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
