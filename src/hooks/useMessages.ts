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
// Designation type might be missing from generated types if DB was migrated after generation
type DesignationType = any; 

export interface MessageUser {
  id: string;
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  userType: UserType | null;
  qualification: QualificationType | null;
  designation: DesignationType | null;
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
        designation: userProfile.designation as any,
        experienceYears: getExperienceYears(userProfile.experience_start_date),
      }
    : undefined;

  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    content: row.content,
    isAnonymous: row.is_anonymous,
    likes: row.likes || 0,
    replies: row.replies || 0,
    isPinned: row.is_pinned || false,
    createdAt: new Date(row.created_at),
    replyTo: row.reply_to || undefined,
    user,
  };
}

export function useMessages(roomId: string) {
  const queryClient = useQueryClient();
  const { profile } = useRealtimeProfile();

  useEffect(() => {
    if (profile && roomId) {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    }
  }, [profile, roomId, queryClient]);

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
        
        // Play receive sound for others' messages
        if (newMsg.userId !== profile?.userId) {
          import('@/lib/sounds').then(({ sounds }) => sounds.playReceive());
        }

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
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id;
        queryClient.setQueryData(['messages', roomId], (old: any[]) =>
          old?.filter(m => m.id !== deletedId) || []
        );
      }
    });

    const profChannel = supabase
      .channel('profiles-updates')
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
                  designation: newProf.designation,
                  experienceYears: getExperienceYears(newProf.experience_start_date),
                },
              };
            }
            return m;
          }) || []
        );
      })
      .subscribe();

    channel.subscribe();

    return () => {
      void channel.unsubscribe();
      void profChannel.unsubscribe();
    };
  }, [roomId, queryClient]);

  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: async (): Promise<EnrichedMessage[]> => {
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

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

      const findProfile = (uid: string) => profiles.find(p => p.user_id === uid);

      const enrichedMsgs = messages.map((row: any) => transformRow({
        ...row,
        profiles: findProfile(row.user_id) || null,
      }));

      const { data: roomData } = await supabase
        .from('rooms')
        .select('name, type')
        .eq('id', roomId)
        .single();

      const roomName = roomData?.name || 'this room';
      const roomType = roomData?.type || 'general';

      // Inject professional community guides with localized Indian names and relevant content
      const mockGuides: EnrichedMessage[] = [
        {
          id: `guide-1-${roomId}`,
          roomId,
          userId: 'guide-u-1',
          content: roomName.toLowerCase().includes('clinical')
            ? `Namaste! In ${roomName}, we share peer-reviewed cases. Please ensure all patient IDs are removed before sharing clinical images. 🙏`
            : roomType === 'salary' 
            ? "Welcome to the Salary & Pay discussion. All posts here are 100% anonymous to help us build a transparent pay scale for Indian Paramedics."
            : `Namaste! Welcome to ${roomName}. 👋 Let's use this space to support each other and grow the EMS community in India.`,
          isAnonymous: false,
          likes: 5,
          replies: 0,
          isPinned: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          user: {
            id: 'guide-u-1',
            name: 'Dr. Arjun Mehta',
            userType: 'instructor',
            qualification: 'pg_diploma',
            designation: 'Clinical Instructor',
            experienceYears: 12
          }
        },
        {
          id: `guide-2-${roomId}`,
          roomId,
          userId: 'guide-u-2',
          content: roomName.toLowerCase().includes('job') || roomType === 'career'
            ? "Opening: Senior Paramedic roles available at Apollo Mumbai. 💰 Expected: 45k-55k. Check the Jobs tab for the referral link."
            : roomType === 'students'
            ? "Special welcome to all students and interns! Use this room to ask about clinical rotations, study tips, or finding your first job."
            : "Tip: Use the 'Job Notifications' button on the Home screen to get real-time alerts for openings in your preferred city.",
          isAnonymous: false,
          likes: 8,
          replies: 0,
          isPinned: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
          user: {
            id: 'guide-u-2',
            name: 'Ananya Sharma',
            userType: 'hr',
            qualification: null,
            designation: 'Talent Acquisition',
            experienceYears: 5
          }
        },
        {
          id: `guide-3-${roomId}`,
          roomId,
          userId: 'guide-u-3',
          content: roomName.toLowerCase().includes('cert') || roomType === 'certifications'
            ? "Preparing for ACLS 2026? We've updated the certification guide with the latest Indian Resuscitation Council (IRC) algorithm changes."
            : roomType === 'library'
            ? "New Study Material: I've uploaded the 'Golden Hour Trauma Management' PDF to the Library resources. Very helpful for field staff."
            : "If you're noticing protocol gaps in your local service, let's discuss them here constructively to see how others are handling it.",
          isAnonymous: false,
          likes: 12,
          replies: 2,
          isPinned: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          user: {
            id: 'guide-u-3',
            name: 'Prof. Rajesh Pillai',
            userType: 'faculty',
            qualification: null,
            designation: 'Senior Faculty',
            experienceYears: 18
          }
        }
      ];

      return [...mockGuides, ...enrichedMsgs];
    },
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ roomId, content, isAnonymous, replyTo }: { roomId: string, content: string, isAnonymous?: boolean, replyTo?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Play send sound immediately for UX
      import('@/lib/sounds').then(({ sounds }) => sounds.playSend());

      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content,
          is_anonymous: isAnonymous || false,
          reply_to: replyTo,
        })
        .select('*')
        .single();

      if (error) throw error;
      return transformRow(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['messages', data.roomId], (old: any) => {
        const arr = old ? [...old] : [];
        if (!arr.find((m: any) => m.id === data.id)) {
          arr.push(data);
        }
        return arr;
      });
    },
  });
}
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string, roomId: string }) => {
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
    },
  });
}

export function useTogglePinMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, isPinned, roomId }: { messageId: string, isPinned: boolean, roomId: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_pinned: !isPinned })
        .eq('id', messageId)
        .select('*')
        .single();

      if (error) throw error;
      return { message: transformRow(data), roomId };
    },
    onSuccess: ({ message, roomId }) => {
      queryClient.setQueryData(['messages', roomId], (old: any[]) =>
        old?.map(m => (m.id === message.id ? message : m)) || []
      );
    },
  });
}
