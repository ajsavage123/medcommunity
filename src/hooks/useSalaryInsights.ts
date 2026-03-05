import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export interface SalaryData {
  id: string;
  userId: string;
  role: string;
  sector: string;
  location: string;
  salary: number;
  experienceYears: number;
  currency: string;
  workingHours: number;
  createdAt: string;
}

export interface SalaryInsight {
  role: string;
  sector: string;
  experienceLevel: string;
  count: number;
  average: number;
  median: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

export function useSalaryInsights(experienceYears?: number, sector?: string) {
  const queryClient = useQueryClient();

  // Fetch salary insights based on filters
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['salaryInsights', experienceYears, sector],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('salary_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // deduplicate by user - keep most recent entry
        const deduped = (data || []).reduce<any[]>((acc, item) => {
          const idx = acc.findIndex(a => a.user_id === item.user_id);
          if (idx === -1) acc.push(item);
          else if (new Date(item.created_at) > new Date(acc[idx].created_at)) acc[idx] = item;
          return acc;
        }, []);

        // Process and aggregate the data
        const aggregated = aggregateSalaryData(deduped, experienceYears, sector);
        return aggregated;
      } catch (error) {
        console.error('Error fetching salary insights:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('salary_posts_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'salary_posts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['salaryInsights'] });
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  return { insights, isLoading };
}

function aggregateSalaryData(
  data: any[],
  experienceYears?: number,
  sector?: string
): SalaryInsight[] {
  // Filter data
  let filtered = data;
  if (experienceYears !== undefined) {
    const minExp = Math.max(0, experienceYears - 2);
    const maxExp = experienceYears + 2;
    filtered = filtered.filter((d) => d.experience_years >= minExp && d.experience_years <= maxExp);
  }
  if (sector) {
    filtered = filtered.filter((d) => d.sector === sector);
  }

  // Group by role
  const grouped: Record<string, any[]> = {};
  filtered.forEach((item) => {
    const key = `${item.role}_${item.sector}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item.salary);
  });

  // Calculate insights
  return Object.entries(grouped).map(([key, salaries]) => {
    const [role, sect] = key.split('_');
    const sorted = salaries.sort((a, b) => a - b);
    const average = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      role,
      sector: sect,
      experienceLevel: experienceYears ? `${experienceYears}y` : 'all',
      count: salaries.length,
      average: Math.round(average),
      median: Math.round(median),
      min: Math.round(Math.min(...salaries)),
      max: Math.round(Math.max(...salaries)),
      trend: 'stable' as const,
    };
  });
}

export function useSubmitSalaryData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<SalaryData, 'id' | 'userId' | 'createdAt'>) => {
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
      queryClient.invalidateQueries({ queryKey: ['salaryInsights'] });
    },
  });
}

export function useSalaryData() {
  return useQuery({
    queryKey: ['salaryData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      // map DB rows (snake_case) to camelCase expected by UI
      return (data || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        role: r.role,
        sector: r.sector,
        location: r.location,
        salary: r.salary,
        experienceYears: r.experience_years ?? r.experienceYears ?? 0,
        currency: r.currency,
        workingHours: r.working_hours ?? r.workingHours ?? 0,
        createdAt: r.created_at,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}
