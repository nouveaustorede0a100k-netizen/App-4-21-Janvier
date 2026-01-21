import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className, checked, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
          checked
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 dark:border-gray-600 peer-hover:border-gray-400'
        )}>
          {checked && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      {label && (
        <span className={cn(
          'font-medium',
          checked && 'line-through text-gray-400'
        )}>
          {label}
        </span>
      )}
    </label>
  );
}