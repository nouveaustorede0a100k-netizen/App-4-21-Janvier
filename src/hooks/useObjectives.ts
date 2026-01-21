import { useEffect, useState } from 'react';
import { useObjectiveStore } from '@/stores/objectiveStore';
import type { MicroObjective } from '@/types';

export function useObjectives(date?: Date, subcategoryId?: string) {
  const { getTodayObjectives, loading, error } = useObjectiveStore();
  const [objectives, setObjectives] = useState<MicroObjective[]>([]);

  useEffect(() => {
    const fetchObjectives = async () => {
      const data = await getTodayObjectives();
      let filtered = data;

      if (subcategoryId) {
        filtered = data.filter(obj => obj.subcategory_id === subcategoryId);
      }

      setObjectives(filtered);
    };

    fetchObjectives();
  }, [date, subcategoryId]);

  return {
    objectives,
    loading,
    error,
  };
}