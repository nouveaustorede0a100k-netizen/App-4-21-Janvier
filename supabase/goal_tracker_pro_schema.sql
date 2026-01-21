-- ============================================================================
-- GOAL TRACKER PRO - Schema SQL Complet
-- Stack: React Native Expo + Supabase
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------

-- Extension UUID pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les fonctions JSONB avancées
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. TYPES ENUM
-- ----------------------------------------------------------------------------

-- Statut des objectifs
DO $$ BEGIN
    CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Catégories d'objectifs
DO $$ BEGIN
    CREATE TYPE goal_category AS ENUM ('health', 'career', 'finance', 'learning', 'personal', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 3. TABLES
-- ----------------------------------------------------------------------------

-- Table profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
    total_xp INTEGER DEFAULT 0 NOT NULL CHECK (total_xp >= 0),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table goals (objectifs principaux)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category goal_category NOT NULL DEFAULT 'other',
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    status goal_status NOT NULL DEFAULT 'active',
    target_date DATE,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
    parent_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT no_self_parent CHECK (id != parent_goal_id)
);

-- Table milestones (jalons des objectifs)
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMPTZ,
    order_index INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER DEFAULT 0 NOT NULL CHECK (xp_reward >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table daily_tasks (tâches quotidiennes)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMPTZ,
    xp_reward INTEGER DEFAULT 10 NOT NULL CHECK (xp_reward >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table achievements (badges/succès)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 50 NOT NULL CHECK (xp_reward >= 0),
    condition_type TEXT NOT NULL, -- 'streak', 'xp', 'goals_completed', 'tasks_completed', 'custom'
    condition_value JSONB NOT NULL, -- {"streak_days": 7} ou {"xp_amount": 1000} ou {"goals_count": 5}
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table user_achievements (badges débloqués)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Table activity_log (historique actions)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- 'task_completed', 'goal_completed', 'milestone_completed', 'achievement_unlocked', 'xp_earned'
    entity_type TEXT, -- 'goal', 'task', 'milestone', 'achievement'
    entity_id UUID,
    xp_earned INTEGER DEFAULT 0 NOT NULL CHECK (xp_earned >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. INDEXES pour performance
-- ----------------------------------------------------------------------------

-- Indexes sur user_id (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON public.daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_scheduled_date ON public.daily_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- Indexes sur goal_id
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON public.milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_goal_id ON public.daily_tasks(goal_id);

-- Indexes sur created_at pour requêtes récentes
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_created_at ON public.daily_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Indexes sur status et dates
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_daily_tasks_scheduled_date_user ON public.daily_tasks(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_milestones_order ON public.milestones(goal_id, order_index);

-- Index composite pour recherche d'objectifs actifs par utilisateur
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status) WHERE status IN ('active', 'paused');

-- ----------------------------------------------------------------------------
-- 5. FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate level from XP
-- Level formula: level = floor(sqrt(total_xp / 100)) + 1
CREATE OR REPLACE FUNCTION public.calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(GREATEST(total_xp, 0) / 100.0))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Add XP and update level
CREATE OR REPLACE FUNCTION public.add_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS JSONB AS $$
DECLARE
    old_level INTEGER;
    new_level INTEGER;
    new_total_xp INTEGER;
    level_up BOOLEAN := false;
BEGIN
    -- Get current stats
    SELECT level, total_xp INTO old_level, new_total_xp
    FROM public.profiles
    WHERE id = user_uuid
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Calculate new XP and level
    new_total_xp := new_total_xp + xp_amount;
    new_level := public.calculate_level(new_total_xp);
    level_up := new_level > old_level;

    -- Update profile
    UPDATE public.profiles
    SET 
        total_xp = new_total_xp,
        level = new_level,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Return result
    RETURN jsonb_build_object(
        'old_level', old_level,
        'new_level', new_level,
        'old_xp', new_total_xp - xp_amount,
        'new_xp', new_total_xp,
        'xp_added', xp_amount,
        'level_up', level_up
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievements(user_uuid UUID)
RETURNS SETOF UUID AS $$
DECLARE
    achievement_rec RECORD;
    condition_met BOOLEAN;
    unlocked_achievement_id UUID;
BEGIN
    -- Loop through all achievements not yet unlocked by user
    FOR achievement_rec IN
        SELECT a.*
        FROM public.achievements a
        WHERE a.id NOT IN (
            SELECT ua.achievement_id
            FROM public.user_achievements ua
            WHERE ua.user_id = user_uuid
        )
    LOOP
        condition_met := false;

        -- Check condition based on type
        CASE achievement_rec.condition_type
            WHEN 'streak' THEN
                SELECT (current_streak >= (achievement_rec.condition_value->>'streak_days')::INTEGER)
                INTO condition_met
                FROM public.profiles
                WHERE id = user_uuid;

            WHEN 'xp' THEN
                SELECT (total_xp >= (achievement_rec.condition_value->>'xp_amount')::INTEGER)
                INTO condition_met
                FROM public.profiles
                WHERE id = user_uuid;

            WHEN 'goals_completed' THEN
                SELECT (COUNT(*) >= (achievement_rec.condition_value->>'goals_count')::INTEGER)
                INTO condition_met
                FROM public.goals
                WHERE user_id = user_uuid AND status = 'completed';

            WHEN 'tasks_completed' THEN
                SELECT (COUNT(*) >= (achievement_rec.condition_value->>'tasks_count')::INTEGER)
                INTO condition_met
                FROM public.daily_tasks
                WHERE user_id = user_uuid AND is_completed = true;

            -- Add more condition types as needed
            ELSE
                condition_met := false;
        END CASE;

        -- Unlock achievement if condition met
        IF condition_met THEN
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (user_uuid, achievement_rec.id)
            ON CONFLICT (user_id, achievement_id) DO NOTHING
            RETURNING achievement_id INTO unlocked_achievement_id;

            IF unlocked_achievement_id IS NOT NULL THEN
                -- Add XP reward
                PERFORM public.add_xp(user_uuid, achievement_rec.xp_reward);

                -- Log achievement unlock
                INSERT INTO public.activity_log (
                    user_id,
                    action_type,
                    entity_type,
                    entity_id,
                    xp_earned,
                    metadata
                ) VALUES (
                    user_uuid,
                    'achievement_unlocked',
                    'achievement',
                    achievement_rec.id,
                    achievement_rec.xp_reward,
                    jsonb_build_object('achievement_name', achievement_rec.name)
                );

                -- Return unlocked achievement ID
                RETURN NEXT unlocked_achievement_id;
            END IF;
        END IF;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function: Update streak
CREATE OR REPLACE FUNCTION public.update_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    last_task_date DATE;
    today_date DATE := CURRENT_DATE;
    current_streak_count INTEGER;
BEGIN
    -- Get last completed task date
    SELECT MAX(scheduled_date)
    INTO last_task_date
    FROM public.daily_tasks
    WHERE user_id = user_uuid AND is_completed = true;

    -- Get current streak
    SELECT current_streak INTO current_streak_count
    FROM public.profiles
    WHERE id = user_uuid;

    -- Update streak
    IF last_task_date IS NULL THEN
        -- No tasks completed yet
        UPDATE public.profiles
        SET current_streak = 0
        WHERE id = user_uuid;
    ELSIF last_task_date = today_date THEN
        -- Task completed today, increment if previous day was yesterday
        IF current_streak_count > 0 THEN
            SELECT MAX(scheduled_date)
            INTO last_task_date
            FROM public.daily_tasks
            WHERE user_id = user_uuid 
                AND is_completed = true 
                AND scheduled_date < today_date
            ORDER BY scheduled_date DESC
            LIMIT 1;

            IF last_task_date = today_date - INTERVAL '1 day' THEN
                -- Streak continues
                UPDATE public.profiles
                SET 
                    current_streak = current_streak + 1,
                    longest_streak = GREATEST(longest_streak, current_streak + 1)
                WHERE id = user_uuid;
            ELSIF last_task_date < today_date - INTERVAL '1 day' THEN
                -- Streak broken, reset to 1
                UPDATE public.profiles
                SET current_streak = 1
                WHERE id = user_uuid;
            END IF;
        ELSE
            -- Starting new streak
            UPDATE public.profiles
            SET current_streak = 1
            WHERE id = user_uuid;
        END IF;
    ELSIF last_task_date < today_date - INTERVAL '1 day' THEN
        -- Streak broken
        UPDATE public.profiles
        SET current_streak = 0
        WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 6. TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Auto-update updated_at on goals
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Update goal progress when milestone is completed
CREATE OR REPLACE FUNCTION public.update_goal_progress_on_milestone()
RETURNS TRIGGER AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    new_progress INTEGER;
BEGIN
    IF NEW.is_completed != OLD.is_completed THEN
        -- Count milestones for this goal
        SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
        INTO total_milestones, completed_milestones
        FROM public.milestones
        WHERE goal_id = NEW.goal_id;

        -- Calculate progress
        IF total_milestones > 0 THEN
            new_progress := (completed_milestones * 100) / total_milestones;
        ELSE
            new_progress := 0;
        END IF;

        -- Update goal progress
        UPDATE public.goals
        SET 
            progress = new_progress,
            status = CASE 
                WHEN new_progress >= 100 THEN 'completed'::goal_status
                WHEN status = 'completed' AND new_progress < 100 THEN 'active'::goal_status
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = NEW.goal_id;

        -- Log milestone completion
        IF NEW.is_completed AND NEW.xp_reward > 0 THEN
            PERFORM public.add_xp(
                (SELECT user_id FROM public.goals WHERE id = NEW.goal_id),
                NEW.xp_reward
            );

            INSERT INTO public.activity_log (
                user_id,
                action_type,
                entity_type,
                entity_id,
                xp_earned
            ) VALUES (
                (SELECT user_id FROM public.goals WHERE id = NEW.goal_id),
                'milestone_completed',
                'milestone',
                NEW.id,
                NEW.xp_reward
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_goal_progress_on_milestone ON public.milestones;
CREATE TRIGGER trigger_update_goal_progress_on_milestone
    AFTER UPDATE OF is_completed ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION public.update_goal_progress_on_milestone();

-- Trigger: Add XP and log when task is completed
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed AND NOT OLD.is_completed THEN
        -- Add XP
        PERFORM public.add_xp(NEW.user_id, NEW.xp_reward);

        -- Update streak
        PERFORM public.update_streak(NEW.user_id);

        -- Log activity
        INSERT INTO public.activity_log (
            user_id,
            action_type,
            entity_type,
            entity_id,
            xp_earned
        ) VALUES (
            NEW.user_id,
            'task_completed',
            'task',
            NEW.id,
            NEW.xp_reward
        );

        -- Update completed_at
        NEW.completed_at := NOW();

        -- Check achievements
        PERFORM public.check_achievements(NEW.user_id);
    ELSIF NOT NEW.is_completed AND OLD.is_completed THEN
        -- Task uncompleted (shouldn't happen often, but handle it)
        NEW.completed_at := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_task_completion ON public.daily_tasks;
CREATE TRIGGER trigger_handle_task_completion
    BEFORE UPDATE OF is_completed ON public.daily_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- Trigger: Add XP and log when goal is completed
CREATE OR REPLACE FUNCTION public.handle_goal_completion()
RETURNS TRIGGER AS $$
DECLARE
    goal_xp_reward INTEGER := 100; -- Base XP for completing a goal
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Add XP (more XP for completing a goal)
        PERFORM public.add_xp(NEW.user_id, goal_xp_reward);

        -- Log activity
        INSERT INTO public.activity_log (
            user_id,
            action_type,
            entity_type,
            entity_id,
            xp_earned
        ) VALUES (
            NEW.user_id,
            'goal_completed',
            'goal',
            NEW.id,
            goal_xp_reward
        );

        -- Check achievements
        PERFORM public.check_achievements(NEW.user_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_goal_completion ON public.goals;
CREATE TRIGGER trigger_handle_goal_completion
    AFTER UPDATE OF status ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_goal_completion();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own goals" ON public.goals;
CREATE POLICY "Users can create own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- Milestones policies
DROP POLICY IF EXISTS "Users can view milestones of own goals" ON public.milestones;
CREATE POLICY "Users can view milestones of own goals"
    ON public.milestones FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create milestones for own goals" ON public.milestones;
CREATE POLICY "Users can create milestones for own goals"
    ON public.milestones FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update milestones of own goals" ON public.milestones;
CREATE POLICY "Users can update milestones of own goals"
    ON public.milestones FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete milestones of own goals" ON public.milestones;
CREATE POLICY "Users can delete milestones of own goals"
    ON public.milestones FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Daily tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.daily_tasks;
CREATE POLICY "Users can view own tasks"
    ON public.daily_tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tasks" ON public.daily_tasks;
CREATE POLICY "Users can create own tasks"
    ON public.daily_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.daily_tasks;
CREATE POLICY "Users can update own tasks"
    ON public.daily_tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.daily_tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.daily_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Achievements policies (public read, no insert/update/delete for users)
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements"
    ON public.achievements FOR SELECT
    USING (true);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert user achievements" ON public.user_achievements;
CREATE POLICY "System can insert user achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Activity log policies
DROP POLICY IF EXISTS "Users can view own activity log" ON public.activity_log;
CREATE POLICY "Users can view own activity log"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_log;
CREATE POLICY "System can insert activity logs"
    ON public.activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. SEED DATA - Achievements de base
-- ----------------------------------------------------------------------------

-- Clear existing achievements (optional - comment if you want to keep existing)
-- DELETE FROM public.achievements;

-- Streak achievements
INSERT INTO public.achievements (name, description, icon_url, xp_reward, condition_type, condition_value, rarity)
VALUES 
    ('Getting Started', 'Complete your first task', '🔥', 25, 'streak', '{"streak_days": 1}'::jsonb, 'common'),
    ('Week Warrior', 'Maintain a 7-day streak', '💪', 100, 'streak', '{"streak_days": 7}'::jsonb, 'rare'),
    ('Month Master', 'Maintain a 30-day streak', '👑', 500, 'streak', '{"streak_days": 30}'::jsonb, 'epic'),
    ('Centurion', 'Maintain a 100-day streak', '🏆', 2000, 'streak', '{"streak_days": 100}'::jsonb, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- XP achievements
INSERT INTO public.achievements (name, description, icon_url, xp_reward, condition_type, condition_value, rarity)
VALUES 
    ('First Steps', 'Earn your first 100 XP', '⭐', 50, 'xp', '{"xp_amount": 100}'::jsonb, 'common'),
    ('Rising Star', 'Reach 1,000 total XP', '🌟', 200, 'xp', '{"xp_amount": 1000}'::jsonb, 'rare'),
    ('Elite Performer', 'Accumulate 10,000 XP', '💫', 1000, 'xp', '{"xp_amount": 10000}'::jsonb, 'epic'),
    ('Legendary', 'Reach 50,000 total XP', '✨', 5000, 'xp', '{"xp_amount": 50000}'::jsonb, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- Goals achievements
INSERT INTO public.achievements (name, description, icon_url, xp_reward, condition_type, condition_value, rarity)
VALUES 
    ('Goal Setter', 'Complete your first goal', '🎯', 100, 'goals_completed', '{"goals_count": 1}'::jsonb, 'common'),
    ('Achiever', 'Complete 5 goals', '🏅', 250, 'goals_completed', '{"goals_count": 5}'::jsonb, 'rare'),
    ('Champion', 'Complete 25 goals', '🥇', 1000, 'goals_completed', '{"goals_count": 25}'::jsonb, 'epic'),
    ('Goal Master', 'Complete 100 goals', '🏆', 5000, 'goals_completed', '{"goals_count": 100}'::jsonb, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- Tasks achievements
INSERT INTO public.achievements (name, description, icon_url, xp_reward, condition_type, condition_value, rarity)
VALUES 
    ('Task Master', 'Complete 50 tasks', '✅', 150, 'tasks_completed', '{"tasks_count": 50}'::jsonb, 'common'),
    ('Productivity Pro', 'Complete 250 tasks', '⚡', 500, 'tasks_completed', '{"tasks_count": 250}'::jsonb, 'rare'),
    ('Unstoppable', 'Complete 1,000 tasks', '🚀', 2000, 'tasks_completed', '{"tasks_count": 1000}'::jsonb, 'epic'),
    ('Task Legend', 'Complete 5,000 tasks', '💎', 10000, 'tasks_completed', '{"tasks_count": 5000}'::jsonb, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- FIN DU SCHÉMA
-- ============================================================================
