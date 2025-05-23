
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, authService } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if Supabase client is initialized
    if (!supabase) {
      console.warn('Supabase client not initialized. Authentication features will not work.');
      setIsLoading(false);
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const isUserAdmin = await authService.isAdminUser(userId);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (!supabase) {
        toast({
          title: "Authentication error",
          description: "Supabase client is not initialized. Please check your environment variables.",
          variant: "destructive",
        });
        return false;
      }
      
      // Modified to handle potential errors from the auth service
      try {
        const { session } = await authService.login(email, password);
        
        if (session?.user) {
          // Ensure admin status is checked immediately after login
          const isUserAdmin = await authService.isAdminUser(session.user.id);
          setIsAdmin(isUserAdmin);
          
          if (!isUserAdmin) {
            toast({
              title: "Access denied",
              description: "Your account does not have admin privileges.",
              variant: "destructive",
            });
            await authService.logout();
            return false;
          }
          
          toast({
            title: "Signed in successfully",
            description: "Welcome back!",
          });
          return true;
        }
        
        toast({
          title: "Authentication failed",
          description: "Invalid credentials or user not found.",
          variant: "destructive",
        });
        return false;
      } catch (authError: any) {
        console.error("Auth service error:", authError);
        toast({
          title: "Authentication failed",
          description: authError.message || "Failed to sign in. Please check your credentials.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      if (!supabase) {
        toast({
          title: "Authentication error",
          description: "Supabase client is not initialized. Please check your environment variables.",
          variant: "destructive",
        });
        return;
      }
      
      await authService.logout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
