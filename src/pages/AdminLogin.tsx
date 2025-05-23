import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return path from location state
  const from = location.state?.from?.pathname || '/admin/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAdmin, navigate, from]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    // Attempt login - removed the Supabase null check to allow login attempts
    const success = await signIn(email, password);
    
    if (success) {
      // Adding a delay to ensure the isAdmin state is updated before navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  };
  
  if (isAdmin) return null;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-medium text-charcoal mb-2 hover:text-charcoal/80 transition-colors">
            Cigára Co.
          </Link>
          <p className="text-dark-gray">Admin Dashboard</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-medium text-charcoal mb-6">Login</h2>
          
          {/* Modified the alert to show only if Supabase configuration is actually missing */}
          {supabase === null && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Supabase configuration is missing. Please check your environment variables.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-dark-gray">
            <p>Use your Supabase admin credentials to log in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
