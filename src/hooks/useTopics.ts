import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Topic } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type TopicSortOrder = 'newest' | 'oldest';

export function useTopics(roomId: string, sortOrder: TopicSortOrder = 'newest') {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['topics', roomId, sortOrder],
    queryFn: async (): Promise<Topic[]> => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('room_id', roomId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: sortOrder === 'oldest' });

      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        roomId: t.room_id,
        title: t.title,
        content: t.content || undefined,
        createdBy: t.created_by || undefined,
        isAnonymous: t.is_anonymous,
        isPinned: t.is_pinned,
        isLocked: t.is_locked,
        replyCount: t.reply_count,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      }));
    },
    enabled: !!roomId,
  });

  // subscribe to changes for this room's topics
  useEffect(() => {
    if (!roomId) return;
    const sub = supabase
      .channel(`topics:room_id=eq.${roomId}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'topics',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['topics', roomId] });
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [roomId, queryClient]);

  return result;
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      return {
        id: data.id,
        roomId: data.room_id,
        title: data.title,
        content: data.content || undefined,
        createdBy: data.created_by || undefined,
        isAnonymous: data.is_anonymous,
        isPinned: data.is_pinned,
        isLocked: data.is_locked,
        replyCount: data.reply_count,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    },
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      title,
      content,
      isAnonymous = false,
    }: {
      roomId: string;
      title: string;
      content?: string;
      isAnonymous?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          room_id: roomId,
          title: title.trim(),
          content: content?.trim() || null,
          is_anonymous: isAnonymous,
        })
        .select('*')
        .single();
      if (error) throw error;
      return {
        id: data.id,
        roomId: data.room_id,
        title: data.title,
        content: data.content || undefined,
        createdBy: data.created_by || undefined,
        isAnonymous: data.is_anonymous,
        isPinned: data.is_pinned,
        isLocked: data.is_locked,
        replyCount: data.reply_count,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics', variables.roomId] });
    },
  });
}

export function useTopicMessages(topicId: string) {
  return useQuery({
    queryKey: ['topic-messages', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!topicId,
  });
}
