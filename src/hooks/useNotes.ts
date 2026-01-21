import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import type { DailyNote } from '@/types';

interface UseNotesOptions {
  categoryId?: string;
  subcategoryId?: string;
  date?: Date;
}

export function useNotes({ categoryId, subcategoryId, date }: UseNotesOptions = {}) {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [categoryId, subcategoryId, date]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('note_date', dateStr);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setNotes(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
  };
}