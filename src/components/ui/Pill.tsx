import { cn } from '@/utils/cn';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  color?: string;
}

export function Pill({ label, icon, active, color, className, ...props }: PillProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-full transition-all text-sm font-medium whitespace-nowrap',
        active 
          ? 'text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      )}
      style={active && color ? { backgroundColor: color } : undefined}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}