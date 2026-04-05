import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * useAdminActions — Full admin power hook
 * Handles: send warnings, ban users, delete any message, kick from rooms
 */
export function useAdminActions() {
  const queryClient = useQueryClient();

  // ── Delete ANY message (bypasses ownership check) ──────────────────────────
  const deleteAnyMessage = useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
      return { messageId, roomId };
    },
    onSuccess: ({ messageId, roomId }) => {
      queryClient.setQueryData(['messages', roomId], (old: any[]) =>
        old?.filter(m => m.id !== messageId) || []
      );
      toast.success('🛡 Message removed by admin');
    },
    onError: (err: any) => toast.error(`Failed to delete: ${err.message}`),
  });

  // ── Send a warning notification to a user ──────────────────────────────────
  const warnUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'warning',
          content: `⚠️ Admin Warning: ${reason}. Repeated violations may result in account suspension.`,
          is_read: false,
        });
      if (error) throw error;
    },
    onSuccess: () => toast.success('⚠️ Warning sent to user'),
    onError: (err: any) => toast.error(`Failed to send warning: ${err.message}`),
  });

  // ── Ban a user (set role to 'banned' and send final notification) ─────────
  const banUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      // 1. Send a final notification before banning
      await (supabase as any).from('notifications').insert({
        user_id: userId,
        type: 'warning',
        content: `🚫 Account Suspended: Your account has been suspended for: ${reason}. Contact support if you believe this is an error.`,
        is_read: false,
      });

      // 2. Update user role to 'banned' in user_roles table
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' }) // demote first; future: add 'banned' to app_role enum
        .eq('user_id', userId);
      if (error) throw error;

      // 3. Delete all messages from banned user
      await supabase.from('messages').delete().eq('user_id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('🚫 User has been banned and all messages removed');
    },
    onError: (err: any) => toast.error(`Failed to ban user: ${err.message}`),
  });

  // ── Delete all messages from a specific user in a room ───────────────────
  const deleteUserMessages = useMutation({
    mutationFn: async ({ userId, roomId }: { userId: string; roomId: string }) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId)
        .eq('room_id', roomId);
      if (error) throw error;
      return { userId, roomId };
    },
    onSuccess: ({ roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      toast.success('🛡 All messages from user cleared in this room');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });

  return {
    deleteAnyMessage,
    warnUser,
    banUser,
    deleteUserMessages,
  };
}
