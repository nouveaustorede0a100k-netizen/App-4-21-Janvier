export const categoryColors: Record<string, string> = {
  finance: '#3B82F6',
  sport: '#F97316',
  nutrition: '#10B981',
  lifestyle: '#8B5CF6',
  health: '#EF4444',
  education: '#F59E0B',
};

export function getCategoryColor(categoryName: string, defaultColor?: string): string {
  const normalizedName = categoryName.toLowerCase();
  return categoryColors[normalizedName] || defaultColor || '#3B82F6';
}