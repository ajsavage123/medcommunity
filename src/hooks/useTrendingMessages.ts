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
      upvotes: m.likes,
      replies: m.replies,
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

  const filtered = unique.filter(
    m => m.isPinned || (m.upvotes || 0) > 0 || (m.replies || 0) > 0
  );

  return filtered
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.score !== b.score) return b.score - a.score;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, limit);
}

export function useTrendingMessages(limit: number = 10) {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();

  useEffect(() => {
    if (profile) {
      queryClient.invalidateQueries({ queryKey: ['trending-messages', limit] });
    }
  }, [profile, limit, queryClient]);

  // subscribe to all message changes so trending list refreshes as soon as
  // likes/replies/pins are updated. we don't filter at channel level since
  // supabase doesn't support complex or() filters here; we'll just invalidate
  // on any message change and rely on our query to return the right subset.
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
      // Fetch messages separately
      // fetch only posts that have some engagement or are pinned – avoids pulling entire chat history
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        // supabase OR clause; include likes >0, replies >0 or pinned messages
        .or('likes.gt.0,replies.gt.0,is_pinned.eq.true')
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
          replies: m.replies,
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

      // deduplicate just in case the database returned any duplicates
      const unique = arr.reduce<TrendingMessage[]>((acc, item) => {
        if (!acc.find(x => x.id === item.id)) acc.push(item);
        return acc;
      }, []);

      // only keep messages that have interaction (likes/replies) or are pinned
      const filtered = unique.filter(
        m => m.isPinned || (m.upvotes || 0) > 0 || (m.replies || 0) > 0
      );

      return filtered
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (a.score !== b.score) return b.score - a.score;
          // when scores tie, prefer the one with more replies (higher engagement),
          // then more upvotes, then newer posts
          if (a.replies !== b.replies) return (b.replies || 0) - (a.replies || 0);
          if (a.upvotes !== b.upvotes) return (b.upvotes || 0) - (a.upvotes || 0);
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });
}
