import { X, Bell, MessageSquare, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtime';
import { useState } from 'react';

interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'like' | 'reply' | 'follow' | 'message';
  title: string;
  description: string;
  relatedUserId?: string;
  relatedUser?: { id: string; name: string; avatarUrl: string };
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationsPopoverProps {
  onClose: () => void;
}

export function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'reply':
        return <MessageSquare className="w-4 h-4" />;
      case 'follow':
        return <Share2 className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification: Notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={() => setHoveredId(notification.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  'w-full p-4 text-left transition-colors border-none bg-transparent hover:bg-muted/50',
                  !notification.read && 'bg-primary/5'
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    !notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      !notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {hoveredId === notification.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full text-sm">
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotificationBadge() {
  const { unreadCount } = useRealtimeNotifications();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
