
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface ProductVariant {
  id: string;
  name: string;
  image: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
  stock: number;
  variants?: ProductVariant[];
}

export interface Order {
  id: string;
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
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface AdminContextType {
  products: Product[];
  orders: Order[];
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProductStock: (items: { id: string; quantity: number; variantId?: string }[]) => void;
  pendingOrders: Order[];
  completedOrders: Order[];
  getActiveRevenue: () => number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Classic Storage Case",
    description: "A sleek and elegant storage case for your cigarettes. Made with premium materials and designed for everyday use.",
    price: 29.99,
    images: ["https://images.unsplash.com/photo-1610261041218-6f6d3f27124c?q=80&w=800&auto=format&fit=crop"],
    category: "cigarette-case",
    featured: true,
    stock: 10,
    variants: [
      {
        id: "1-pink",
        name: "Pink",
        image: "public/lovable-uploads/8d93498e-c223-4478-84c4-1509ffbd73d8.png",
        stock: 5
      },
      {
        id: "1-black",
        name: "Black",
        image: "https://images.unsplash.com/photo-1610261041218-6f6d3f27124c?q=80&w=800&auto=format&fit=crop",
        stock: 5
      }
    ]
  },
  {
    id: "2",
    name: "TEREA Premium Box",
    description: "A sophisticated storage solution specifically designed for TEREA packs. Keeps your packs organized and protected.",
    price: 34.99,
    images: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop"],
    category: "terea-box",
    featured: true,
    stock: 10
  },
  {
    id: "3",
    name: "Minimalist Cigarette Holder",
    description: "A minimalist approach to cigarette storage. This sleek holder protects your cigarettes while maintaining a modern aesthetic.",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1579705379575-25b6259e69fe?q=80&w=800&auto=format&fit=crop"],
    category: "cigarette-case",
    featured: false,
    stock: 10
  },
];

const initialOrders: Order[] = [
  {
    id: "order1",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St, Amman, JO"
    },
    items: [
      {
        id: "1",
        name: "Classic Storage Case",
        price: 29.99,
        quantity: 2
      }
    ],
    total: 59.98,
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

// Define AdminProvider as a React function component
const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        return parsedProducts.map((product: Product) => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : 10,
        }));
      } catch (error) {
        console.error('Failed to parse products from localStorage:', error);
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedOrders = localStorage.getItem('orders');
    
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Failed to parse products from localStorage:', error);
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }
    
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Failed to parse orders from localStorage:', error);
        setOrders(initialOrders);
      }
    } else {
      setOrders(initialOrders);
    }

    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-6)}`,
      stock: productData.stock || 10,
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added to your inventory`,
    });
    
    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prevProducts => {
      return prevProducts.map(product => 
        product.id === id 
          ? { ...product, ...productData } 
          : product
      );
    });
    
    toast({
      title: "Product updated",
      description: `Product has been updated successfully`,
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prevProducts => {
      const productToDelete = prevProducts.find(p => p.id === id);
      if (productToDelete) {
        toast({
          title: "Product deleted",
          description: `${productToDelete.name} has been deleted`,
        });
      }
      return prevProducts.filter(product => product.id !== id);
    });
  };

  const addOrder = (order: Order) => {
    setOrders(prevOrders => [...prevOrders, order]);
    
    toast({
      title: "Order added",
      description: `Order #${order.id} has been added`,
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
    
    toast({
      title: "Order status updated",
      description: `Order #${id} status changed to ${status}`,
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prevOrders => {
      return prevOrders.filter(order => order.id !== id);
    });
  };

  const updateProductStock = (items: { id: string; quantity: number; variantId?: string }[]) => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
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
  };

  const login = (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
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
      isAuthenticated,
      login,
      logout,
      updateProductStock,
      pendingOrders,
      completedOrders,
      getActiveRevenue
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export { AdminProvider };
