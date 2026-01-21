import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, color = '#3B82F6', className, showLabel }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}