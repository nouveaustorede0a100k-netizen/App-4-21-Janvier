import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProgressIndicator } from '@/components/features/ProgressIndicator';
import { SubCategoryPill } from '@/components/features/SubCategoryPill';
import { MicroObjectiveItem } from '@/components/features/MicroObjectiveItem';
import { DailyNotesDrawer } from '@/components/layout/DailyNotesDrawer';
import { Button } from '@/components/ui/Button';
import { useCategoryStore } from '@/stores/categoryStore';
import { useObjectiveStore } from '@/stores/objectiveStore';
import { useUIStore } from '@/stores/uiStore';
import { useProgress } from '@/hooks/useProgress';
import { useObjectives } from '@/hooks/useObjectives';
import { ChevronLeft, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const { currentCategory, fetchCategory, loading } = useCategoryStore();
  const { toggleCompletion, completions, fetchCompletions } = useObjectiveStore();
  const { setNotesDrawer } = useUIStore();

  const { progress } = currentCategory ? useProgress(currentCategory) : { progress: 0 };
  const { objectives } = useObjectives(new Date(), selectedSubcategory || undefined);

  useEffect(() => {
    // FIX: Ajout des dépendances manquantes
    if (id) {
      fetchCategory(id);
      fetchCompletions(undefined, new Date());
    }
  }, [id, fetchCategory, fetchCompletions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Catégorie non trouvée</p>
          <Button onClick={() => navigate('/goals')}>Retour aux objectifs</Button>
        </div>
      </div>
    );
  }

  const getObjectiveCompletionStatus = (objectiveId: string): boolean => {
    return completions.some(
      c => c.micro_objective_id === objectiveId && 
      new Date(c.completed_at).toDateString() === new Date().toDateString()
    );
  };

  const handleObjectiveToggle = (objectiveId: string) => {
    const isCompleted = getObjectiveCompletionStatus(objectiveId);
    toggleCompletion(objectiveId, !isCompleted);
  };

  const filteredObjectives = selectedSubcategory
    ? objectives.filter(obj => obj.subcategory_id === selectedSubcategory)
    : objectives;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:ml-64 pb-24 lg:pb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <ProgressIndicator
            category={currentCategory}
            progress={progress}
            currentValue={currentCategory.current_value}
            targetValue={currentCategory.target_value}
            unit={currentCategory.target_unit}
          />
        </Card>

        {/* Sub-category Pills */}
        {currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
          <section className="flex gap-3 overflow-x-auto no-scrollbar py-1 mb-6">
            <SubCategoryPill
              subcategory={{ id: 'all', name: 'Tous', category_id: currentCategory.id, icon: 'target', sort_order: 0, created_at: new Date().toISOString() } as any}
              active={selectedSubcategory === null}
              onClick={() => setSelectedSubcategory(null)}
            />
            {currentCategory.subcategories.map((subcategory) => (
              <SubCategoryPill
                key={subcategory.id}
                subcategory={subcategory}
                active={selectedSubcategory === subcategory.id}
                onClick={() => setSelectedSubcategory(
                  selectedSubcategory === subcategory.id ? null : subcategory.id
                )}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Open create subcategory modal */}}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle sous-catégorie
            </Button>
          </section>
        )}

        {/* Daily Goals Section */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
            Objectifs du Jour
          </h3>
          <Card padding="none">
            <div className="flex flex-col gap-3 p-4">
              {filteredObjectives.length > 0 ? (
                filteredObjectives.map((objective) => (
                  <MicroObjectiveItem
                    key={objective.id}
                    id={objective.id}
                    name={objective.name}
                    description={objective.description}
                    isCompleted={getObjectiveCompletionStatus(objective.id)}
                    onToggle={handleObjectiveToggle}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Aucun objectif pour aujourd'hui</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Daily Notes Section */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notes Quotidiennes ({currentCategory.name})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotesDrawer(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <Card>
            <textarea
              placeholder="Notez vos pensées et réflexions..."
              className="w-full h-32 p-4 rounded-xl bg-transparent border-0 resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-shadow"
              onClick={() => setNotesDrawer(true)}
            />
            <p className="text-xs text-gray-400 mt-2 px-4 pb-2">
              Cliquez pour ajouter une note
            </p>
          </Card>
        </section>
      </main>

      <BottomNav />
      <DailyNotesDrawer categoryId={currentCategory.id} />
    </div>
  );
}