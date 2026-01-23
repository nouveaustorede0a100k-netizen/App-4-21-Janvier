import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/services/supabase';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      // Utilise Supabase Auth pour envoyer l'email de réinitialisation
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        // Ne pas révéler si l'email existe ou non pour la sécurité
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
        console.error('Password reset error:', resetError);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
              <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {success
              ? 'Vérifiez votre boîte email'
              : 'Entrez votre adresse email et nous vous enverrons un lien de réinitialisation'}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                Veuillez vérifier votre boîte de réception et suivre les instructions.
              </p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-2">
              <p>💡 <strong>Astuce :</strong> Vérifiez aussi votre dossier spam.</p>
              <p>⏱️ Le lien est valide pendant 1 heure.</p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
              disabled={loading}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim()}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>

            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
