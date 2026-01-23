import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { supabase } from '@/services/supabase';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import {
  validatePassword,
  getPasswordStrengthLabel,
  type PasswordValidationResult,
} from '@/utils/passwordValidation';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);

  // Vérifier si on a un token dans l'URL (Supabase gère ça automatiquement via hash)
  useEffect(() => {
    // Supabase utilise le hash de l'URL pour le token, pas les query params
    // On vérifie juste que la page est accessible
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Si pas de session, c'est peut-être qu'on attend le token dans le hash
        // Supabase le gérera automatiquement lors de l'appel updateUser
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (password) {
      const result = validatePassword(password);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!validation || !validation.isValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    setLoading(true);

    try {
      // Supabase gère automatiquement le token depuis l'URL hash
      // On met juste à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
          setError('Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.');
        } else {
          setError(updateError.message || 'Une erreur est survenue lors de la réinitialisation');
        }
        console.error('Password update error:', updateError);
      } else {
        setSuccess(true);
        // Redirection automatique après 3 secondes
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mot de passe réinitialisé !
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Votre mot de passe a été mis à jour avec succès.
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Aller à la connexion
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Entrez votre nouveau mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              disabled={loading}
            />
            
            {/* Indicateur de force du mot de passe */}
            {password && validation && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Force du mot de passe :</span>
                  <span className={`font-medium ${
                    validation.strength.score >= 3 ? 'text-green-600 dark:text-green-400' :
                    validation.strength.score >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {getPasswordStrengthLabel(validation.strength.score)}
                  </span>
                </div>
                <ProgressBar 
                  progress={validation.strength.score / 4} 
                  showLabel={false}
                />
                
                {/* Critères */}
                {validation.strength.feedback.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="font-medium">Critères manquants :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {validation.strength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            
            {/* Vérification de correspondance */}
            {confirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Les mots de passe correspondent</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</span>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || !confirmPassword || !validation?.isValid || password !== confirmPassword}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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
      </Card>
    </div>
  );
}
