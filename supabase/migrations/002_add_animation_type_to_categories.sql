-- Migration: Add animation_type column to categories table if it doesn't exist
-- This migration ensures the animation_type column exists in the categories table

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'animation_type'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN animation_type TEXT NOT NULL DEFAULT 'progress-bar';
        
        RAISE NOTICE 'Column animation_type added to categories table';
    ELSE
        RAISE NOTICE 'Column animation_type already exists in categories table';
    END IF;
END $$;
