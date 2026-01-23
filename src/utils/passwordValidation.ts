/**
 * Validation et utilitaires pour les mots de passe
 */

export interface PasswordStrength {
  score: number; // 0-4 (0 = très faible, 4 = très fort)
  feedback: string[];
  isValid: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

/**
 * Calcule la force d'un mot de passe
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length === 0) {
    return {
      score: 0,
      feedback: [],
      isValid: false,
    };
  }

  // Longueur minimale
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Au moins 8 caractères');
  }

  // Longueur recommandée
  if (password.length >= 12) {
    score += 1;
  }

  // Contient une majuscule
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Une majuscule');
  }

  // Contient une minuscule
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Une minuscule');
  }

  // Contient un chiffre
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un chiffre');
  }

  // Contient un caractère spécial
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un caractère spécial (!@#$%^&*)');
  }

  const isValid = password.length >= 8 && score >= 3;

  return {
    score: Math.min(score, 4),
    feedback: feedback.length > 0 ? feedback : [],
    isValid,
  };
}

/**
 * Valide un mot de passe selon les critères
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const strength = calculatePasswordStrength(password);

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    isValid: errors.length === 0 && strength.isValid,
    errors,
    strength,
  };
}

/**
 * Obtient le label de force du mot de passe
 */
export function getPasswordStrengthLabel(score: number): string {
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  return labels[Math.min(score, 4)] || 'Très faible';
}

/**
 * Obtient la couleur de force du mot de passe
 */
export function getPasswordStrengthColor(score: number): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];
  return colors[Math.min(score, 4)] || 'bg-gray-500';
}
