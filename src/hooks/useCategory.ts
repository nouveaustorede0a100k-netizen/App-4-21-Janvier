import { useEffect } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';

export function useCategory(categoryId?: string) {
  const { 
    currentCategory, 
    categories, 
    loading, 
    error, 
    fetchCategory, 
    fetchCategories 
  } = useCategoryStore();

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    } else {
      fetchCategories();
    }
  }, [categoryId]);

  return {
    category: categoryId ? currentCategory : null,
    categories: categoryId ? [] : categories,
    loading,
    error,
    refetch: categoryId ? () => fetchCategory(categoryId) : fetchCategories,
  };
}