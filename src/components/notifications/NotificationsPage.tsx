import { useState } from 'react';
import {
  ArrowLeft, Bell, MessageSquare, Heart, AtSign, TrendingUp,
  Briefcase, Check, CheckCheck, Filter, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtime';

type FilterType = 'all' | 'mention' | 'like' | 'reply' | 'job' | 'trending';

const FILTER_LABELS: { id: FilterType; label: string; icon: any }[] = [
  { id: 'all',      label: 'All',      icon: Bell },
  { id: 'mention',  label: 'Mentions', icon: AtSign },
  { id: 'like',     label: 'Likes',    icon: Heart },
  { id: 'reply',    label: 'Replies',  icon: MessageSquare },
  { id: 'job',      label: 'Jobs',     icon: Briefcase },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

const ICON_MAP: Record<string, any> = {
  mention: AtSign,
  like: Heart,
  reply: MessageSquare,
  message: MessageSquare,
  follow: Bell,
  job: Briefcase,
  trending: TrendingUp,
};

const COLOR_MAP: Record<string, string> = {
  mention:  'bg-primary text-primary-foreground',
  like:     'bg-rose-500 text-white',
  reply:    'bg-blue-500 text-white',
  message:  'bg-blue-500 text-white',
  follow:   'bg-accent text-accent-foreground',
  job:      'bg-emerald-500 text-white',
  trending: 'bg-orange-500 text-white',
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface NotificationsPageProps {
  onBack: () => void;
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = notifications.filter((n: any) =>
    activeFilter === 'all' ? true : n.type === activeFilter
  );

  const unreadFiltered = filtered.filter((n: any) => !n.read);

  const markAllRead = async () => {
    for (const n of unreadFiltered) {
      await markAsRead(n.id);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{notifications.length} total</p>
          </div>
          {unreadFiltered.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-primary gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_LABELS.map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                )}
              >
                <Icon className="w-3 h-3" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="w-9 h-9 text-primary/60" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {activeFilter === 'all'
                ? "You don't have any notifications yet. When people mention you, like your posts, or reply — it'll show here."
                : `No ${activeFilter} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notification: any) => {
              const Icon = ICON_MAP[notification.type] || Bell;
              const colorClass = COLOR_MAP[notification.type] || 'bg-muted text-muted-foreground';
              return (
                <button
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={cn(
                    'w-full p-4 text-left transition-colors flex gap-3 hover:bg-muted/30',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', colorClass)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm leading-snug',
                        !notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {notification.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-2">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Real-time indicator */}
        <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-time notifications active — mentions, likes, job alerts & more
        </div>
      </div>
    </div>
  );
}
