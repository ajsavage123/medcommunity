import { useState, useRef, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { JobPost } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useMessages, useSendMessage, EnrichedMessage } from '@/hooks/useMessages';
import { useMessageVotes, useVoteMessage } from '@/hooks/useMessageVotes';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCard } from './JobCard';
import { UserProfileDrawer } from '@/components/profile/UserProfileDrawer';

interface JobDiscussionProps {
    job: JobPost;
    onClose: () => void;
    onVoteJob: (type: 'up' | 'down') => void;
}

export function JobDiscussion({ job, onClose, onVoteJob }: JobDiscussionProps) {
    const [newMessage, setNewMessage] = useState('');
    const [viewingUser, setViewingUser] = useState<any>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { data: messages = [], isLoading } = useMessages(job.id);
    const sendMessage = useSendMessage();

    // We reuse message voting logic here
    const allIds = messages.map(m => m.id);
    const { data: votesData = {} } = useMessageVotes(allIds);
    const voteMsg = useVoteMessage();

    // Focus input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        try {
            await sendMessage.mutateAsync({
                roomId: job.id, // Using jobId as roomId for the thread constraint
                content: trimmed,
                isAnonymous: false,
            });
            setNewMessage('');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm shrink-0">
                <h2 className="font-semibold text-foreground">Job Discussion</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/10">
                {/* Original Job Post at top */}
                <div className="px-4 py-4 border-b border-border/50 bg-background mb-2">
                    <JobCard
                        job={job}
                        onVote={onVoteJob}
                        onDiscuss={() => { }} // No-op while inside discussion
                    />
                </div>

                {/* Comments Section */}
                <div className="px-4 pb-4 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{messages.length} Comments</h3>

                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <p className="text-foreground font-semibold mb-1">No questions yet</p>
                            <p className="text-sm text-muted-foreground">Ask the poster for details about this role, requirements, or the interviewing process.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className="flex gap-3">
                                {/* Vote column */}
                                <div className="flex flex-col items-center gap-0.5 min-w-[24px] pt-1 mt-1">
                                    <button
                                        onClick={() => voteMsg.mutate({ messageId: msg.id, roomId: job.id, voteType: 'up' })}
                                        className={cn('rounded-full p-1.5 transition-colors', votesData[msg.id]?.userVote === 'up' ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5')}
                                    >
                                        <Heart className={cn("w-4 h-4", votesData[msg.id]?.userVote === 'up' && "fill-current")} />
                                    </button>
                                    <span className={cn('text-[10px] font-bold', (votesData[msg.id]?.upvotes ?? 0) - (votesData[msg.id]?.downvotes ?? 0) > 0 ? 'text-rose-500' : 'text-muted-foreground')}>
                                        {(votesData[msg.id]?.upvotes ?? 0) - (votesData[msg.id]?.downvotes ?? 0)}
                                    </span>
                                </div>
                                    <div className="flex-1 bg-card border border-border rounded-xl p-3 shadow-sm relative">
                                         <div className="flex items-center gap-1.5 mb-2">
                                             <button 
                                                 onClick={() => msg.user && setViewingUser(msg.user)}
                                                 className="text-xs font-semibold text-foreground hover:text-primary hover:underline transition-all"
                                             >
                                                 {msg.user?.name || 'Anonymous'}
                                             </button>
                                        {msg.userId === job.userId && (
                                            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Poster</span>
                                        )}
                                        <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(msg.createdAt, { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm text-foreground/90 leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-card border-t border-border mt-auto shadow-[0_-5px_20px_-10px_var(--bg-muted)]">
                <div className="flex items-end gap-2 max-w-lg mx-auto">
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Add a comment or ask a question..."
                        rows={1}
                        className="flex-1 bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all min-h-[44px] max-h-32"
                    />
                    <Button
                        size="icon"
                        className="h-11 w-11 rounded-full shadow-md shrink-0 disabled:opacity-50"
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        onClick={handleSend}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <UserProfileDrawer 
                user={viewingUser} 
                isOpen={!!viewingUser} 
                onOpenChange={(open) => !open && setViewingUser(null)} 
            />
        </div>
    );
}
