import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CategoryCard } from '@/components/features/CategoryCard';
import { Button } from '@/components/ui/Button';
import { useCategoryStore } from '@/stores/categoryStore';
import { useProgress } from '@/hooks/useProgress';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '@/types';

function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCardWithProgress key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryCardWithProgress({ category }: { category: Category }) {
  const { progress } = useProgress(category);
  return <CategoryCard category={category} progress={progress} />;
}

export default function GoalsView() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { categories, fetchCategories, loading } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:ml-64 pb-24 lg:pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mes Objectifs
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gérez vos catégories d'objectifs et suivez votre progression
            </p>
          </div>
          <Button
            onClick={() => navigate('/goals/create')}
            className="hidden lg:flex"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Catégorie
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Vous n'avez pas encore de catégories d'objectifs
            </p>
            <Button onClick={() => navigate('/goals/create')}>
              <Plus className="w-5 h-5 mr-2" />
              Créer une catégorie
            </Button>
          </div>
        ) : (
          <CategoryGrid categories={categories} />
        )}

        {/* Mobile FAB */}
        <button
          onClick={() => navigate('/goals/create')}
          className="fixed bottom-24 right-6 lg:hidden w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}