import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { User, UserSettings } from '@/types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await get().fetchUser();
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            settings: {
              showProgressLabels: true,
              enableAnimations: true,
              levelSystemEnabled: false,
              celebrationEffectsEnabled: true,
            },
          });
        
        if (profileError) throw profileError;
        
        await get().fetchUser();
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        set({ user: null, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) throw error;
      
      set({ 
        user: {
          ...data,
          email: authUser.email || '',
          settings: data.settings || {
            showProgressLabels: true,
            enableAnimations: true,
            levelSystemEnabled: false,
            celebrationEffectsEnabled: true,
          },
        } as User,
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    try {
      const currentUser = get().user;
      if (!currentUser) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ settings: { ...currentUser.settings, ...settings } })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      set(state => ({
        user: state.user ? {
          ...state.user,
          settings: { ...state.user.settings, ...settings }
        } : null
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));