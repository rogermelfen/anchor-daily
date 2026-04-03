-- ============================================
-- Anchor Daily - Database Schema (Supabase / PostgreSQL)
-- Migration 001: Initial Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    selected_focus TEXT CHECK (selected_focus IN ('stress', 'decisions', 'relationships')),
    is_premium BOOLEAN DEFAULT FALSE,
    trial_start_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'expired', 'cancelled')),
    push_enabled BOOLEAN DEFAULT FALSE,
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- REFLECTIONS TABLE
-- ============================================
CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    theme TEXT NOT NULL CHECK (theme IN ('stress', 'decisions', 'relationships')),
    short_reflection TEXT NOT NULL,
    practical_application TEXT NOT NULL,
    question TEXT NOT NULL,
    premium_extended_version TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    publish_date DATE,
    is_premium_only BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Everyone can read published reflections
CREATE POLICY "Anyone can view published reflections"
    ON public.reflections FOR SELECT
    USING (status = 'published');

-- Only admins (service role) can insert/update/delete reflections
-- Admin operations will use the service_role key, bypassing RLS

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own journal entries
CREATE POLICY "Users can view own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- ADMIN USERS TABLE (for admin panel access)
-- ============================================
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_reflections_theme_status ON public.reflections(theme, status);
CREATE INDEX idx_reflections_publish_date ON public.reflections(publish_date);
CREATE INDEX idx_reflections_theme_date ON public.reflections(theme, publish_date DESC);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX idx_users_push_enabled ON public.users(push_enabled) WHERE push_enabled = TRUE;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
    BEFORE UPDATE ON public.reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get today's reflection for a given theme
CREATE OR REPLACE FUNCTION get_today_reflection(p_theme TEXT)
RETURNS SETOF public.reflections AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.reflections
    WHERE theme = p_theme
      AND status = 'published'
      AND publish_date <= CURRENT_DATE
    ORDER BY publish_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
