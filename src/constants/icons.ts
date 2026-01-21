import {
  Target,
  DollarSign,
  Activity,
  Apple,
  Heart,
  BookOpen,
  Briefcase,
  Home,
  Calendar,
  Settings,
  Plus,
  ChevronLeft,
  Check,
  X,
  Edit,
  Trash2,
  Save,
  Clock,
  MapPin,
} from 'lucide-react';

export const iconMap: Record<string, any> = {
  target: Target,
  dollar: DollarSign,
  activity: Activity,
  apple: Apple,
  heart: Heart,
  book: BookOpen,
  briefcase: Briefcase,
  home: Home,
  calendar: Calendar,
  settings: Settings,
  plus: Plus,
  chevronLeft: ChevronLeft,
  check: Check,
  x: X,
  edit: Edit,
  trash: Trash2,
  save: Save,
  clock: Clock,
  mapPin: MapPin,
};

export function getIcon(name: string) {
  return iconMap[name.toLowerCase()] || Target;
}