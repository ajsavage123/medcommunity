import { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft, MoreVertical, Send, Lock,
    ChevronUp, ChevronDown, MessageCircle, Pin,
    PlusCircle, Flame, Clock, Star
} from 'lucide-react';
import { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useMessages, useSendMessage, EnrichedMessage } from '@/hooks/useMessages';
import { useMessageVotes, useVoteMessage, MessageVoteData } from '@/hooks/useMessageVotes';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfileDrawer } from '@/components/profile/UserProfileDrawer';
import { getClayAvatar } from '@/lib/avatars';

interface RedditChatProps {
    room: Room;
    onBack: () => void;
}

type SortMode = 'hot' | 'new' | 'top';

function calcScore(votes: MessageVoteData | undefined, isPinned: boolean, createdAt: Date) {
    const up = votes?.upvotes ?? 0;
    const down = votes?.downvotes ?? 0;
    const hoursOld = (Date.now() - createdAt.getTime()) / 3_600_000;
    return up * 3 - down * 1.5 + (isPinned ? 50 : 0) - hoursOld * 0.3;
}

interface PostCardProps {
    message: EnrichedMessage;
    voteData?: MessageVoteData;
    onVote: (type: 'up' | 'down') => void;
    onReply: () => void;
    replies: EnrichedMessage[];
    replyVotesData: Record<string, MessageVoteData>;
    onReplyVote: (id: string, type: 'up' | 'down') => void;
    onViewProfile: (user: any) => void;
}

