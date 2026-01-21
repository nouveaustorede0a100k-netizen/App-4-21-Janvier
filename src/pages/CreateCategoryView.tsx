import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProgressAnimation } from '@/components/animations/ProgressAnimation';
import { useCategoryStore } from '@/stores/categoryStore';
import { getIcon } from '@/constants/icons';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnimationType, CreateCategoryInput } from '@/types';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B'];
const ICONS = ['target', 'dollar', 'activity', 'heart', 'book', 'briefcase'];
const ANIMATION_TYPES: AnimationType[] = ['progress-bar', 'progress-circle', 'fill-container', 'grow'];

export default function CreateCategoryView() {
  const navigate = useNavigate();
  const { createCategory } = useCategoryStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateCategoryInput>>({
    name: '',
    color: COLORS[0],
    icon: ICONS[0],
    animation_type: 'progress-bar',
    progression_mode: 'cumulative',
    target_value: undefined,
    target_unit: '',
    decay_enabled: false,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.color || !formData.icon) return;

    try {
      const category = await createCategory({
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        animation_type: formData.animation_type || 'progress-bar',
        progression_mode: formData.progression_mode || 'cumulative',
        target_value: formData.target_value,
        target_unit: formData.target_unit,
        decay_enabled: formData.decay_enabled || false,
      } as CreateCategoryInput);

      if (category) {
        navigate(`/category/${category.id}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Créer une Catégorie
            </h1>
            <span className="text-sm text-gray-500">
              Étape {step}/4
            </span>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Nom de la catégorie"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Finance, Sport, Nutrition..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Couleur
                </label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {ICONS.map((icon) => {
                    const IconComponent = getIcon(icon);
                    return (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.icon === icon
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto" style={{ color: formData.color }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Objective Type */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mode de progression
                </label>
                <div className="space-y-2">
                  {(['cumulative', 'weekly', 'monthly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFormData({ ...formData, progression_mode: mode })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.progression_mode === mode
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="font-medium capitalize">{mode}</div>
                      <div className="text-sm text-gray-500">
                        {mode === 'cumulative' && 'Objectif cumulatif (ex: économiser 10 000€)'}
                        {mode === 'weekly' && 'Objectifs hebdomadaires récurrents'}
                        {mode === 'monthly' && 'Objectifs mensuels avec valeur cible'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.progression_mode === 'cumulative' && (
                <div className="space-y-4">
                  <Input
                    label="Valeur cible"
                    type="number"
                    value={formData.target_value?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || undefined })}
                    placeholder="10000"
                  />
                  <Input
                    label="Unité"
                    value={formData.target_unit || ''}
                    onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                    placeholder="€, kg, km..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Animation */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                  Type d'animation
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {ANIMATION_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, animation_type: type })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.animation_type === type
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <ProgressAnimation
                          type={type}
                          progress={0.65}
                          color={formData.color || '#3B82F6'}
                          icon={formData.icon}
                          size="sm"
                        />
                      </div>
                      <div className="text-sm font-medium capitalize text-center">
                        {type.replace('-', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <ProgressAnimation
                  type={formData.animation_type || 'progress-bar'}
                  progress={0.65}
                  color={formData.color || '#3B82F6'}
                  icon={formData.icon}
                  size="lg"
                />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold">{formData.name}</h3>
                <p className="text-gray-500">
                  Mode: {formData.progression_mode}
                </p>
                {formData.target_value && (
                  <p className="text-gray-500">
                    Cible: {formData.target_value} {formData.target_unit}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} disabled={!formData.name}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Créer
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}