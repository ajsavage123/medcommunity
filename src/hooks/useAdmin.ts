import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      console.log('🛡️ Admin check for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('❌ Supabase Admin Error:', error.message, error.details);
        return false;
      }

      console.log('🛡️ Admin check result:', !!data);
      return !!data;
    },
    enabled: !!user,
  });

  return {
    isAdmin: !!isAdmin,
    isLoading,
  };
}
