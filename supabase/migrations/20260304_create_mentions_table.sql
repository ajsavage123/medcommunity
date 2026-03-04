-- Create mentions table for tracking mentions and replies
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(message_id, mentioned_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user_id ON public.mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_message_id ON public.mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_mentions_created_at ON public.mentions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_by ON public.mentions(mentioned_by_user_id);

-- Enable RLS
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read mentions" ON public.mentions;
DROP POLICY IF EXISTS "Authenticated users can insert mentions" ON public.mentions;

-- Create policies
CREATE POLICY "Anyone can read mentions"
  ON public.mentions
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert mentions"
  ON public.mentions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create a trigger function to create notifications when someone is mentioned
CREATE OR REPLACE FUNCTION create_mention_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    description,
    related_user_id,
    related_message_id,
    action_url
  )
  SELECT
    NEW.mentioned_user_id,
    'mention'::text,
    'You were mentioned',
    'Someone mentioned you in a message',
    NEW.mentioned_by_user_id,
    NEW.message_id,
    '/messages/' || NEW.message_id::text
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications
    WHERE user_id = NEW.mentioned_user_id
    AND related_message_id = NEW.message_id
    AND type = 'mention'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS mention_notification_trigger ON public.mentions;

CREATE TRIGGER mention_notification_trigger
AFTER INSERT ON public.mentions
FOR EACH ROW
EXECUTE FUNCTION create_mention_notification();
