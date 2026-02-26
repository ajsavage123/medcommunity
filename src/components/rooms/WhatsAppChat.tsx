import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Send, Lock, X, Pin, PinOff,
  CheckCheck, MessageCircle, MoreVertical, Copy, Trash2, Search as SearchIcon,
  Paperclip, Image as ImageIcon, FileText, Camera
} from 'lucide-react';
import { Room } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useMessages, useSendMessage, EnrichedMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getClayAvatar } from '@/lib/avatars';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(d: Date) { return format(d, 'HH:mm'); }
function fmtDate(d: Date) {
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
}

// ─── Online counts placeholder ────────────────────────────────────────────────

const ONLINE_COUNTS: Record<string, number> = {
  general: 142, salary: 89, career: 67, leadership: 53,
  entrepreneurship: 34, certifications: 98, students: 76, library: 45,
};

const DESIGNATION_THEMES: Record<string, { bg: string, text: string, border: string, shadow: string }> = {
  hr: { bg: 'bg-slate-50/80', text: 'text-slate-700', border: 'border-slate-200/50', shadow: 'shadow-slate-900/5' },
  paramedic: { bg: 'bg-rose-50/80', text: 'text-rose-700', border: 'border-rose-200/50', shadow: 'shadow-rose-900/5' },
  emr: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-200/50', shadow: 'shadow-emerald-900/5' },
  emt: { bg: 'bg-blue-50/80', text: 'text-blue-700', border: 'border-blue-200/50', shadow: 'shadow-blue-900/5' },
  advance_emt: { bg: 'bg-sky-50/80', text: 'text-sky-700', border: 'border-sky-200/50', shadow: 'shadow-sky-900/5' },
  advance_paramedic: { bg: 'bg-red-50/80', text: 'text-red-700', border: 'border-red-200/50', shadow: 'shadow-red-900/5' },
  instructor: { bg: 'bg-amber-50/80', text: 'text-amber-700', border: 'border-amber-200/50', shadow: 'shadow-amber-900/5' },
  default: { bg: 'bg-slate-50/80', text: 'text-slate-600', border: 'border-slate-200/50', shadow: 'shadow-slate-900/5' }
};

// ─── Room-Specific Themes ────────────────────────────────────────────────────

interface RoomTheme {
  primary: string;
  header: string;
  bg: string;
  bubbleColor: string;
  textColor: string;
  nameColor: string;
  pattern: string;
}

const ROOM_THEMES: Record<string, RoomTheme> = {
  general: {
    primary: '#075e54',
    header: 'bg-[#075e54]',
    bg: 'bg-[#f0f2f5]',
    bubbleColor: 'bg-white',
    textColor: 'text-[#303030]',
    nameColor: 'text-[#075e54]',
    pattern: 'radial-gradient(#075e54 0.5px, transparent 0.5px)',
  },
  students: {
    primary: '#6366f1',
    header: 'bg-[#6366f1]',
    bg: 'bg-[#f5f7ff]',
    bubbleColor: 'bg-white',
    textColor: 'text-[#1e1b4b]',
    nameColor: 'text-[#4338ca]',
    pattern: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)',
  },
  career: {
    primary: '#0f172a',
    header: 'bg-[#0f172a]',
    bg: 'bg-[#f8fafc]',
    bubbleColor: 'bg-white',
    textColor: 'text-[#0f172a]',
    nameColor: 'text-[#334155]',
    pattern: 'radial-gradient(#0f172a 0.5px, transparent 0.5px)',
  },
  entrepreneurship: {
    primary: '#1e3a8a',
    header: 'bg-[#1e3a8a]',
    bg: 'bg-[#f1f5f9]',
    bubbleColor: 'bg-white',
    textColor: 'text-[#0f172a]',
    nameColor: 'text-[#1e3a8a]',
    pattern: 'radial-gradient(#1e3a8a 0.5px, transparent 0.5px)',
  },
  certifications: {
    primary: '#15803d',
    header: 'bg-[#15803d]',
    bg: 'bg-[#f0fdf4]',
    bubbleColor: 'bg-white',
    textColor: 'text-[#14532d]',
    nameColor: 'text-[#15803d]',
    pattern: 'radial-gradient(#15803d 0.5px, transparent 0.5px)',
  }
};

interface CtxMenu { x: number; y: number; msg: EnrichedMessage }

