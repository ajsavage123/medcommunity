import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Room } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        icon: room.icon,
        isSystem: room.is_system,
        isAnonymous: room.is_anonymous,
        memberCount: room.member_count,
        messageCount: room.message_count,
      }));
    },
  });
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async (): Promise<Room | null> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        icon: data.icon,
        isSystem: data.is_system,
        isAnonymous: data.is_anonymous,
        memberCount: data.member_count,
        messageCount: data.message_count,
      } : null;
    },
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: Partial<Room>): Promise<Room> => {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: room.name ?? 'New Room',
          description: room.description ?? '',
          type: room.type ?? 'general',
          icon: room.icon ?? 'MessageCircle',
          is_system: false,
          is_anonymous: room.isAnonymous ?? false,
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type,
        icon: data.icon,
        isSystem: data.is_system,
        isAnonymous: data.is_anonymous,
        memberCount: data.member_count,
        messageCount: data.message_count,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
