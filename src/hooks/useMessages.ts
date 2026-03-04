import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { useRealtimeProfile } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { getExperienceYears } from '@/hooks/useProfile';
import type { Database } from '@/integrations/supabase/types';

// typed enums from generated types
type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export interface MessageUser {
  id: string;
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  userType: UserType | null;
  qualification: QualificationType | null;
  experienceYears: number;
}

export interface EnrichedMessage extends Omit<Message, 'user'> {
  user?: MessageUser;
}

function transformRow(row: any): EnrichedMessage {
  const userProfile = row.profiles;
  const user: MessageUser | undefined = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.name || undefined,
        avatar: userProfile.avatar_url || undefined,
        gender: userProfile.gender as any,
        userType: userProfile.user_type as any,
        qualification: userProfile.qualification as any,
        experienceYears: getExperienceYears(userProfile.experience_start_date),
      }
    : undefined;

  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    content: row.content,
    isAnonymous: row.is_anonymous,
    likes: row.likes,
    replies: row.replies,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
    replyTo: row.reply_to || undefined,
    user,
  };
}

export function useMessages(roomId: string) {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();

  // if our own profile changes, refresh messages so the join returns fresh user info
  useEffect(() => {
    if (profile && roomId) {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    }
  }, [profile, roomId, queryClient]);

  // subscribe to new messages for this room
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`messages:room_id=eq.${roomId}`);

    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`,
    }, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newMsg = transformRow(payload.new);
        queryClient.setQueryData(['messages', roomId], (old: any) => {
          const arr = old ? [...old] : [];
          arr.push(newMsg);
          return arr;
        });
      } else if (payload.eventType === 'UPDATE') {
        const updated = transformRow(payload.new);
        queryClient.setQueryData(['messages', roomId], (old: any[]) =>
          old?.map(m => (m.id === updated.id ? updated : m)) || []
        );
      }
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, queryClient]);

  // globally watch profile changes so cached message authors update
  useEffect(() => {
    if (!roomId) return;
    const profChannel = supabase
      .channel('profiles')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, (payload: any) => {
        const newProf = payload.new;
        queryClient.setQueryData(['messages', roomId], (old: any[]) =>
          old?.map(m => {
            if (m.userId === newProf.user_id && m.user) {
              return {
                ...m,
                user: {
                  ...m.user,
                  name: newProf.name || m.user.name,
                  avatar: newProf.avatar_url || m.user.avatar,
                  gender: newProf.gender,
                  userType: newProf.user_type,
                  qualification: newProf.qualification,
                  experienceYears: getExperienceYears(newProf.experience_start_date),
                },
              };
            }
            return m;
          }) || []
        );
      })
      .subscribe();

    return () => {
      void profChannel.unsubscribe();
    };
  }, [roomId, queryClient]);

  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: async (): Promise<EnrichedMessage[]> => {
      // fetch messages first
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      const messages = msgs || [];

      // gather unique user IDs for profiles
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

      // helper to find profile by user_id
      const findProfile = (uid: string) => profiles.find(p => p.user_id === uid);

      return messages.map((row: any) => transformRow({
        ...row,
        profiles: findProfile(row.user_id) || null,
      }));
    },
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      roomId,
      content,
      isAnonymous = false,
      replyTo,
    }: {
      roomId: string;
      content: string;
      isAnonymous?: boolean;
      replyTo?: string;
    }) => {
      // Ensure user is authenticated
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Use auth user ID directly since RLS will validate the user
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content,
          is_anonymous: isAnonymous,
          reply_to: replyTo,
        })
        .select('*')
        .single();

      if (error) throw error;
      return transformRow(data);
    },
    onSuccess: (newMsg, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useLikeMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      // increment safely by reading current value then updating
      const { data: msg, error: fetchErr } = await supabase
        .from('messages')
        .select('likes')
        .eq('id', messageId)
        .single();
      if (fetchErr) throw fetchErr;
      const current = msg?.likes ?? 0;
      const { error: updateErr } = await supabase
        .from('messages')
        .update({ likes: current + 1 })
        .eq('id', messageId);
      if (updateErr) throw updateErr;
      return { messageId, roomId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['message-likes'] });
    },
  });
}

export function useMessageLikes(messageIds: string[]) {
  return useQuery({
    queryKey: ['message-likes', messageIds],
    queryFn: async () => {
      const likesMap: Record<string, { count: number; userLiked: boolean }> = {};
      const { data, error } = await supabase
        .from('messages')
        .select('id, likes')
        .in('id', messageIds);
      if (error) throw error;
      data?.forEach((m: any) => {
        likesMap[m.id] = { count: m.likes, userLiked: false };
      });
      return likesMap;
    },
    enabled: messageIds.length > 0,
  });
}
