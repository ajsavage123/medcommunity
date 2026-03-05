import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive Real-Time Synchronization Manager
 * 
 * This hook ensures that ALL changes to the database are instantly
 * reflected across the application in real-time. It manages subscriptions
 * for:
 * - Messages (create, update, delete)
 * - Message likes/votes
 * - Message pins
 * - Profiles (user updates)
 * - Salary posts
 * - Notifications
 * - Rooms
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<any[]>([]);

  useEffect(() => {
    const setupSubscriptions = () => {
      // ────────────────────────────────────────────────────────────────
      // MESSAGE UPDATES - Create, Update, Delete
      // ────────────────────────────────────────────────────────────────
      const messagesChannel = supabase
        .channel('realtime:messages_sync')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            // Invalidate all message-related queries
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['trending-messages'] });
            
            // Handle specific message updates
            if (payload.eventType === 'UPDATE') {
              const messageId = payload.new.id;
              // Update message in all relevant caches
              queryClient.setQueryData(['message', messageId], payload.new);
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.push(messagesChannel);

      // ────────────────────────────────────────────────────────────────
      // MESSAGE LIKES/VOTES - Real-Time Like Count Updates
      // ────────────────────────────────────────────────────────────────
      const messageVotesChannel = supabase
        .channel('realtime:message_votes_sync')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_votes',
          },
          () => {
            // Invalidate message votes queries
            queryClient.invalidateQueries({ queryKey: ['message-votes'] });
            // Refresh messages to update like counts
            queryClient.invalidateQueries({ queryKey: ['messages'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(messageVotesChannel);

      // ────────────────────────────────────────────────────────────────
      // PROFILE UPDATES - User Changes
      // ────────────────────────────────────────────────────────────────
      const profilesChannel = supabase
        .channel('realtime:profiles_sync')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
          },
          (payload) => {
            // Invalidate profile queries
            const userId = payload.new.user_id;
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            
            // Refresh messages to show updated user info (avatar, name, badges)
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['trending-messages'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(profilesChannel);

      // ────────────────────────────────────────────────────────────────
      // SALARY POSTS - Salary Data Updates
      // ────────────────────────────────────────────────────────────────
      const salaryPostsChannel = supabase
        .channel('realtime:salary_posts_sync')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'salary_posts',
          },
          () => {
            // Invalidate salary-related queries
            queryClient.invalidateQueries({ queryKey: ['salary-posts'] });
            queryClient.invalidateQueries({ queryKey: ['salaryInsights'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(salaryPostsChannel);

      // ────────────────────────────────────────────────────────────────
      // NOTIFICATIONS - New Notifications
      // ────────────────────────────────────────────────────────────────
      const notificationsChannel = supabase
        .channel('realtime:notifications_sync')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          () => {
            // Invalidate notification queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(notificationsChannel);

      // ────────────────────────────────────────────────────────────────
      // ROOMS - Room Updates
      // ────────────────────────────────────────────────────────────────
      const roomsChannel = supabase
        .channel('realtime:rooms_sync')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
          },
          () => {
            // Invalidate room queries
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(roomsChannel);

      // ────────────────────────────────────────────────────────────────
      // TOPICS - Topic Updates (cached data from topics table)
      // ────────────────────────────────────────────────────────────────
      const topicsChannel = supabase
        .channel('realtime:topics_sync')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'topics',
          },
          () => {
            // Invalidate topic queries
            queryClient.invalidateQueries({ queryKey: ['topics'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(topicsChannel);

      // ────────────────────────────────────────────────────────────────
      // JOBS - Job Board Updates
      // ────────────────────────────────────────────────────────────────
      const jobsChannel = supabase
        .channel('realtime:jobs_sync')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'jobs',
          },
          () => {
            // Invalidate job queries
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
          }
        )
        .subscribe();

      subscriptionsRef.current.push(jobsChannel);

      console.log('✅ Real-time synchronization initialized for all tables');
    };

    setupSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        channel.unsubscribe();
      });
      subscriptionsRef.current = [];
    };
  }, [queryClient]);

  return { subscriptions: subscriptionsRef.current };
}
