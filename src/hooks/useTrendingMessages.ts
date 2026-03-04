import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeProfile } from '@/hooks/useRealtime';
import { getExperienceYears } from '@/hooks/useProfile';
import { systemRooms } from '@/data/mockData';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export interface TrendingMessage {
  id: string;
  content: string;
  roomId: string;
  roomName: string;
  roomType: string;
  isAnonymous: boolean;
  isPinned: boolean;
  createdAt: Date;
  upvotes: number;
  score: number;
  user?: {
    id: string;
    name?: string;
    userType: UserType | null;
    qualification: QualificationType | null;
    experienceYears: number;
  };
}

const roomMap = systemRooms.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {} as Record<string, typeof systemRooms[0]>);

// helper score function
function computeScore(msg: any) {
  let score = (msg.likes || 0) * 3 + (msg.replies || 0) * 2;
  if (msg.is_pinned) score += 50;
  return score;
}

export function useTrendingMessages(limit: number = 10) {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();

  useEffect(() => {
    if (profile) {
      queryClient.invalidateQueries({ queryKey: ['trending-messages', limit] });
    }
  }, [profile, limit, queryClient]);

  return useQuery({
    queryKey: ['trending-messages', limit],
    queryFn: async (): Promise<TrendingMessage[]> => {
      // Fetch messages separately
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (msgError) throw msgError;
      const messages = msgs || [];

      // Gather unique user IDs and fetch profiles
      const userIds = Array.from(new Set(messages.map((m: any) => m.user_id)));
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: pData, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        if (pError) throw pError;
        profiles = pData || [];
      }

      const findProfile = (uid: string) => profiles.find(p => p.user_id === uid);

      const arr = messages.map((m: any) => {
        const room = roomMap[m.room_id] || { name: 'General', type: 'general' };
        const profile = findProfile(m.user_id);
        return {
          id: m.id,
          content: m.content,
          roomId: m.room_id,
          roomName: room.name,
          roomType: room.type,
          isAnonymous: m.is_anonymous,
          isPinned: m.is_pinned,
          createdAt: new Date(m.created_at),
          upvotes: m.likes,
          score: computeScore(m),
          user: profile
            ? {
                id: profile.id,
                name: profile.name || undefined,
                userType: profile.user_type as UserType,
                qualification: profile.qualification as QualificationType,
                experienceYears: getExperienceYears(
                  profile.experience_start_date
                ),
              }
            : undefined,
        };
      });

      return arr
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (a.score !== b.score) return b.score - a.score;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });
}
