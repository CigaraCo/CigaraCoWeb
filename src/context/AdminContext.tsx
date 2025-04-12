
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
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
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface AdminContextType {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Sample products data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Classic Storage Case",
    description: "A sleek and elegant storage case for your cigarettes. Made with premium materials and designed for everyday use.",
    price: 29.99,
    images: ["https://images.unsplash.com/photo-1610261041218-6f6d3f27124c?q=80&w=800&auto=format&fit=crop"],
    category: "cigarette-case",
    featured: true
  },
  {
    id: "2",
    name: "TEREA Premium Box",
    description: "A sophisticated storage solution specifically designed for TEREA packs. Keeps your packs organized and protected.",
    price: 34.99,
    images: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop"],
    category: "terea-box",
    featured: true
  },
  {
    id: "3",
    name: "Minimalist Cigarette Holder",
    description: "A minimalist approach to cigarette storage. This sleek holder protects your cigarettes while maintaining a modern aesthetic.",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1579705379575-25b6259e69fe?q=80&w=800&auto=format&fit=crop"],
    category: "cigarette-case",
    featured: false
  },
];

// Sample orders data
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

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load products and orders from localStorage on initial render
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

    // Check if admin is logged in
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Save products and orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    
    toast({
      title: "Product added",
      description: `${product.name} has been added successfully`,
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
    
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

  const login = (username: string, password: string) => {
    // Simple authentication for demo purposes
    // In a real application, you'd verify against a backend
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
      updateOrderStatus,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};
