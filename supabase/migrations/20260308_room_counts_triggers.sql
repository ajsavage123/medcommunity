
-- Function to update room message count
CREATE OR REPLACE FUNCTION public.update_room_message_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.rooms 
    SET message_count = message_count + 1, updated_at = now()
    WHERE id = NEW.room_id;
    
    -- Also increment member count if this is the first message from this user in this room
    IF NOT EXISTS (
      SELECT 1 FROM public.messages 
      WHERE room_id = NEW.room_id AND user_id = NEW.user_id AND id != NEW.id
    ) THEN
      UPDATE public.rooms 
      SET member_count = member_count + 1
      WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.rooms 
    SET message_count = GREATEST(0, message_count - 1)
    WHERE id = OLD.room_id;
    
    -- Decrement member count if this was the only message from this user in this room
    IF NOT EXISTS (
      SELECT 1 FROM public.messages 
      WHERE room_id = OLD.room_id AND user_id = OLD.user_id AND id != OLD.id
    ) THEN
      UPDATE public.rooms 
      SET member_count = GREATEST(0, member_count - 1)
      WHERE id = OLD.room_id;
    END IF;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to update room counts
DROP TRIGGER IF EXISTS update_room_counts_trigger ON public.messages;
CREATE TRIGGER update_room_counts_trigger
AFTER INSERT OR DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_room_message_count();

-- Backfill counts for existing messages
UPDATE public.rooms r
SET 
  message_count = (SELECT COUNT(*) FROM public.messages m WHERE m.room_id = r.id),
  member_count = (SELECT COUNT(DISTINCT user_id) FROM public.messages m WHERE m.room_id = r.id);
