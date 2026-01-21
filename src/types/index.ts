export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  settings: UserSettings;
  created_at: string;
}

export interface UserSettings {
  showProgressLabels: boolean;
  enableAnimations: boolean;
  levelSystemEnabled: boolean;
  celebrationEffectsEnabled: boolean;
}

export type AnimationType = 
  | 'progress-bar'
  | 'progress-circle'
  | 'fill-container'
  | 'grow'
  | 'pulse';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  animation_type: AnimationType;
  progression_mode: 'cumulative' | 'weekly' | 'monthly';
  // Cumulative
  target_value?: number;
  current_value?: number;
  target_unit?: string;
  target_end_date?: string;
  // Weekly
  weekly_target_sessions?: number;
  scheduled_days?: string[];
  // Monthly
  monthly_target_value?: number;
  monthly_target_unit?: string;
  // Decay
  decay_enabled: boolean;
  // Relations
  subcategories?: SubCategory[];
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  icon: string;
  color?: string;
  sort_order: number;
  micro_objectives?: MicroObjective[];
  created_at: string;
}

export interface MicroObjective {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  value?: number;
  value_unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  scheduled_days?: string[];
  scheduled_time?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface ObjectiveCompletion {
  id: string;
  micro_objective_id: string;
  completed_at: string;
  value?: number;
  notes?: string;
  created_at: string;
}

export interface DailyNote {
  id: string;
  user_id: string;
  category_id?: string;
  subcategory_id?: string;
  content: string;
  note_date: string;
  sort_order: number;
  created_at: string;
}

export interface ProgressHistory {
  id: string;
  category_id: string;
  record_date: string;
  progress_value: number;
  cumulative_value?: number;
  regularity_score?: number;
  created_at: string;
}

// Input types for creation
export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
  animation_type: AnimationType;
  progression_mode: 'cumulative' | 'weekly' | 'monthly';
  target_value?: number;
  target_unit?: string;
  target_end_date?: string;
  weekly_target_sessions?: number;
  scheduled_days?: string[];
  monthly_target_value?: number;
  monthly_target_unit?: string;
  decay_enabled?: boolean;
}