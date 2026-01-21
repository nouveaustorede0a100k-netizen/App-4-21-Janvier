import type { ObjectiveCompletion } from '@/types';
import { subDays, startOfDay } from 'date-fns';

export function calculateDecay(completions: ObjectiveCompletion[]): number {
  const sevenDaysAgo = subDays(new Date(), 7);
  const today = startOfDay(new Date());
  
  const recentCompletions = completions.filter(c => {
    const completedDate = new Date(c.completed_at);
    return completedDate >= sevenDaysAgo && completedDate <= today;
  });
  
  // Calculate percentage of goals completed in the last 7 days
  // For simplicity, we assume a baseline of expected completions
  // This can be enhanced based on scheduled frequency
  const daysCount = 7;
  const expectedCompletions = daysCount; // Simplified - should be based on frequency
  
  if (expectedCompletions <= 0) return 0;
  
  return Math.min(1, recentCompletions.length / expectedCompletions);
}