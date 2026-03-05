import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];
type SectorType = Database['public']['Enums']['sector_type'];
type DesignationType = Database['public']['Enums']['designation_type'];

interface Profile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  gender?: 'male' | 'female' | 'other';
  userType: UserType | null;
  qualification: QualificationType | null;
  designation: DesignationType | null;
  sector: SectorType | null;
  salary: number | null;
  experienceStartDate: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function getExperienceYears(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) return null;

        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          avatarUrl: data.avatar_url,
          gender: data.gender as 'male' | 'female' | 'other' | undefined,
          userType: data.user_type as UserType,
          qualification: data.qualification as QualificationType,
          designation: data.designation as DesignationType,
          sector: data.sector as SectorType,
          salary: data.salary,
          experienceStartDate: data.experience_start_date,
          onboardingCompleted: data.onboarding_completed,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, avatarUrl }: { name?: string; avatarUrl?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...(name && { name }),
          ...(avatarUrl && { avatar_url: avatarUrl }),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // This would typically query a user_roles table
        // For now, returning empty array - customize based on your needs
        return [];
      } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}
