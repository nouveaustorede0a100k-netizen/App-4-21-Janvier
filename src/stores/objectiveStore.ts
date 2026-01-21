import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { MicroObjective, ObjectiveCompletion, SubCategory } from '@/types';

interface ObjectiveState {
  completions: ObjectiveCompletion[];
  loading: boolean;
  error: string | null;
  
  fetchCompletions: (microObjectiveId?: string, date?: Date) => Promise<void>;
  toggleCompletion: (microObjectiveId: string, completed: boolean, value?: number, notes?: string) => Promise<void>;
  getTodayObjectives: () => Promise<MicroObjective[]>;
  createSubCategory: (categoryId: string, name: string, icon: string, color?: string) => Promise<SubCategory | null>;
  createMicroObjective: (subcategoryId: string, data: Partial<MicroObjective>) => Promise<MicroObjective | null>;
  updateMicroObjective: (id: string, data: Partial<MicroObjective>) => Promise<void>;
  deleteMicroObjective: (id: string) => Promise<void>;
}

export const useObjectiveStore = create<ObjectiveState>((set) => ({
  completions: [],
  loading: false,
  error: null,

  fetchCompletions: async (microObjectiveId?: string, date?: Date) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('objective_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (microObjectiveId) {
        query = query.eq('micro_objective_id', microObjectiveId);
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('completed_at', startOfDay.toISOString())
          .lte('completed_at', endOfDay.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      set({ completions: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  toggleCompletion: async (microObjectiveId: string, completed: boolean, value?: number, notes?: string) => {
    try {
      if (completed) {
        const { data, error } = await supabase
          .from('objective_completions')
          .insert({
            micro_objective_id: microObjectiveId,
            value,
            notes,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        
        set(state => ({
          completions: [data, ...state.completions]
        }));
      } else {
        // Find and delete the most recent completion for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: toDelete } = await supabase
          .from('objective_completions')
          .select('id')
          .eq('micro_objective_id', microObjectiveId)
          .gte('completed_at', today.toISOString())
          .lt('completed_at', tomorrow.toISOString())
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (toDelete) {
          const { error } = await supabase
            .from('objective_completions')
            .delete()
            .eq('id', toDelete.id);
          
          if (error) throw error;
          
          set(state => ({
            completions: state.completions.filter(c => c.id !== toDelete.id)
          }));
        }
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getTodayObjectives: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // This is a simplified version - in reality, we'd need to filter by frequency and scheduled_days
      const { data, error } = await supabase
        .from('micro_objectives')
        .select(`
          *,
          subcategories!inner (
            category_id,
            categories!inner (user_id)
          )
        `)
        .eq('subcategories.categories.user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as MicroObjective[];
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  },

  createSubCategory: async (categoryId: string, name: string, icon: string, color?: string) => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert({
          category_id: categoryId,
          name,
          icon,
          color,
          sort_order: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  createMicroObjective: async (subcategoryId: string, data: Partial<MicroObjective>) => {
    try {
      const { data: newObjective, error } = await supabase
        .from('micro_objectives')
        .insert({
          ...data,
          subcategory_id: subcategoryId,
          is_active: true,
          frequency: data.frequency || 'daily',
        } as MicroObjective)
        .select()
        .single();
      
      if (error) throw error;
      return newObjective;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateMicroObjective: async (id: string, data: Partial<MicroObjective>) => {
    try {
      const { error } = await supabase
        .from('micro_objectives')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteMicroObjective: async (id: string) => {
    try {
      const { error } = await supabase
        .from('micro_objectives')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));