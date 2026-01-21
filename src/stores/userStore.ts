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
    console.log('[DEBUG] signIn called', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('[DEBUG] signInWithPassword result', { 
        hasError: !!error, 
        errorCode: error?.code, 
        errorMessage: error?.message, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session 
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log('[DEBUG] calling fetchUser', { userId: data.user.id });
        await get().fetchUser();
      }
    } catch (error) {
      console.error('[DEBUG] signIn error caught', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) throw error;
      
      // Profile will be created automatically by the trigger
      // If user is immediately available, fetch it, otherwise it will be created on email verification
      if (data.user && data.session) {
        await get().fetchUser();
      } else {
        // Email confirmation required - profile will be created by trigger when email is confirmed
        set({ loading: false });
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
    console.log('[DEBUG] fetchUser called');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      console.log('[DEBUG] getUser result', { 
        hasAuthUser: !!authUser, 
        authUserId: authUser?.id, 
        authUserEmail: authUser?.email 
      });
      
      if (!authUser) {
        set({ user: null, loading: false });
        return;
      }

      // Try to fetch profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      console.log('[DEBUG] profile fetch result', { 
        hasError: !!error, 
        errorCode: error?.code, 
        errorMessage: error?.message, 
        errorDetails: error?.details, 
        hasData: !!data 
      });
      
      // If profile doesn't exist, create it automatically
      if (error && (error.code === 'PGRST116' || error.message?.includes('No rows returned'))) {
        console.log('[DEBUG] profile missing, creating', { userId: authUser.id });
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            name: name,
            settings: {
              showProgressLabels: true,
              enableAnimations: true,
              levelSystemEnabled: false,
              celebrationEffectsEnabled: true,
            },
          })
          .select()
          .single();
        
        console.log('[DEBUG] profile create result', { 
          hasError: !!createError, 
          errorCode: createError?.code, 
          errorMessage: createError?.message, 
          hasProfile: !!newProfile 
        });
        
        if (createError) throw createError;
        data = newProfile;
      } else if (error) {
        throw error;
      }
      
      console.log('[DEBUG] fetchUser success', { hasData: !!data, profileId: data?.id });
      
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
      console.error('[DEBUG] fetchUser error caught', error);
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