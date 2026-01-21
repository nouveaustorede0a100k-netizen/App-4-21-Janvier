import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Calendar, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/goals', label: 'Objectifs', icon: Target },
    { path: '/calendar', label: 'Calendrier', icon: Calendar },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 p-2 transition-colors flex-1',
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              {isActive ? (
                <div className="bg-primary-500/10 px-4 py-0.5 rounded-full">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'font-bold' : ''
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}