import { useState, useRef } from 'react';
import {
    ArrowLeft, ChevronUp, ChevronDown, MessageCircle,
    Plus, Check, Filter, MoreVertical, X, Send
} from 'lucide-react';
import { Room } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { getClayAvatar } from '@/lib/avatars';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminMessageMenu } from '@/components/admin/AdminMessageMenu';
import { EnrichedMessage } from '@/hooks/useMessages';

interface QAPost {
    id: string;
    title: string;
    body: string;
    authorName: string;
    authorBadge: string;
    authorGender?: 'male' | 'female';
    upvotes: number;
    answers: QAAnswer[];
    status: 'open' | 'resolved';
    createdAt: Date;
    userVote?: 'up' | 'down' | null;
}
interface QAAnswer {
    id: string;
    body: string;
    authorName: string;
    authorBadge: string;
    authorGender?: 'male' | 'female';
    upvotes: number;
    isAccepted: boolean;
    createdAt: Date;
    userVote?: 'up' | 'down' | null;
}

const MOCK_QA: QAPost[] = [
    {
        id: 'q1', status: 'open',
        title: 'Are mandatory overtime rules being violated in private ambulance services?',
        body: 'My employer has been forcing us to work beyond 16 hours without proper compensation. Is this legal under EMS labor laws? Any HR contacts or unions we can reach out to?',
        authorName: 'Jordan Chen', authorBadge: 'Paramedic · 5yr', authorGender: 'male',
        upvotes: 47, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        answers: [
            { id: 'a1', body: 'This is a clear violation of FLSA standards. You should document every shift with timestamps and file a complaint with your state labor board. Also, NAEMSP has resources for exactly this.', authorName: 'Sam Rivera', authorBadge: 'EMT · 8yr', authorGender: 'female', upvotes: 34, isAccepted: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), userVote: null },
            { id: 'a2', body: 'Check with your union rep first. Many states have specific EMS labor protections beyond federal law. Keep records of everything.', authorName: 'Riley M.', authorBadge: 'Paramedic · 3yr', authorGender: 'male', upvotes: 18, isAccepted: false, createdAt: new Date(Date.now() - 1000 * 60 * 60), userVote: null },
        ],
    },
    {
        id: 'q2', status: 'open',
        title: 'What are our rights when denied PPE during high-risk calls?',
        body: 'Station management has been restricting N95 usage claiming shortage. We had three confirmed COVID exposures last month. What steps can we take?',
        authorName: 'Anonymous', authorBadge: 'EMT', authorGender: 'female',
        upvotes: 89, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        answers: [
            { id: 'a3', body: 'OSHA 29 CFR 1910.134 requires employers to provide appropriate respiratory protection. File an anonymous OSHA complaint immediately — retaliation is illegal.', authorName: 'Medical Director', authorBadge: 'EMS Physician', authorGender: 'male', upvotes: 62, isAccepted: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), userVote: null },
        ],
    },
    {
        id: 'q3', status: 'resolved',
        title: 'Night shift differential — is it mandatory for government EMS?',
        body: "Our new contract removes night shift pay differentials. Other government employees in the same department still get it. Is there a legal basis to challenge this?",
        authorName: 'Alex P.', authorBadge: 'Paramedic · 10yr', authorGender: 'male',
        upvotes: 31, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        answers: [
            { id: 'a4', body: 'It depends on your CBA. If the union negotiated differential pay for other classifications, EMS may be entitled under equal treatment clauses. Consult your union steward.', authorName: 'HR Specialist', authorBadge: 'EMS HR Manager', authorGender: 'female', upvotes: 29, isAccepted: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20), userVote: null },
        ],
    },
];

type FilterMode = 'all' | 'open' | 'resolved';

interface PostCardProps {
    post: QAPost;
    onClick: () => void;
    onVote: (dir: 'up' | 'down') => void;
}

