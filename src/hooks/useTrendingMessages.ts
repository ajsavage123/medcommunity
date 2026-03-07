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
  replies: number;
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
export function computeScore(msg: { likes?: number; replies?: number; is_pinned?: boolean }) {
  let score = (msg.likes || 0) * 3 + (msg.replies || 0) * 2;
  if (msg.is_pinned) score += 50;
  return score;
}

// helper used for filtering/transforming raw rows; exported for testing
export function processRawMessages(
  messages: any[],
  profiles: any[],
  limit: number
): TrendingMessage[] {
  const findProfile = (uid: string) => profiles.find(p => p.user_id === uid);

  const arr: TrendingMessage[] = messages.map((m: any) => {
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
      upvotes: m.likes || 0,
      replies: m.replies || 0,
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

  // deduplicate
  const unique = arr.reduce<TrendingMessage[]>((acc, item) => {
    if (!acc.find(x => x.id === item.id)) acc.push(item);
    return acc;
  }, []);

  return unique;
}

export function useTrendingMessages(limit: number = 10) {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();

  useEffect(() => {
    if (profile) {
      queryClient.invalidateQueries({ queryKey: ['trending-messages', limit] });
    }
  }, [profile, limit, queryClient]);

  useEffect(() => {
    const channel = supabase.channel('trending-messages-updates');

    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['trending-messages', limit] });
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [limit, queryClient]);

  return useQuery({
    queryKey: ['trending-messages', limit],
    queryFn: async (): Promise<TrendingMessage[]> => {
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or('likes.gt.0,replies.gt.0,is_pinned.eq.true')
        .order('created_at', { ascending: false })
        .limit(100);

      if (msgError) throw msgError;
      const messages = msgs || [];

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

      const unique = processRawMessages(messages, profiles, limit);

      // If we have few real messages, supplement with realistic mock data to make the app feel alive
      // while staying within the Supabase Free Tier row limits.
      if (unique.length < 5) {
        // Pick 3 high-quality mock posts with correct enum types
        const mocks: TrendingMessage[] = [
          {
            id: 'mock-trend-1',
            content: 'Pro tip for ACLS 2026: Focus on the megacode scenarios. They love testing algorithm application under pressure. Know EVERY branch of the pulseless arrest flowchart cold!',
            roomId: 'room-certifications',
            roomName: 'Certifications',
            roomType: 'certifications',
            isAnonymous: false,
            isPinned: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), 
            upvotes: 84,
            replies: 22,
            score: 156,
            user: {
              id: 'm-u-1',
              name: 'Dr. Vikram Sethi',
              userType: 'instructor',
              qualification: 'pg_diploma',
              experienceYears: 12
            }
          },
          {
            id: 'mock-trend-2',
            content: 'The new trauma protocols at AIIMS Delhi are setting a great benchmark. Highly recommend looking into their "Golden Hour" rapid response workflow for your local units.',
            roomId: 'room-general',
            roomName: 'General Discussion',
            roomType: 'general',
            isAnonymous: false,
            isPinned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
            upvotes: 112,
            replies: 45,
            score: 138,
            user: {
              id: 'm-u-2',
              name: 'Dr. Sunita Rao',
              userType: 'faculty',
              qualification: null, // Faculty details not collected in clinical onboarding
              experienceYears: 15
            }
          },
          {
            id: 'mock-trend-3',
            content: 'Aviation EMS / Air Ambulance roles in India are expanding. INR 65k-1.2L/month for experienced paramedics in companies like Medanta or Apollo. Worth the grind.',
            roomId: 'room-salary',
            roomName: 'Salary & Pay',
            roomType: 'salary',
            isAnonymous: true,
            isPinned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 450),
            upvotes: 95,
            replies: 31,
            score: 124
          }
        ];
        
        mocks.forEach(m => {
          if (!unique.find(u => u.id === m.id)) {
            unique.push(m);
          }
        });
      }

      return unique
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (a.score !== b.score) return b.score - a.score;
          if (a.replies !== b.replies) return (b.replies || 0) - (a.replies || 0);
          if (a.upvotes !== b.upvotes) return (b.upvotes || 0) - (a.upvotes || 0);
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limit);
    },
    refetchInterval: 60000, 
  });
}
