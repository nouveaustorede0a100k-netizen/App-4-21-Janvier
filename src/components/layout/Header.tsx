import { Link, useLocation } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { user } = useUserStore();

  const getTitle = () => {
    if (location.pathname === '/') return 'Vue Quotidienne';
    if (location.pathname === '/goals') return 'Mes Objectifs';
    if (location.pathname === '/calendar') return 'Calendrier';
    if (location.pathname === '/settings') return 'Paramètres';
    if (location.pathname.startsWith('/category/')) return 'Catégorie';
    return 'Goal Tracker';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                {getTitle()}
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}