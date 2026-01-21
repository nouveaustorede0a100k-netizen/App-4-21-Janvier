import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MicroObjectiveItemProps {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export function MicroObjectiveItem({
  id,
  name,
  description,
  isCompleted,
  onToggle,
}: MicroObjectiveItemProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all text-left"
    >
      <motion.div
        className={cn(
          'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
          isCompleted 
            ? 'bg-green-500 border-green-500' 
            : 'border-gray-300 dark:border-gray-600'
        )}
        animate={{ scale: isCompleted ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        {isCompleted && <Check className="w-4 h-4 text-white" />}
      </motion.div>
      <div className="flex-1">
        <p className={cn(
          'font-medium text-gray-700 dark:text-gray-200',
          isCompleted && 'line-through text-gray-400'
        )}>
          {name}
        </p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
}