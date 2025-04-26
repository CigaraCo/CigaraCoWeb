
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { PublicDataProvider } from "./context/PublicDataContext";
import { AuthProvider, useAuth } from "./context/SupabaseAuthContext";
import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";

const queryClient = new QueryClient();

// Protected route component for admin routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading or redirect
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAdmin) {
    // Redirect to admin login page with the return path
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  
  return children;
};

// Error banner for missing Supabase configuration
const SupabaseErrorBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed || supabase !== null) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background">
      <Alert variant="destructive">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Supabase connection could not be established. Please make sure you have set the following environment variables:
            <ul className="list-disc list-inside mt-2">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <PublicDataProvider>
          <CartProvider>
            <AdminProvider>
              <TooltipProvider>
                <SupabaseErrorBanner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/products" element={
                    <ProtectedRoute>
                      <AdminProducts />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </AdminProvider>
          </CartProvider>
        </PublicDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