function PostCard({ message, voteData, onVote, onReply, replies, replyVotesData, onReplyVote, onViewProfile }: PostCardProps) {
    const [showReplies, setShowReplies] = useState(false);
    const score = (voteData?.upvotes ?? 0) - (voteData?.downvotes ?? 0);
    const timeAgo = formatDistanceToNow(message.createdAt, { addSuffix: true });
    const isAnon = message.isAnonymous;
    const avatarUrl = message.user ? getClayAvatar(message.user.id, (message.user as any).gender, message.user.name) : '';

    return (
        <div className={cn(
            'bg-card border border-border rounded-2xl overflow-hidden',
            message.isPinned && 'ring-2 ring-accent/40'
        )}>
            {message.isPinned && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 border-b border-accent/20">
                    <Pin className="w-3 h-3 text-accent" />
                    <span className="text-xs font-semibold text-accent">Pinned Post</span>
                </div>
            )}

            <div className="flex gap-3 p-4">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1 min-w-[32px]">
                    <button
                        onClick={() => onVote('up')}
                        className={cn(
                            'p-1 rounded-lg transition-colors',
                            voteData?.userVote === 'up'
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        )}
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className={cn(
                        'text-sm font-bold',
                        score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                        {score}
                    </span>
                    <button
                        onClick={() => onVote('down')}
                        className={cn(
                            'p-1 rounded-lg transition-colors',
                            voteData?.userVote === 'down'
                                ? 'text-destructive bg-destructive/10'
                                : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                        )}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                {/* Post content */}
                <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <button 
                            disabled={isAnon}
                            onClick={() => message.user && onViewProfile(message.user)}
                            className={cn(
                                "w-6 h-6 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center transition-all shadow-sm",
                                !isAnon && "hover:ring-2 hover:ring-primary/20 active:scale-90"
                            )}
                        >
                            <Avatar className="w-full h-full">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-[8px] font-bold text-muted-foreground italic bg-slate-100">
                                    {isAnon ? '?' : (message.user?.name?.[0]?.toUpperCase() || 'U')}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                        <button 
                            disabled={isAnon}
                            onClick={() => message.user && onViewProfile(message.user)}
                            className={cn(
                                "text-xs font-bold text-muted-foreground transition-colors",
                                !isAnon && "hover:text-primary hover:underline cursor-pointer"
                            )}
                        >
                            {isAnon ? 'Anonymous' : (message.user?.name || 'User')}
                        </button>
                        {message.user?.userType && !isAnon && (
                            <span className="text-[10px] text-primary/70 font-bold uppercase tracking-tighter opacity-80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm bg-primary/5">
                                {message.user.userType.replace(/_/g, ' ')}
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo}</span>
                    </div>

                    {/* Body */}
                    <p className="text-sm text-foreground leading-relaxed mb-3">{message.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setShowReplies(!showReplies); onReply(); }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{replies.length > 0 ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : 'Reply'}</span>
                        </button>

                        {replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(s => !s)}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                {showReplies ? 'Hide' : 'View'} replies
                            </button>
                        )}
                    </div>

                    {/* Replies */}
                    {showReplies && replies.length > 0 && (
                        <div className="mt-3 border-l-2 border-border pl-3 space-y-3">
                            {replies.map(reply => (
                                <div key={reply.id} className="flex gap-2">
                                    <div className="flex flex-col items-center gap-0.5 min-w-[24px]">
                                        <button
                                            onClick={() => onReplyVote(reply.id, 'up')}
                                            className={cn('rounded transition-colors', replyVotesData[reply.id]?.userVote === 'up' ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            {(replyVotesData[reply.id]?.upvotes ?? 0) - (replyVotesData[reply.id]?.downvotes ?? 0)}
                                        </span>
                                        <button
                                            onClick={() => onReplyVote(reply.id, 'down')}
                                            className={cn('rounded transition-colors', replyVotesData[reply.id]?.userVote === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive')}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-semibold text-muted-foreground">Anonymous</span>
                                            <span className="text-[10px] text-muted-foreground">· {formatDistanceToNow(reply.createdAt, { addSuffix: true })}</span>
                                        </div>
                                        <p className="text-xs text-foreground leading-relaxed">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function RedditChat({ room, onBack }: RedditChatProps) {
    const [newMessage, setNewMessage] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('hot');
    const [replyingTo, setReplyingTo] = useState<EnrichedMessage | null>(null);
    const [viewingUser, setViewingUser] = useState<any>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { data: messages = [], isLoading } = useMessages(room.id);
    const sendMessage = useSendMessage();
    const voteMessage = useVoteMessage();

    const parentMessages = messages.filter(m => !m.replyTo);
    const repliesByParent = messages.reduce((acc, m) => {
        if (m.replyTo) {
            if (!acc[m.replyTo]) acc[m.replyTo] = [];
            acc[m.replyTo].push(m);
        }
        return acc;
    }, {} as Record<string, EnrichedMessage[]>);

    const allIds = messages.map(m => m.id);
    const { data: votesData = {} } = useMessageVotes(allIds);
    const voteMsg = useVoteMessage();

    const sortedParents = [...parentMessages].sort((a, b) => {
        if (sortMode === 'hot') return calcScore(votesData[b.id], b.isPinned, b.createdAt) - calcScore(votesData[a.id], a.isPinned, a.createdAt);
        if (sortMode === 'new') return b.createdAt.getTime() - a.createdAt.getTime();
        if (sortMode === 'top') return (votesData[b.id]?.upvotes ?? 0) - (votesData[a.id]?.upvotes ?? 0);
        return 0;
    });

    const handleSend = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;
        try {
            await sendMessage.mutateAsync({
                roomId: room.id,
                content: trimmed,
                isAnonymous: true,
                replyTo: replyingTo?.id,
            });
            setNewMessage('');
            setReplyingTo(null);
        } catch (e) {
            const err = e as { message?: string };
            toast({ title: 'Error', description: err.message || 'Failed to post', variant: 'destructive' });
        }
    };

    const SORT_TABS = [
        { id: 'hot' as SortMode, label: 'Hot', icon: <Flame className="w-3 h-3" /> },
        { id: 'new' as SortMode, label: 'New', icon: <Clock className="w-3 h-3" /> },
        { id: 'top' as SortMode, label: 'Top', icon: <Star className="w-3 h-3" /> },
    ];

    return (
        <div className="flex flex-col h-[100dvh] fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shadow-md">
                <Button variant="ghost" size="icon-sm" onClick={onBack} className="text-primary-foreground hover:bg-primary-foreground/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{room.name}</h2>
                    <p className="text-xs opacity-80">🔒 All posts are anonymous</p>
                </div>
                <Button variant="ghost" size="icon-sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>

            {/* Sort tabs */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
                {SORT_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSortMode(tab.id)}
                        className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            sortMode === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
                <button
                    onClick={() => { setReplyingTo(null); inputRef.current?.focus(); }}
                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    <PlusCircle className="w-4 h-4" />
                    Post
                </button>
            </div>

            {/* Posts */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                ) : sortedParents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-green-300" />
                        </div>
                        <p className="font-semibold text-foreground mb-1">No posts yet</p>
                        <p className="text-sm text-muted-foreground max-w-[240px]">Be the first to share anonymously in {room.name}</p>
                    </div>
                ) : (
                    sortedParents.map(msg => (
                        <PostCard
                            key={msg.id}
                            message={msg}
                            voteData={votesData[msg.id]}
                            onVote={(type) => voteMessage.mutateAsync({ messageId: msg.id, roomId: room.id, voteType: type })}
                            onReply={() => { setReplyingTo(msg); setTimeout(() => inputRef.current?.focus(), 100); }}
                            replies={repliesByParent[msg.id] || []}
                            replyVotesData={votesData}
                            onReplyVote={(id, type) => voteMsg.mutateAsync({ messageId: id, roomId: room.id, voteType: type })}
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

            {/* Reply indicator */}
            {replyingTo && (
                <div className="px-4 py-2 bg-muted border-t border-border flex items-center gap-2">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">Replying anonymously</p>
                        <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
            )}

            {/* Input */}
            <div className="p-3 bg-muted/50 border-t border-border">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Post anonymously… (your identity is hidden)"
                        rows={2}
                        className="flex-1 bg-card rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none border border-border focus:border-primary transition-colors"
                    />
                    <Button
                        size="icon"
                        className="h-11 w-11 rounded-full shadow-md shrink-0"
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        onClick={handleSend}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">🔒 Your identity is completely hidden</p>
            </div>
        </div>
    );
}
