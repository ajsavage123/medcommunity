import { useState } from 'react';
import {
    Flame, Pin, ChevronUp, ChevronDown, MessageCircle,
    ArrowRight, Star, Clock, TrendingUp
} from 'lucide-react';
import { useTrendingMessages, TrendingMessage } from '@/hooks/useTrendingMessages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Room } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfileDrawer } from '@/components/profile/UserProfileDrawer';
import { getClayAvatar } from '@/lib/avatars';

type SortMode = 'hot' | 'top' | 'new' | 'pinned';

const ROOM_TYPE_COLORS: Record<string, string> = {
    general: 'bg-blue-100 text-blue-700',
    salary: 'bg-green-100 text-green-700',
    career: 'bg-purple-100 text-purple-700',
    leadership: 'bg-orange-100 text-orange-700',
    entrepreneurship: 'bg-pink-100 text-pink-700',
    certifications: 'bg-yellow-100 text-yellow-700',
    students: 'bg-cyan-100 text-cyan-700',
    library: 'bg-indigo-100 text-indigo-700',
};

function getScoreColor(score: number) {
    if (score >= 50) return 'text-red-500 bg-red-50';
    if (score >= 20) return 'text-orange-500 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
}

function getFlameSize(score: number) {
    if (score >= 50) return 'w-5 h-5';
    if (score >= 20) return 'w-4 h-4';
    return 'w-3.5 h-3.5';
}

interface TrendingPostCardProps {
    message: TrendingMessage;
    rank: number;
    onViewInRoom: (message: TrendingMessage) => void;
    onViewProfile: (user: any) => void;
}

function TrendingPostCard({ message, rank, onViewInRoom, onViewProfile }: TrendingPostCardProps) {
    const scoreColor = getScoreColor(message.score);
    const roomColor = ROOM_TYPE_COLORS[message.roomType] || 'bg-gray-100 text-gray-700';
    const timeAgo = formatDistanceToNow(message.createdAt, { addSuffix: true });
    const avatarUrl = message.user ? (message.user as any).avatar || getClayAvatar(message.user.id, (message.user as any).gender, message.user.name) : '';

    return (
        <div className={cn(
            'bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.99]',
            message.isPinned && 'ring-2 ring-accent/50'
        )}>
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                {/* Rank + fire score */}
                <div className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', scoreColor)}>
                    <Flame className={cn('fill-current', getFlameSize(message.score))} />
                    <span>{message.score}</span>
                </div>

                {message.isPinned && (
                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                    </div>
                )}

                {/* Room tag */}
                <span className={cn('ml-auto text-[11px] font-semibold rounded-full px-2.5 py-0.5', roomColor)}>
                    {message.roomName}
                </span>
            </div>

            {/* Content */}
            <div className="px-4 py-2">
                {/* Author */}
                <div className="flex items-center gap-2 mb-1.5 px-0.5">
                    <button 
                        onClick={() => !message.isAnonymous && onViewProfile(message.user)}
                        className={cn(
                            "w-7 h-7 rounded-full overflow-hidden border border-border shadow-sm active:scale-90 transition-transform",
                            !message.isAnonymous && "cursor-pointer hover:border-primary/50"
                        )}
                    >
                        <Avatar className="w-full h-full">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary italic">
                                {message.isAnonymous ? '?' : (message.user?.name?.[0]?.toUpperCase() || 'U')}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                    <button 
                        onClick={() => !message.isAnonymous && onViewProfile(message.user)}
                        className={cn(
                            "text-xs font-bold text-foreground transition-all",
                            !message.isAnonymous && "hover:text-primary hover:underline cursor-pointer"
                        )}
                    >
                        {message.isAnonymous ? 'Anonymous' : (message.user?.name || 'User')}
                    </button>
                    {message.user?.userType && !message.isAnonymous && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium opacity-80">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="uppercase tracking-tighter">{message.user.userType.replace(/_/g, ' ')}</span>
                            {message.user.experienceYears > 0 && <span>· {message.user.experienceYears}yr Exp</span>}
                        </div>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto bg-slate-100 px-2 py-0.5 rounded-full">{timeAgo}</span>
                </div>

                {/* Post body */}
                <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">
                    {message.content}
                </p>

                {/* Stats + action row */}
                <div className="flex items-center gap-3 border-t border-border pt-2">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-success transition-colors">
                        <ChevronUp className="w-4 h-4" />
                        <span className="font-medium">{message.upvotes}</span>
                    </button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply</span>
                    </div>
                    <button
                        onClick={() => onViewInRoom(message)}
                        className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        View in room
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface TrendingPageProps {
    onNavigateToRoom: (roomName: string) => void;
}

const SORT_TABS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
    { id: 'hot', label: 'Hot', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'top', label: 'Top', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'new', label: 'New', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'pinned', label: 'Pinned', icon: <Pin className="w-3.5 h-3.5" /> },
];

export function TrendingPage({ onNavigateToRoom }: TrendingPageProps) {
    const [sortMode, setSortMode] = useState<SortMode>('hot');
    const [viewingUser, setViewingUser] = useState<any>(null);
    const { data: allMessages = [], isLoading } = useTrendingMessages(50);

    const sorted = [...allMessages].sort((a, b) => {
        if (sortMode === 'hot') return b.score - a.score;
        if (sortMode === 'top') return b.upvotes - a.upvotes;
        if (sortMode === 'new') return b.createdAt.getTime() - a.createdAt.getTime();
        if (sortMode === 'pinned') {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.score - a.score;
        }
        return 0;
    });

    return (
        <div className="pb-24 animate-fade-in">
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Trending Posts</h2>
                        <p className="text-xs text-muted-foreground">Most engaging discussions right now</p>
                    </div>
                </div>

                {/* Sort tabs */}
                <div className="flex gap-2">
                    {SORT_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSortMode(tab.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                                sortMode === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts list */}
            <div className="px-4 space-y-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                    ))
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                            <Flame className="w-8 h-8 text-orange-300" />
                        </div>
                        <p className="font-semibold text-foreground mb-1">Nothing trending yet</p>
                        <p className="text-sm text-muted-foreground">
                            Post in rooms and get upvotes to appear here
                        </p>
                    </div>
                ) : (
                    sorted.map((msg, i) => (
                        <TrendingPostCard
                            key={msg.id}
                            message={msg}
                            rank={i + 1}
                            onViewInRoom={(m) => onNavigateToRoom(m.roomName)}
                            onViewProfile={setViewingUser}
                        />
                    ))
                )}
            </div>

            <UserProfileDrawer 
                user={viewingUser} 
                isOpen={!!viewingUser} 
                onOpenChange={(open) => !open && setViewingUser(null)} 
            />
        </div>
    );
}