interface WhatsAppChatProps {
  room: Room;
  onBack: () => void;
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function ChatHeader({ room, onBack, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery }: {
  room: Room;
  onBack: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const theme = ROOM_THEMES[room.type] || ROOM_THEMES.general;
  const online = ONLINE_COUNTS[room.type] ?? 0;

  return (
    <div className={cn("flex flex-col text-white shadow-md z-50 sticky top-0 safe-top", theme.header)}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        {!isSearchOpen ? (
          <>
            <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <span className="text-xl">
                {room.type === 'students' ? '🎓' : room.type === 'certifications' ? '🏅' : '💬'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm sm:text-[17px] leading-tight break-words">{room.name}</h2>
              <p className="text-[11px] text-white/70 font-medium">
                {online} professional{online !== 1 ? 's' : ''} online
              </p>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <SearchIcon className="w-5 h-5 text-white/80" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                <MoreVertical className="w-5 h-5 text-white/80" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-white/60" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/40 font-medium text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 rounded-full hover:bg-white/10">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({
  msg, isOwn, isAnonymousRoom, showAvatar, showName, isPinned, theme, onCtx, onReply, allMessages
}: {
  msg: EnrichedMessage;
  isOwn: boolean;
  isAnonymousRoom: boolean;
  showAvatar: boolean;
  showName: boolean;
  isPinned: boolean;
  theme: RoomTheme;
  onCtx: (e: any, m: EnrichedMessage) => void;
  onReply: () => void;
  allMessages: EnrichedMessage[];
}) {
  const showAnon = isAnonymousRoom || msg.isAnonymous;
  const displayName = showAnon ? 'Anonymous' : (msg.user?.name ?? 'User');
  const avatarUrl = useMemo(() => msg.user?.avatar || getClayAvatar(msg.userId, msg.user?.gender as any, msg.user?.name), [msg.userId, msg.user?.avatar, msg.user?.gender, msg.user?.name]);

  // Designation Badge Logic
  const badge = useMemo(() => {
    if (showAnon || !msg.user) return null;

    // Format label strictly to requested list
    let rawLabel = (msg.user.qualification || msg.user.userType || 'Professional').toLowerCase();

    let label = '';
    const themes = DESIGNATION_THEMES;
    let theme = { bg: 'bg-slate-50/80', text: 'text-slate-600', border: 'border-slate-200/50', shadow: 'shadow-slate-900/5' }; // Default theme

    if (rawLabel === 'hr') { label = 'HR / RECRUITER'; theme = themes.hr; }
    else if (rawLabel === 'paramedic') { label = 'PARAMEDIC'; theme = themes.paramedic; }
    else if (rawLabel === 'emr') { label = 'EMR'; theme = themes.emr; }
    else if (rawLabel === 'emt') { label = 'EMT'; theme = themes.emt; }
    else if (rawLabel.includes('advance') && rawLabel.includes('emt')) { label = 'ADVANCE EMT'; theme = themes.advance_emt; }
    else if (rawLabel.includes('advance') && rawLabel.includes('paramedic')) { label = 'ADVANCE PARAMEDIC'; theme = themes.advance_paramedic; }
    else if (rawLabel === 'instructor') { label = 'INSTRUCTOR'; theme = themes.instructor; }
    else { label = rawLabel.toUpperCase().replace(/_/g, ' '); }

    return { label, theme };
  }, [msg.user, showAnon]);

  // Swipe-to-reply simulation
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    if (diff > 0 && diff < 80) setDragX(diff);
  };
  const onTouchEnd = () => {
    if (dragX > 50) onReply();
    setDragX(0);
  };

  return (
    <div
      id={msg.id}
      className={cn(
        'flex gap-2 px-3 relative transition-transform duration-200',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        showName && 'mt-4',
      )}
      style={{ transform: `translateX(${dragX}px)` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={(e) => { e.stopPropagation(); onCtx(e, msg); }}
    >
      {dragX > 20 && (
        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 text-primary opacity-50">
          <MessageCircle className="w-5 h-5" />
        </div>
      )}

      {showAvatar ? (
        <div className="w-[42px] h-[42px] shrink-0 self-end mb-0.5 relative">
          <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/50 to-black/10 blur-[1px]" />
          <div className="relative w-full h-full rounded-[18px] bg-white overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1)] border border-slate-200">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover p-1 animate-in zoom-in-50 duration-500"
            />
          </div>
        </div>
      ) : (
        <div className="w-[42px] shrink-0" />
      )}

      <div className={cn('flex flex-col max-w-[82%]', isOwn ? 'items-end' : 'items-start')}>
        {showName && (
          <div className={cn("flex items-center gap-1.5 mb-1 px-1", isOwn && "flex-row-reverse")}>
            <span className={cn("text-[12px] font-bold", theme.nameColor)}>
              {isOwn ? 'You' : displayName}
            </span>
            {badge && (
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border backdrop-blur-sm transition-all shadow-sm",
                badge.theme.bg, badge.theme.text, badge.theme.border, badge.theme.shadow
              )}>
                {badge.label}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative px-3.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] min-w-[80px] transition-all duration-300',
            theme.bubbleColor, theme.textColor,
            isOwn ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none border border-slate-100',
            isPinned && 'ring-2 ring-orange-400 ring-offset-1 ring-offset-background'
          )}
        >
          {isPinned && (
            <div className={cn("absolute -top-3 bg-orange-500 text-white p-1 rounded-full shadow-lg border-2 border-white animate-bounce-subtle z-10", isOwn ? "-right-2" : "-left-2")}>
              <Pin className="w-2.5 h-2.5 fill-current" />
            </div>
          )}

          {msg.replyTo && (
            <div
              className="mb-2 p-2 bg-black/5 rounded-lg border-l-[4px] text-[11px] text-slate-500 cursor-pointer hover:bg-black/10 transition-all active:scale-[0.98] select-none overflow-hidden"
              style={{ borderLeftColor: theme.primary }}
              onClick={(e) => {
                e.stopPropagation();
                const el = document.getElementById(msg.replyTo!);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('animate-pulse-gold');
                  setTimeout(() => el.classList.remove('animate-pulse-gold'), 3000);
                }
              }}
            >
              <div className="font-bold text-[10px] uppercase mb-0.5" style={{ color: theme.primary }}>
                {allMessages.find(m => m.id === msg.replyTo)?.isAnonymous
                  ? 'Anonymous'
                  : (allMessages.find(m => m.id === msg.replyTo)?.user?.name || 'User')}
              </div>
              <div className="line-clamp-2 leading-tight pr-2">
                {allMessages.find(m => m.id === msg.replyTo)?.content || 'Original message not found'}
              </div>
            </div>
          )}

          <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap pr-10 pb-2">
            {msg.content}
          </div>

          <div className="absolute right-2 bottom-1 flex items-center gap-1 opacity-50">
            <span className="text-[9px] font-bold uppercase">
              {fmtTime(msg.createdAt)}
            </span>
            {isOwn && (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────────────────────

export function WhatsAppChat({ room, onBack }: WhatsAppChatProps) {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<EnrichedMessage | null>(null);
  const [ctx, setCtx] = useState<CtxMenu | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [showGallery, setShowGallery] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(room.id);
  const sendMessage = useSendMessage();

  const theme = useMemo(() => ROOM_THEMES[room.type] || ROOM_THEMES.general, [room.type]);

  useEffect(() => {
    if (!isSearchOpen && !searchQuery) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearchOpen, searchQuery]);

  const handleSend = async (content?: string) => {
    const val = content || text.trim();
    if (!val) return;
    try {
      await sendMessage.mutateAsync({
        roomId: room.id, content: val,
        isAnonymous: room.isAnonymous ?? false,
        replyTo: replyingTo?.id,
      });
      setText('');
      setReplyingTo(null);
    } catch { toast({ title: 'Error sending message', variant: 'destructive' }); }
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(m =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const groupedMessages = useMemo(() => filteredMessages.map((m, i) => {
    const prev = filteredMessages[i - 1];
    const first = !prev || prev.userId !== m.userId || !isSameDay(prev.createdAt, m.createdAt);
    const last = !filteredMessages[i + 1] || filteredMessages[i + 1].userId !== m.userId || !isSameDay(filteredMessages[i + 1].createdAt, m.createdAt);
    return { ...m, showName: first, showAvatar: last };
  }), [filteredMessages]);

  return (
    <div className={cn("flex flex-col h-[100dvh] overflow-hidden fixed inset-0 z-[100] font-sans transition-colors duration-500", theme.bg)}>
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: theme.pattern,
          backgroundSize: '24px 24px',
        }}
      />

      <ChatHeader
        room={room}
        onBack={onBack}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {pinnedIds.size > 0 && !isSearchOpen && (
        <div
          className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 z-20 cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
          onClick={() => {
            const lastId = Array.from(pinnedIds).pop();
            const el = document.getElementById(lastId!);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el?.classList.add('animate-pulse-gold');
            setTimeout(() => el?.classList.remove('animate-pulse-gold'), 3000);
          }}
        >
          <Pin className="w-4 h-4 text-orange-600 fill-current" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-600 uppercase leading-none mb-0.5">Pinned Message</p>
            <p className="text-[13px] text-slate-700 font-medium truncate">
              {messages.find(m => m.id === Array.from(pinnedIds).pop())?.content}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPinnedIds(new Set()); }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4 space-y-1 relative scroll-smooth scrollbar-none">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-14 w-2/3 rounded-2xl" />
            <Skeleton className="h-14 w-1/2 ml-auto rounded-2xl" />
          </div>
        ) : groupedMessages.map((m, i) => (
          <div key={m.id}>
            {(i === 0 || !isSameDay(m.createdAt, groupedMessages[i - 1].createdAt)) && (
              <div className="flex justify-center my-6 sticky top-2 z-10">
                <span className="px-4 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-sm border border-slate-200">
                  {fmtDate(m.createdAt)}
                </span>
              </div>
            )}
            <Bubble
              msg={m}
              isOwn={user?.id === m.userId}
              isAnonymousRoom={room.isAnonymous ?? false}
              showName={m.showName}
              showAvatar={m.showAvatar}
              isPinned={pinnedIds.has(m.id)}
              theme={theme}
              onCtx={(e, msg) => setCtx({ x: e.clientX || e.pageX || 100, y: e.clientY || e.pageY || 200, msg })}
              onReply={() => setReplyingTo(m)}
              allMessages={messages}
            />
          </div>
        ))}
        <div ref={endRef} className="h-4" />
      </div>

      {replyingTo && (
        <div className="px-4 py-2 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500 shadow-sm z-20">
          <div className={cn("w-1 h-10 rounded-full shrink-0", theme.header)} />
          <div className="flex-1 min-w-0">
            <p className={cn("text-[11px] font-bold uppercase", theme.nameColor)}>
              Replying to {replyingTo.isAnonymous ? 'Anonymous' : replyingTo.user?.name}
            </p>
            <p className="text-[13px] text-slate-500 truncate">{replyingTo.content}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-end gap-3 shrink-0 z-20">
        <div className="relative group">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={cn(
              "p-2.5 rounded-2xl transition-all shadow-sm active:scale-90",
              showGallery ? cn(theme.header, "text-white") : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            <Paperclip className="w-6 h-6 rotate-45" />
          </button>

          {showGallery && (
            <div className="absolute bottom-full left-0 mb-4 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 grid grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300 w-72 z-50">
              <button className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-blue-50 transition-all group/btn" onClick={() => { handleSend("🖼️ Sharing high-res clinical image..."); setShowGallery(false); }}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover/btn:scale-110 duration-300"><ImageIcon className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-slate-600">Photos</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-emerald-50 transition-all group/btn" onClick={() => { handleSend("📄 Sharing secure medical document..."); setShowGallery(false); }}>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover/btn:scale-110 duration-300"><FileText className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-slate-600">Document</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-amber-50 transition-all group/btn" onClick={() => { handleSend("📸 Taking a clinical photo..."); setShowGallery(false); }}>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm group-hover/btn:scale-110 duration-300"><Camera className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold text-slate-600">Camera</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 min-h-[48px] flex items-center shadow-inner focus-within:bg-white focus-within:shadow-md transition-all border border-transparent focus-within:border-slate-200">
          <textarea
            rows={1}
            value={text}
            onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message"
            className="w-full bg-transparent text-[15px] focus:outline-none resize-none max-h-40 text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        <button
          onClick={() => handleSend()}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all text-white",
            theme.header
          )}
        >
          <Send className="w-5 h-5 fill-current" />
        </button>
      </div>

      {ctx && (
        <div className="fixed inset-0 z-[100]" onClick={() => setCtx(null)}>
          <div
            className="absolute bg-white shadow-2xl rounded-2xl py-1.5 min-w-[180px] border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ left: Math.min(ctx.x, window.innerWidth - 200), top: Math.min(ctx.y, window.innerHeight - 300) }}
          >
            <button onClick={() => { setReplyingTo(ctx.msg); setCtx(null); }} className="w-full px-4 py-3 text-left text-[14px] flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 font-bold">
              <MessageCircle className="w-4 h-4 text-blue-500" /> Reply
            </button>
            {user?.id === ctx.msg.userId && (
              <button
                onClick={() => {
                  setPinnedIds(p => { const s = new Set(p); s.has(ctx.msg.id) ? s.delete(ctx.msg.id) : s.add(ctx.msg.id); return s; });
                  setCtx(null);
                  toast({ title: pinnedIds.has(ctx.msg.id) ? 'Message unpinned' : 'Message pinned successfully' });
                }}
                className="w-full px-4 py-3 text-left text-[14px] flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 font-bold"
              >
                <Pin className={cn("w-4 h-4", pinnedIds.has(ctx.msg.id) ? "text-red-500" : "text-orange-500")} />
                {pinnedIds.has(ctx.msg.id) ? 'Unpin' : 'Pin'}
              </button>
            )}
            <button onClick={() => { navigator.clipboard.writeText(ctx.msg.content); setCtx(null); toast({ title: 'Copied' }); }} className="w-full px-4 py-3 text-left text-[14px] flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 font-bold">
              <Copy className="w-4 h-4 text-slate-500" /> Copy
            </button>
            <div className="p-1">
              <button className="w-full px-3 py-2 text-left text-[14px] flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all text-red-600 font-bold">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes pulse-gold {
          0% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4); background-color: rgba(251, 146, 60, 0.1); }
          70% { box-shadow: 0 0 0 15px rgba(251, 146, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0); }
        }
        .animate-pulse-gold {
          animation: pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
