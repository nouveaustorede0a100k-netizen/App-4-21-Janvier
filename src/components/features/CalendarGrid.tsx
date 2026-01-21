import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CalendarGridProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  markedDates?: Array<{ date: Date; color: string }>;
}

export function CalendarGrid({ selectedDate, onDateSelect, markedDates = [] }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = monthStart.getDay();
  const daysToPrepend = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDateColor = (date: Date): string | undefined => {
    const marked = markedDates.find(m => isSameDay(m.date, date));
    return marked?.color;
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: daysToPrepend }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {daysInMonth.map(day => {
          const dateColor = getDateColor(day);
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-all',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                today && 'ring-2 ring-primary-500',
                selected && 'bg-primary-500 text-white hover:bg-primary-600',
                !selected && !today && 'text-gray-700 dark:text-gray-200',
                !isSameMonth(day, currentMonth) && 'opacity-30'
              )}
            >
              {format(day, 'd')}
              {dateColor && (
                <div 
                  className="w-1 h-1 mx-auto mt-1 rounded-full"
                  style={{ backgroundColor: dateColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}