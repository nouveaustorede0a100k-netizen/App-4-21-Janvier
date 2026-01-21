import { ReactNode } from 'react';

interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return (
    <section className="flex flex-col gap-0 relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[54px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700 z-0" />
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

interface TimelineItemProps {
  time: string;
  children: ReactNode;
  isActive?: boolean;
}

export function TimelineItem({ time, children, isActive }: TimelineItemProps) {
  return (
    <div className="group relative flex gap-4 z-10 mb-6 last:mb-0">
      <div className={`
        w-10 pt-3 text-xs font-semibold text-right shrink-0
        ${isActive ? 'text-primary-500' : 'text-gray-400'}
      `}>
        {time}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}