function PostCard({ post, onClick, onVote }: PostCardProps) {
    const acceptedAns = post.answers.find(a => a.isAccepted);
    return (
        <div
            className={cn(
                'bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.99]',
                post.status === 'resolved' ? 'border-green-200' : 'border-border'
            )}
            onClick={onClick}
        >
            {/* Status bar */}
            <div className={cn(
                'flex items-center justify-between px-4 py-2 border-b text-xs font-bold uppercase tracking-wider',
                post.status === 'resolved'
                    ? 'bg-green-50 border-green-100 text-green-700'
                    : 'bg-orange-50 border-orange-100 text-orange-700'
            )}>
                <span className="flex items-center gap-1">
                    {post.status === 'resolved' ? <Check className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                    {post.status === 'resolved' ? 'Resolved' : 'Open · Discussion'}
                </span>
                <span className="font-normal text-muted-foreground capitalize">{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
            </div>

            <div className="flex gap-3 p-4">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); onVote('up'); }}
                        className={cn('p-1 rounded-lg transition-colors', post.userVote === 'up' ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
                        <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className={cn('text-sm font-bold', post.upvotes > 30 ? 'text-primary' : 'text-muted-foreground')}>{post.upvotes}</span>
                    <button onClick={e => { e.stopPropagation(); onVote('down'); }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground">{post.authorName}</span>
                        {' · '}<span className="text-primary">{post.authorBadge}</span>
                    </p>
                    <h3 className="font-bold text-sm text-foreground leading-snug mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.body}</p>

                    {/* Accepted answer preview */}
                    {acceptedAns && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 mb-2">
                            <div className="flex items-center gap-1 mb-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-[10px] font-bold text-green-700">Best Answer</span>
                            </div>
                            <p className="text-xs text-foreground line-clamp-1">{acceptedAns.body}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.answers.length}</span>
                        <span className="ml-auto text-primary font-semibold">View discussion →</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PostDetail({ post, onBack, setPost }: { post: QAPost; onBack: () => void; setPost: (p: QAPost) => void }) {
    const [reply, setReply] = useState('');
    const [localAnswers, setLocalAnswers] = useState<QAAnswer[]>(post.answers);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const sortedAnswers = [...localAnswers].sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.upvotes - a.upvotes;
    });

    const handleSubmit = () => {
        const t = reply.trim();
        if (!t) return;
        const newAns: QAAnswer = {
            id: `a-${Date.now()}`, body: t, authorName: 'You (Dev)',
            authorBadge: 'Paramedic', upvotes: 0, isAccepted: false,
            createdAt: new Date(), userVote: null,
        };
        setLocalAnswers(prev => [...prev, newAns]);
        setReply('');
        toast({ title: 'Answer posted!' });
    };

    return (
        <div className="flex flex-col h-[100dvh] fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[hsl(24,95%,43%)] to-[hsl(24,95%,55%)] text-white shadow-lg">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm truncate">Leadership & Rights</h2>
                    <p className="text-xs text-white/70">Q&A Discussion</p>
                </div>
                <span className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full',
                    post.status === 'resolved' ? 'bg-green-500/30 text-green-200' : 'bg-white/20 text-white'
                )}>
                    {post.status === 'resolved' ? '✓ Resolved' : '● Open'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Question */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-border shadow-sm">
                            <img src={getClayAvatar(post.id, post.authorGender, post.authorName)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">{post.authorName}</p>
                            <p className="text-[10px] text-primary">{post.authorBadge}</p>
                        </div>
                        <span className="ml-auto text-[10px] text-muted-foreground">{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                    </div>
                    <h2 className="font-bold text-base text-foreground mb-2">{post.title}</h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">{post.body}</p>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                            <button onClick={() => { }} className="text-primary"><ChevronUp className="w-4 h-4" /></button>
                            <span className="text-sm font-bold text-foreground">{post.upvotes}</span>
                            <button onClick={() => { }} className="text-muted-foreground hover:text-destructive"><ChevronDown className="w-4 h-4" /></button>
                        </div>
                        {post.status === 'open' && (
                            <button
                                onClick={() => { setPost({ ...post, status: 'resolved' }); toast({ title: 'Marked as resolved ✓' }); }}
                                className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                                <Check className="w-3.5 h-3.5" /> Mark Resolved
                            </button>
                        )}
                    </div>
                </div>

                {/* Answers */}
                <div className="p-4 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">{localAnswers.length} {localAnswers.length === 1 ? 'Answer' : 'Answers'}</h3>
                    {sortedAnswers.map(ans => (
                        <div key={ans.id} className={cn(
                            'border rounded-2xl p-4',
                            ans.isAccepted ? 'border-green-300 bg-green-50' : 'border-border bg-card'
                        )}>
                            {ans.isAccepted && (
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-green-700">Accepted Answer</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden border border-border">
                                    <img src={getClayAvatar(ans.id, ans.authorGender, ans.authorName)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">{ans.authorName}</p>
                                    <p className="text-[10px] text-primary">{ans.authorBadge}</p>
                                </div>
                                <span className="ml-auto text-[10px] text-muted-foreground">{formatDistanceToNow(ans.createdAt, { addSuffix: true })}</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed mb-3">{ans.body}</p>
                            <div className="flex items-center gap-3 border-t border-border/50 pt-2">
                                <div className="flex items-center gap-1">
                                    <button className="text-muted-foreground hover:text-primary transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                    <span className="text-xs font-bold text-foreground">{ans.upvotes}</span>
                                    <button className="text-muted-foreground hover:text-destructive transition-colors"><ChevronDown className="w-4 h-4" /></button>
                                </div>
                                {!ans.isAccepted && post.status === 'open' && (
                                    <button
                                        onClick={() => setLocalAnswers(prev => prev.map(a => ({ ...a, isAccepted: a.id === ans.id })))}
                                        className="ml-auto text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" /> Mark as Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Answer input */}
            <div className="p-4 border-t border-border bg-card">
                <p className="text-xs font-semibold text-foreground mb-2">Your Answer</p>
                <div className="flex gap-2">
                    <textarea
                        ref={inputRef}
                        className="flex-1 bg-muted rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        rows={2}
                        placeholder="Share your knowledge or experience…"
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!reply.trim()}
                        className={cn('w-11 h-11 rounded-full flex items-center justify-center mt-1 transition-all shadow-md', reply.trim() ? 'bg-[hsl(24,95%,53%)] text-white hover:bg-[hsl(24,95%,43%)]' : 'bg-muted text-muted-foreground')}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface QAForumChatProps {
    room: Room;
    onBack: () => void;
}

export function QAForumChat({ room, onBack }: QAForumChatProps) {
    const [posts, setPosts] = useState<QAPost[]>(MOCK_QA);
    const [filter, setFilter] = useState<FilterMode>('all');
    const [selected, setSelected] = useState<QAPost | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '' });
    const [adminMenu, setAdminMenu] = useState<any>(null);
    const { isAdmin } = useAdmin();

    if (selected) {
        return (
            <PostDetail
                post={selected}
                onBack={() => setSelected(null)}
                setPost={(updated) => {
                    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
                    setSelected(updated);
                }}
            />
        );
    }

    const filtered = posts.filter(p => {
        if (filter === 'open') return p.status === 'open';
        if (filter === 'resolved') return p.status === 'resolved';
        return true;
    });

    const handleSubmit = () => {
        if (!form.title.trim() || !form.body.trim()) return;
        const newPost: QAPost = {
            id: `q-${Date.now()}`, title: form.title, body: form.body,
            authorName: 'You (Dev)', authorBadge: 'Paramedic', upvotes: 0,
            answers: [], status: 'open', createdAt: new Date(),
        };
        setPosts(prev => [newPost, ...prev]);
        setForm({ title: '', body: '' });
        setShowForm(false);
        toast({ title: 'Question posted!', description: 'Your complaint/question is now public.' });
    };

    return (
        <div className="flex flex-col h-[100dvh] fixed inset-0 z-[100] bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[hsl(24,95%,43%)] to-[hsl(24,95%,55%)] text-white shadow-lg">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🛡️</div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate">{room.name}</h2>
                    <p className="text-xs text-white/70">{room.memberCount.toLocaleString()} members · Q&A Forum</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Raise Issue
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-border bg-card">
                {(['all', 'open', 'resolved'] as FilterMode[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize',
                            filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        {f === 'all' ? 'All Issues' : f === 'open' ? '● Open' : '✓ Resolved'}
                    </button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} posts</span>
            </div>

            {/* Post list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filtered.map(post => (
                    <div key={post.id} className="relative group">
                        <PostCard
                            post={post}
                            onClick={() => setSelected(post)}
                            onVote={() => { }}
                        />
                        {isAdmin && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Map QAPost to a minimal EnrichedMessage structure for the menu
                                    setAdminMenu({
                                        id: post.id,
                                        content: post.title,
                                        createdAt: post.createdAt,
                                        roomId: room.id,
                                        user: { name: post.authorName, id: post.id, avatarUrl: '', userType: post.authorBadge }
                                    });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-zinc-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border"
                            >
                                <MoreVertical className="w-4 h-4 text-primary" />
                            </button>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-2xl mb-2">🛡️</p>
                        <p className="font-semibold text-foreground">No {filter} issues</p>
                        <p className="text-sm text-muted-foreground mt-1">Be the first to raise a concern</p>
                    </div>
                )}
            </div>

            {/* New question modal — mobile-safe bottom sheet */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
                    {/* Backdrop tap to dismiss */}
                    <div className="absolute inset-0" onClick={() => setShowForm(false)} />
                    <div className="relative w-full bg-background rounded-t-3xl overflow-x-hidden overflow-y-auto max-h-[85vh] animate-slide-up">
                        <div className="p-4 space-y-3">
                            {/* Handle bar */}
                            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-2" />
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base text-foreground">Raise Issue / Complaint</h3>
                                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                            <input
                                className="block w-full min-w-0 px-4 py-3 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Short title of your issue…"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                maxLength={120}
                            />
                            <textarea
                                className="block w-full min-w-0 px-4 py-3 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                rows={4}
                                placeholder="Describe the situation… Others can share advice and experiences."
                                value={form.body}
                                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!form.title.trim() || !form.body.trim()}
                                className="block w-full py-3 rounded-xl bg-[hsl(24,95%,53%)] text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(24,95%,43%)] transition-colors"
                            >
                                Post Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {adminMenu && (
                <AdminMessageMenu
                    message={adminMenu}
                    roomId={room.id}
                    onClose={() => setAdminMenu(null)}
                />
            )}
        </div>
    );
}
