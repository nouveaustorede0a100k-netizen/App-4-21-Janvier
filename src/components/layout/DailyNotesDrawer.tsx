import { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { supabase } from '@/services/supabase';
import type { DailyNote } from '@/types';
import { Save } from 'lucide-react';

interface DailyNotesDrawerProps {
  categoryId?: string;
  subcategoryId?: string;
  date?: Date;
}

export function DailyNotesDrawer({ categoryId, subcategoryId, date }: DailyNotesDrawerProps) {
  const { isNotesDrawerOpen, setNotesDrawer } = useUIStore();
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNotesDrawerOpen) {
      fetchNotes();
    }
  }, [isNotesDrawerOpen, categoryId, subcategoryId, date]);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      const { data } = await query;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveNote = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const noteDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_notes')
        .insert({
          user_id: user.id,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          content,
          note_date: noteDate,
          sort_order: 0,
        });

      if (error) throw error;

      setContent('');
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isNotesDrawerOpen}
      onClose={() => setNotesDrawer(false)}
      title="Notes Quotidiennes"
      side="right"
    >
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Notez vos pensées, réflexions, ou observations..."
            className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 shadow-soft resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-shadow"
          />
          <Button
            onClick={saveNote}
            disabled={loading || !content.trim()}
            className="absolute bottom-4 right-4"
            size="sm"
          >
            <Save className="w-4 h-4 mr-1" />
            Enregistrer
          </Button>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
            >
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}