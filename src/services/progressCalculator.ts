import type { Category, ObjectiveCompletion } from '@/types';
import { getStartOfWeek, getStartOfMonth, countScheduledDaysBetween } from '@/utils/dates';

interface ProgressParams {
  mode: 'cumulative' | 'weekly' | 'monthly';
  category: Category;
  completions: ObjectiveCompletion[];
}

export function calculateProgress(params: ProgressParams): number {
  const { mode, category, completions } = params;
  
  switch (mode) {
    case 'cumulative':
      return calculateCumulativeProgress(category);
    case 'weekly':
      return calculateWeeklyProgress(category, completions);
    case 'monthly':
      return calculateMonthlyProgress(category, completions);
    default:
      return 0;
  }
}

function calculateCumulativeProgress(category: Category): number {
  if (!category.target_value || category.target_value === 0) return 0;
  return Math.min(1, (category.current_value || 0) / category.target_value);
}

function calculateWeeklyProgress(
  category: Category, 
  completions: ObjectiveCompletion[]
): number {
  const startOfWeek = getStartOfWeek(new Date());
  const today = new Date();
  
  const scheduledDays = category.scheduled_days || [];
  const expectedByNow = countScheduledDaysBetween(startOfWeek, today, scheduledDays);
  
  if (expectedByNow === 0) return 0;
  
  const weekCompletions = completions.filter(c => {
    const completedDate = new Date(c.completed_at);
    return completedDate >= startOfWeek && completedDate <= today;
  });
  
  return Math.min(1, weekCompletions.length / expectedByNow);
}

function calculateMonthlyProgress(
  category: Category,
  completions: ObjectiveCompletion[]
): number {
  const startOfMonth = getStartOfMonth(new Date());
  
  const monthValue = completions
    .filter(c => {
      const completedDate = new Date(c.completed_at);
      return completedDate >= startOfMonth;
    })
    .reduce((sum, c) => sum + (c.value || 0), 0);
  
  if (!category.monthly_target_value) return 0;
  return Math.min(1, monthValue / category.monthly_target_value);
}