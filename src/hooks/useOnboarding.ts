import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type SectorType = Database['public']['Enums']['sector_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

interface OnboardingProfileData {
  name: string;
  gender?: 'male' | 'female' | 'other' | null;
  avatar_url?: string | null;
  userType: UserType | null;
  sector: SectorType | null;
  qualification: QualificationType | null;
  salary: number | null;
  experienceStartDate: string | null;
}

export function useUpdateOnboardingProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: OnboardingProfileData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // upsert ensures a profile row exists (handles missing triggers)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: data.name,
          gender: data.gender,
          avatar_url: data.avatar_url ?? null,
          user_type: data.userType,
          sector: data.sector,
          qualification: data.qualification,
          salary: data.salary,
          experience_start_date: data.experienceStartDate,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
