-- ==========================================
-- 🛠️ CODEBLUER ADMIN INFRASTRUCTURE SETUP
-- ==========================================
-- Run this in your Supabase SQL Editor to grant naravaajay@gmail.com full admin 
-- rights and set up the required moderation tables.

-- 1. Setup the Database Roles Enum if it doesn't already exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'verified', 'paid', 'admin');
  END IF;
END $$;

-- 2. Create the user_roles table to track user types (like 'admin')
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 3. Create the notifications table (Required for sending Admin Warnings/Bans)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL, -- 'warning', 'info', 'alert'
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Set up Permission Policies (Crucial for the App to see its own role)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications 
FOR SELECT USING (auth.uid() = user_id);

-- 6. GRANT ADMIN ACCESS TO THE REQUESTED USER
-- Ensure unique constraint exists for ON CONFLICT
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key') THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE email = 'naravaajay@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ==========================================
-- ✅ SETUP COMPLETE
-- 1. Press 'Run' in the SQL Editor.
-- 2. Refresh your app (Index/Profile page).
-- 3. You should now see the 'Admin Dashboard' button in your Profile.
-- ==========================================
