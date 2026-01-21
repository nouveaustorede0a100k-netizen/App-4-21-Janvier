import { cn } from '@/utils/cn';
import { MapPin, Clock } from 'lucide-react';

interface ObjectiveCardProps {
  title: string;
  timeRange: string;
  location?: string;
  categoryColor: string;
  categoryIcon?: React.ReactNode;
  categoryLabel?: string;
  isCompleted?: boolean;
  onClick?: () => void;
}

export function ObjectiveCard({ 
  title, 
  timeRange, 
  location, 
  categoryColor,
  categoryIcon,
  categoryLabel,
  isCompleted,
  onClick 
}: ObjectiveCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-transform hover:scale-[1.02]',
        'border-l-4 border-y border-r border-gray-100 dark:border-gray-700',
        isCompleted ? 'bg-white/60 dark:bg-gray-800/60 opacity-60' : 'bg-white dark:bg-gray-800 shadow-soft'
      )}
      style={{ borderLeftColor: categoryColor }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {categoryLabel && (
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor
                }}
              >
                {categoryLabel}
              </span>
            </div>
          )}
          <h3 className={cn(
            'text-base font-bold text-gray-900 dark:text-white',
            isCompleted && 'line-through decoration-gray-400 decoration-2'
          )}>
            {title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeRange}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
        <div 
          className="rounded-full p-2 flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryIcon || <span className="text-white text-lg">✓</span>}
        </div>
      </div>
    </button>
  );
}