import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';

export default function SettingsView() {
  const { user, fetchUser, updateSettings, signOut } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  const handleToggle = (key: keyof typeof user?.settings, value: boolean) => {
    if (user) {
      updateSettings({ [key]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:ml-64 pb-24 lg:pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paramètres
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Personnalisez votre expérience
          </p>
        </div>

        {/* Display Preferences */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Préférences d'affichage
          </h2>
          <div className="space-y-4">
            <Toggle
              label="Afficher les labels de progression"
              checked={user?.settings.showProgressLabels ?? true}
              onChange={(e) => handleToggle('showProgressLabels', e.target.checked)}
            />
            <Toggle
              label="Activer les animations"
              checked={user?.settings.enableAnimations ?? true}
              onChange={(e) => handleToggle('enableAnimations', e.target.checked)}
            />
          </div>
        </Card>

        {/* Gamification */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Gamification
          </h2>
          <div className="space-y-4">
            <Toggle
              label="Système de niveaux"
              checked={user?.settings.levelSystemEnabled ?? false}
              onChange={(e) => handleToggle('levelSystemEnabled', e.target.checked)}
            />
            <Toggle
              label="Effets de célébration"
              checked={user?.settings.celebrationEffectsEnabled ?? true}
              onChange={(e) => handleToggle('celebrationEffectsEnabled', e.target.checked)}
            />
          </div>
        </Card>

        {/* Account */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Compte
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom</p>
              <p className="text-gray-900 dark:text-white">{user?.name}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div className="space-y-4">
            <Button variant="secondary" className="w-full">
              Exporter les données
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                  signOut();
                }
              }}
            >
              Déconnexion
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}