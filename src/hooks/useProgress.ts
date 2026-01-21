import { useMemo } from 'react';
import { calculateProgress } from '@/services/progressCalculator';
import { useObjectiveStore } from '@/stores/objectiveStore';
import type { Category } from '@/types';

export function useProgress(category: Category) {
  const { completions } = useObjectiveStore();

  const progress = useMemo(() => {
    // Get completions for all micro-objectives in this category
    const categoryMicroObjectiveIds = category.subcategories
      ?.flatMap(sub => sub.micro_objectives?.map(obj => obj.id) || []) || [];

    const categoryCompletions = completions.filter(c => 
      categoryMicroObjectiveIds.includes(c.micro_objective_id)
    );

    return calculateProgress({
      mode: category.progression_mode,
      category,
      completions: categoryCompletions,
    });
  }, [category, completions]);

  return {
    progress,
    percentage: Math.round(progress * 100),
  };
}