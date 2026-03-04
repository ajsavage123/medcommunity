import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SalaryPost } from '@/types';

export function useSalaryData() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['salary-posts'],
    queryFn: async (): Promise<SalaryPost[]> => {
      try {
        const { data, error } = await supabase
          .from('salary_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        if (error) throw error;

        return (data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          role: item.role,
          sector: item.sector,
          location: item.location,
          salary: item.salary,
          experienceYears: item.experience_years,
          currency: item.currency || 'INR',
          workingHours: item.working_hours || 12,
          createdAt: new Date(item.created_at),
        }));
      } catch (error) {
        console.error('Error fetching salary data:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const sub = supabase
      .channel('salary_posts_data')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'salary_posts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['salary-posts'] });
        }
      )
      .subscribe();

    return () => {
      sub?.unsubscribe();
    };
  }, [queryClient]);

  return result;
}

export function useSubmitSalaryData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      role: string;
      sector: string;
      location: string;
      experienceYears: number;
      salary: number;
      currency: string;
      workingHours: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('salary_posts').insert({
        user_id: user.id,
        role: data.role,
        sector: data.sector,
        location: data.location,
        salary: data.salary,
        experience_years: data.experienceYears,
        currency: data.currency,
        working_hours: data.workingHours,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-posts'] });
    },
  });
}

// Alias for backward compat
export const useSubmitSalary = useSubmitSalaryData;
