import { cn } from '@/utils/cn';
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, padding = 'md', className, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-gray-800 shadow-soft border border-gray-100 dark:border-gray-700',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}