import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Pill } from '@/components/ui/Pill';
import { ObjectiveCard } from '@/components/features/ObjectiveCard';
import { Timeline, TimelineItem } from '@/components/features/Timeline';
import { DailyNotesDrawer } from '@/components/layout/DailyNotesDrawer';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCategoryStore } from '@/stores/categoryStore';
import { useObjectiveStore } from '@/stores/objectiveStore';
import { useUIStore } from '@/stores/uiStore';
import { useObjectives } from '@/hooks/useObjectives';
import { getIcon } from '@/constants/icons';
import { Plus } from 'lucide-react';
import { formatTime } from '@/utils/dates';

export default function DailyView() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { categories, fetchCategories } = useCategoryStore();
  const { toggleCompletion, completions, fetchCompletions } = useObjectiveStore();
  const { setNotesDrawer } = useUIStore();
  const { objectives } = useObjectives(new Date(), selectedCategory || undefined);

  useEffect(() => {
    fetchCategories();
    fetchCompletions(undefined, new Date());
  }, []);

  const handleObjectiveClick = (objectiveId: string) => {
    const isCompleted = completions.some(
      c => c.micro_objective_id === objectiveId && 
      new Date(c.completed_at).toDateString() === new Date().toDateString()
    );
    toggleCompletion(objectiveId, !isCompleted);
  };

  const getObjectiveCompletionStatus = (objectiveId: string): boolean => {
    return completions.some(
      c => c.micro_objective_id === objectiveId && 
      new Date(c.completed_at).toDateString() === new Date().toDateString()
    );
  };

  const completedCount = objectives.filter(obj => 
    getObjectiveCompletionStatus(obj.id)
  ).length;
  const totalCount = objectives.length;
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0;

  const sortedObjectives = [...objectives].sort((a, b) => {
    const timeA = a.scheduled_time || '00:00';
    const timeB = b.scheduled_time || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:ml-64 pb-24 lg:pb-6">
        {/* Overall Progress */}
        <section className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Aujourd'hui
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary-500">
                {completedCount}/{totalCount} Objectifs
              </p>
            </div>
          </div>
          <ProgressBar progress={overallProgress} showLabel />
        </section>

        {/* Category Filter Pills */}
        <section className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-4 mb-6">
          <div className="flex gap-3">
            <Pill
              label="Tous"
              active={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              className="shrink-0"
            />
            {categories.map((cat) => {
              const IconComponent = getIcon(cat.icon);
              return (
                <Pill
                  key={cat.id}
                  label={cat.name}
                  icon={<IconComponent className="w-4 h-4" />}
                  active={selectedCategory === cat.id}
                  color={cat.color}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className="shrink-0"
                />
              );
            })}
            <Pill
              label="Nouveau"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/goals')}
              className="shrink-0"
            />
          </div>
        </section>

        {/* Timeline / Activity Feed */}
        <section className="mb-6">
          <Timeline>
            {sortedObjectives.length > 0 ? (
              sortedObjectives.map((objective) => {
                const category = categories.find(cat =>
                  cat.subcategories?.some(sub =>
                    sub.micro_objectives?.some(obj => obj.id === objective.id)
                  )
                );
                if (!category) return null;

                const IconComponent = getIcon(category.icon);
                const isCompleted = getObjectiveCompletionStatus(objective.id);
                const time = objective.scheduled_time || '00:00';

                return (
                  <TimelineItem key={objective.id} time={formatTime(time)}>
                    <ObjectiveCard
                      title={objective.name}
                      timeRange={time}
                      location={objective.location}
                      categoryColor={category.color}
                      categoryIcon={<IconComponent className="w-5 h-5 text-white" />}
                      categoryLabel={category.name}
                      isCompleted={isCompleted}
                      onClick={() => handleObjectiveClick(objective.id)}
                    />
                  </TimelineItem>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Aucun objectif prévu pour aujourd'hui</p>
                <button
                  onClick={() => navigate('/goals')}
                  className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
                >
                  Créer un objectif
                </button>
              </div>
            )}
          </Timeline>
        </section>

        {/* Daily Notes Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notes Quotidiennes
            </h3>
            <button
              onClick={() => setNotesDrawer(true)}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Voir tout
            </button>
          </div>
          <button
            onClick={() => setNotesDrawer(true)}
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            + Ajouter une note
          </button>
        </section>
      </main>

      <BottomNav />
      <DailyNotesDrawer />
    </div>
  );
}