import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/userStore';

export default function AuthView() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp, loading } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Le nom est requis');
          return;
        }
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Goal Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="Nom"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            {isSignUp
              ? 'Déjà un compte ? Se connecter'
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </Card>
    </div>
  );
}