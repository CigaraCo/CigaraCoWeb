
import { supabase } from '../client';

export const authService = {
  async login(email: string, password: string) {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async logout() {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Supabase client is not initialized');
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async isAdminUser(userId: string) {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return false;
    }
    
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};
