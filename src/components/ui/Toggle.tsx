import { cn } from '@/utils/cn';
import { InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Toggle({ label, checked, className, ...props }: ToggleProps) {
  return (
    <label className={cn('flex items-center justify-between cursor-pointer', className)}>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>}
      <div className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          'absolute inset-0 rounded-full transition-colors',
          checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
        )} />
        <div className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-0'
        )} />
      </div>
    </label>
  );
}