import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CalendarGrid } from '@/components/features/CalendarGrid';
import { ObjectiveCard } from '@/components/features/ObjectiveCard';
import { Card } from '@/components/ui/Card';
import { useCategoryStore } from '@/stores/categoryStore';
import { useObjectives } from '@/hooks/useObjectives';
import { getIcon } from '@/constants/icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CalendarView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { categories } = useCategoryStore();
  const { objectives } = useObjectives(selectedDate);

  // Create marked dates with colors from categories
  const markedDates = categories.flatMap(category => {
    // This is simplified - in reality, you'd check which dates have objectives
    return [];
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:ml-64 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarGrid
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              markedDates={markedDates}
            />
          </div>

          {/* Selected Date Details */}
          <div>
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </h3>
              
              {objectives.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {objectives.length} objectif{objectives.length > 1 ? 's' : ''} actif{objectives.length > 1 ? 's' : ''}
                  </p>
                  {objectives.map((objective) => {
                    const category = categories.find(cat =>
                      cat.subcategories?.some(sub =>
                        sub.micro_objectives?.some(obj => obj.id === objective.id)
                      )
                    );
                    
                    if (!category) return null;
                    
                    const IconComponent = getIcon(category.icon);
                    
                    return (
                      <ObjectiveCard
                        key={objective.id}
                        title={objective.name}
                        timeRange={objective.scheduled_time || '00:00'}
                        location={objective.location}
                        categoryColor={category.color}
                        categoryIcon={<IconComponent className="w-5 h-5 text-white" />}
                        categoryLabel={category.name}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Aucun objectif pour ce jour</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}