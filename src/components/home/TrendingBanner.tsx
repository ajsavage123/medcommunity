import { useEffect, useState } from 'react';
import { TrendingUp, ChevronUp, Pin } from 'lucide-react';
import { useTrendingMessages, TrendingMessage } from '@/hooks/useTrendingMessages';
import { formatBadgeWithExperience } from '@/components/profile/UserBadge';
import { cn } from '@/lib/utils';

interface TrendingBannerProps {
  onMessageClick?: (message: TrendingMessage) => void;
}

export function TrendingBanner({ onMessageClick }: TrendingBannerProps) {
  const { data: messages = [], isLoading } = useTrendingMessages(10);
  const [currentIndex, setCurrentIndex] = useState(0);

  // hook already returns a filtered list (likes/replies/pinned), so just use it
  const trendingMessages = messages;

  useEffect(() => {
    if (trendingMessages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendingMessages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [trendingMessages.length]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-3 animate-pulse">
        <div className="h-12" />
      </div>
    );
  }

  if (trendingMessages.length === 0) {
    // show a light placeholder so the section doesn't disappear entirely
    return (
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-3 text-center text-sm text-muted-foreground">
        No trending posts yet – upvote or reply to messages to get featured!
      </div>
    );
  }

  const currentMessage = trendingMessages[currentIndex];
  const badgeText = currentMessage?.user ? formatBadgeWithExperience(
    currentMessage.user.userType,
    currentMessage.user.qualification,
    currentMessage.user.experienceYears
  ) : null;

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 rounded-xl border border-accent/20 cursor-pointer hover:border-accent/40 transition-all"
      onClick={() => onMessageClick?.(currentMessage)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border-b border-accent/20">
        <TrendingUp className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-semibold text-accent">Trending</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {currentIndex + 1} / {trendingMessages.length}
        </span>
      </div>

      {/* Sliding content */}
      <div className="relative h-14 overflow-hidden">
        {trendingMessages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'absolute inset-0 px-3 py-2 transition-all duration-500 ease-in-out flex flex-col justify-center',
              index === currentIndex 
                ? 'opacity-100 translate-y-0' 
                : index < currentIndex 
                  ? 'opacity-0 -translate-y-full' 
                  : 'opacity-0 translate-y-full'
            )}
          >
            {/* User info */}
            <div className="flex items-center gap-2 mb-0.5">
              {message.isPinned && <Pin className="w-3 h-3 text-accent" />}
              <span className="text-xs font-semibold text-foreground">
                {message.user?.name || 'User'}
              </span>
              {badgeText && badgeText !== 'Member' && (
                <span className="text-[10px] text-muted-foreground">
                  ({badgeText})
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                in {message.roomName}
              </span>
              <div className="flex items-center gap-1 ml-auto text-success">
                <ChevronUp className="w-3 h-3" />
                <span className="text-xs font-medium">{message.upvotes}</span>
              </div>
            </div>
            
            {/* Message content */}
            <p className="text-sm text-foreground/80 line-clamp-1">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {trendingMessages.length > 1 && (
        <div className="flex items-center justify-center gap-1 pb-2">
          {trendingMessages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                index === currentIndex 
                  ? 'bg-accent w-3' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
