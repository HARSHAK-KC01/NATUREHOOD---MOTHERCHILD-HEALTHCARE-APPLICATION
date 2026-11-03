import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../types/database';

export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = 'field_worker' | 'supervisor' | 'admin' | 'parent';

export interface AuthResponse {
  user: any | null;
  profile: UserProfile | null;
  error?: string | null;
}

export const authService = {
  /**
   * Get currently signed in Supabase user session
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  },

  /**
   * Get profile of user from profiles table
   */
  async getCurrentProfile(userId?: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const targetId = userId || (await this.getCurrentUser())?.id;
    if (!targetId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Sign in with Email and Password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: 'demo-user', email },
        profile: {
          id: 'demo-user',
          email,
          full_name: 'Priya Sharma',
          phone: '+91 98765 43210',
          role: 'field_worker',
          health_facility: 'PHC Rampur',
          area: 'Sector 4, Block 3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, profile: null, error: error.message };
    }

    const profile = await this.getCurrentProfile(data.user.id);
    return { user: data.user, profile, error: null };
  },

  /**
   * Sign up with Email and metadata
   */
  async signUp(email: string, password: string, fullName: string, role: UserRole): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: 'demo-user', email },
        profile: {
          id: 'demo-user',
          email,
          full_name: fullName,
          phone: '',
          role,
          health_facility: 'PHC Rampur',
          area: 'Sector 4, Block 3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      return { user: null, profile: null, error: error.message };
    }

    const profile = data.user ? await this.getCurrentProfile(data.user.id) : null;
    return { user: data.user, profile, error: null };
  },

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  },
};
