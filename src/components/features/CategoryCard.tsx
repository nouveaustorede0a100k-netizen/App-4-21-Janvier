import { cn } from '@/utils/cn';
import { ProgressAnimation } from '@/components/animations/ProgressAnimation';
import { getIcon } from '@/constants/icons';
import type { Category } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  category: Category;
  progress?: number;
}

export function CategoryCard({ category, progress = 0 }: CategoryCardProps) {
  const navigate = useNavigate();
  const IconComponent = getIcon(category.icon);

  return (
    <button
      onClick={() => navigate(`/category/${category.id}`)}
      className="w-full p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-soft border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: category.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.progression_mode}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <ProgressAnimation
          type={category.animation_type}
          progress={progress}
          color={category.color}
          icon={category.icon}
          size="sm"
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="font-bold" style={{ color: category.color }}>
          {Math.round(progress * 100)}%
        </span>
        <span className="text-gray-400">
          {category.subcategories?.length || 0} sous-catégories
        </span>
      </div>
    </button>
  );
}