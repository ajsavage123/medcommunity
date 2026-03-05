-- Add designation field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS designation TEXT;

-- Create enum type for designation if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.designation_type AS ENUM (
    'paramedic',
    'emt',
    'emr',
    'advanced_emt',
    'advanced_paramedic',
    'instructor',
    'hr',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Alter the column to use the enum if it's not already
ALTER TABLE public.profiles
ALTER COLUMN designation TYPE public.designation_type USING designation::public.designation_type;
