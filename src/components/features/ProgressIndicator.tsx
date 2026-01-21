import { ProgressAnimation } from '@/components/animations/ProgressAnimation';
import type { Category } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface ProgressIndicatorProps {
  category: Category;
  progress: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
}

export function ProgressIndicator({ 
  category, 
  progress,
  currentValue,
  targetValue,
  unit
}: ProgressIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <ProgressAnimation
          type={category.animation_type}
          progress={progress}
          color={category.color}
          icon={category.icon}
          size="lg"
        />
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h2>
        
        {category.progression_mode === 'cumulative' && currentValue !== undefined && targetValue !== undefined && (
          <div className="space-y-2">
            <div className="flex items-end justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {unit === 'EUR' || unit === '$' 
                  ? formatCurrency(currentValue, unit === '$' ? 'USD' : 'EUR')
                  : `${currentValue}${unit ? ` ${unit}` : ''}`
                }
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-lg font-medium mb-1">/</span>
              <span className="text-gray-400 dark:text-gray-500 text-lg font-medium mb-1">
                {unit === 'EUR' || unit === '$' 
                  ? formatCurrency(targetValue, unit === '$' ? 'USD' : 'EUR')
                  : `${targetValue}${unit ? ` ${unit}` : ''}`
                }
              </span>
            </div>
            <div className="mt-3">
              <div className="relative h-4 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${progress * 100}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm mt-3">
              <span className="font-bold" style={{ color: category.color }}>
                {formatPercentage(progress)}
              </span>
              <span className="text-gray-400">Continuez !</span>
            </div>
          </div>
        )}
        
        {category.progression_mode !== 'cumulative' && (
          <div className="text-lg font-bold" style={{ color: category.color }}>
            {formatPercentage(progress)}
          </div>
        )}
      </div>
    </div>
  );
}