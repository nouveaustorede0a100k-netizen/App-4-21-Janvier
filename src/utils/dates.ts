import { 
  startOfWeek, 
  startOfMonth, 
  startOfDay,
  isSameDay,
  format,
  parseISO,
  differenceInDays,
  eachDayOfInterval,
  getDay
} from 'date-fns'
import { fr } from 'date-fns/locale'

export function getStartOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return startOfMonth(date);
}

export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}

export function formatDate(date: Date | string, formatStr: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  try {
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return format(dateObj, formatStr);
  }
}

export function countScheduledDaysBetween(
  startDate: Date,
  endDate: Date,
  scheduledDays: string[]
): number {
  if (!scheduledDays || scheduledDays.length === 0) return 0;

  const dayMap: Record<string, number> = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0,
  };

  const targetDayNumbers = scheduledDays.map(day => dayMap[day.toLowerCase()]);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => targetDayNumbers.includes(getDay(day))).length;
}

export function getDayName(day: string): string {
  const dayMap: Record<string, string> = {
    'monday': 'Lundi',
    'tuesday': 'Mardi',
    'wednesday': 'Mercredi',
    'thursday': 'Jeudi',
    'friday': 'Vendredi',
    'saturday': 'Samedi',
    'sunday': 'Dimanche',
  };
  return dayMap[day.toLowerCase()] || day;
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // HH:MM
}