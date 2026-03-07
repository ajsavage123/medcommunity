import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface Profile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  userType: string | null;
  sector: string | null;
  qualification: string | null;
  salary: number | null;
  experienceStartDate: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}


export function useRealtimeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial profile
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (isMounted) {
          if (data) {
            setProfile({
              id: data.id,
              userId: data.user_id,
              name: data.name,
              avatarUrl: data.avatar_url,
              userType: data.user_type,
              sector: data.sector,
              qualification: data.qualification,
              salary: data.salary,
              experienceStartDate: data.experience_start_date,
              onboardingCompleted: data.onboarding_completed,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            });
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to real-time changes using the correct API
    const subscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (isMounted) {
            const newData = payload.new;
            setProfile({
              id: newData.id,
              userId: newData.user_id,
              name: newData.name,
              avatarUrl: newData.avatar_url,
              userType: newData.user_type,
              sector: newData.sector,
              qualification: newData.qualification,
              salary: newData.salary,
              experienceStartDate: newData.experience_start_date,
              onboardingCompleted: newData.onboarding_completed,
              createdAt: newData.created_at,
              updatedAt: newData.updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  return { profile, loading };
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await (supabase
          .from('notifications' as any) as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('Notifications table might not exist yet:', error.message);
          return;
        }

        if (isMounted) {
          setNotifications(data || []);
          const unread = data?.filter((n: any) => !n.read).length || 0;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications using correct API
    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications' as any,
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (isMounted) {
            const newNotification = payload.new;
            setNotifications((prev) => [newNotification, ...prev]);
            if (!newNotification.read) {
              setUnreadCount((prev) => prev + 1);
              
              // Push Notification logic
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  const n = new Notification(newNotification.title, {
                    body: newNotification.description,
                    icon: '/favicon.ico'
                  });
                  n.onclick = () => { window.focus(); };
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission();
                }
              }

              // Play professional notification sound
              import('@/lib/sounds').then(({ sounds }) => {
                sounds.playNotification();
              });

              toast({
                title: newNotification.title,
                description: newNotification.description,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase
        .from('notifications' as any) as any)
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  return { notifications, unreadCount, markAsRead };
}
