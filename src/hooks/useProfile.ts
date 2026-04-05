import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];
type SectorType = Database['public']['Enums']['sector_type'];
type DesignationType = string;

interface Profile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  gender?: string;
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

        const profileData = data as any;
        return {
          id: profileData.id,
          userId: profileData.user_id,
          name: profileData.name,
          avatarUrl: profileData.avatar_url,
          gender: profileData.gender,
          userType: profileData.user_type as UserType,
          qualification: profileData.qualification as QualificationType,
          designation: profileData.designation as DesignationType,
          sector: profileData.sector as SectorType,
          salary: profileData.salary,
          experienceStartDate: profileData.experience_start_date,
          onboardingCompleted: profileData.onboarding_completed,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
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
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        return data.map(r => r.role);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}
