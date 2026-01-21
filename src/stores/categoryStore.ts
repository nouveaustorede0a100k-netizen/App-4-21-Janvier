import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Category, CreateCategoryInput } from '@/types';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  fetchCategory: (id: string) => Promise<void>;
  createCategory: (data: CreateCategoryInput) => Promise<Category | null>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateProgress: (id: string, value: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (
            *,
            micro_objectives (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ categories: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (
            *,
            micro_objectives (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      set({ currentCategory: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createCategory: async (data: CreateCategoryInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          ...data,
          user_id: user.id,
          current_value: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        categories: [newCategory, ...state.categories]
      }));
      
      return newCategory;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        categories: state.categories.map(c => 
          c.id === id ? { ...c, ...data } : c
        ),
        currentCategory: state.currentCategory?.id === id 
          ? { ...state.currentCategory, ...data }
          : state.currentCategory
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        currentCategory: state.currentCategory?.id === id ? null : state.currentCategory
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateProgress: async (id: string, value: number) => {
    await get().updateCategory(id, { current_value: value });
  },
}));