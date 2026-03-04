import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface MessageVoteData {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: 'up' | 'down' | null;
}

export function useMessageVotes(messageIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['message-votes', messageIds],
    queryFn: async () => {
      if (messageIds.length === 0) return {};
      const { data, error } = await supabase
        .from('message_votes')
        .select('*')
        .in('message_id', messageIds);
      if (error) throw error;

      const map: Record<string, MessageVoteData> = {};
      messageIds.forEach((id) => {
        map[id] = { upvotes: 0, downvotes: 0, score: 0, userVote: null };
      });

      data?.forEach((vote: any) => {
        const { message_id, vote_type, user_id } = vote;
        if (!map[message_id]) return;
        if (vote_type === 'up') map[message_id].upvotes++;
        if (vote_type === 'down') map[message_id].downvotes++;
        if (user && user.id === user_id) {
          map[message_id].userVote = vote_type;
        }
        map[message_id].score = map[message_id].upvotes - map[message_id].downvotes;
      });
      return map;
    },
    enabled: messageIds.length > 0,
  });
}

export function useVoteMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      messageId,
      voteType,
    }: {
      messageId: string;
      roomId: string;
      voteType: 'up' | 'down';
    }) => {
      if (!user) throw new Error('Not authenticated');

      // fetch existing vote if any
      const { data: existing, error: fetchErr } = await supabase
        .from('message_votes')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .single();
      if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

      if (existing) {
        if (existing.vote_type === voteType) {
          // remove vote
          const { error: delErr } = await supabase
            .from('message_votes')
            .delete()
            .eq('id', existing.id);
          if (delErr) throw delErr;
        } else {
          const { error: updErr } = await supabase
            .from('message_votes')
            .update({ vote_type: voteType })
            .eq('id', existing.id);
          if (updErr) throw updErr;
        }
      } else {
        const { error: insErr } = await supabase
          .from('message_votes')
          .insert({ message_id: messageId, user_id: user.id, vote_type: voteType });
        if (insErr) throw insErr;
      }

      return { messageId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-votes', variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['trending-messages'] });
    },
  });
}
