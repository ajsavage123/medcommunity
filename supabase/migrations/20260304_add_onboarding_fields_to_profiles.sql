-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT,
ADD COLUMN IF NOT EXISTS qualification TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS salary INTEGER,
ADD COLUMN IF NOT EXISTS experience_start_date DATE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE public.user_type AS ENUM (
    'student',
    'intern',
    'employee',
    'instructor',
    'faculty',
    'hr',
    'international_coordinator'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.qualification_type AS ENUM (
    'diploma_emt',
    'pg_diploma',
    'bsc_emt'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.sector_type AS ENUM (
    'private',
    'government',
    'ngo'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Alter the columns to use the enums if they're not already
ALTER TABLE public.profiles
ALTER COLUMN user_type TYPE public.user_type USING user_type::public.user_type,
ALTER COLUMN qualification TYPE public.qualification_type USING qualification::public.qualification_type,
ALTER COLUMN sector TYPE public.sector_type USING sector::public.sector_type,
ALTER COLUMN gender TYPE public.gender_type USING gender::public.gender_type;
