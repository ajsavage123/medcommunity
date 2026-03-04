import { useQuery } from '@tanstack/react-query';
import { Tool } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async (): Promise<Tool[]> => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
