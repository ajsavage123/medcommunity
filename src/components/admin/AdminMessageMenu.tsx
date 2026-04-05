import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useDeleteMessage, useTogglePinMessage } from '@/hooks/useMessages';
import { EnrichedMessage } from '@/hooks/useMessages';
import { 
  Trash2, ShieldAlert, UserX, AlertTriangle, 
  Pin, PinOff, Ban, X, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AdminMessageMenuProps {
  message: EnrichedMessage;
  roomId: string;
  onClose: () => void;
}

/**
 * AdminMessageMenu — Floating context menu for admin message moderation.
 * Shows on long-press or right-click for admins in any room type.
 */
export function AdminMessageMenu({ message, roomId, onClose }: AdminMessageMenuProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { deleteAnyMessage, warnUser, banUser, deleteUserMessages } = useAdminActions();
  const togglePin = useTogglePinMessage();
  const deleteMessage = useDeleteMessage();

  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [reason, setReason] = useState('');

  const isOwnMessage = user?.id === message.userId;
  // Robust check for automated/mock messages (starting with 'guide' or 'q-')
  const isGuideMessage = 
    message.id.startsWith('guide-') || 
    message.id.startsWith('q-') || 
    (message.userId && message.userId.startsWith('guide-'));

  if (!isAdmin && !isOwnMessage) return null;

  const handleDelete = async () => {
    if (isOwnMessage && !isAdmin) {
      await deleteMessage.mutateAsync({ messageId: message.id, roomId });
    } else if (isAdmin) {
      await deleteAnyMessage.mutateAsync({ messageId: message.id, roomId });
    }
    onClose();
  };

  const handleWarn = async () => {
    if (!reason.trim()) return;
    await warnUser.mutateAsync({ userId: message.userId, reason: reason.trim() });
    setShowWarnDialog(false);
    setReason('');
    onClose();
  };

  const handleBan = async () => {
    if (!reason.trim()) return;
    await banUser.mutateAsync({ userId: message.userId, reason: reason.trim() });
    setShowBanDialog(false);
    setReason('');
    onClose();
  };

  const handleClearAllMessages = async () => {
    await deleteUserMessages.mutateAsync({ userId: message.userId, roomId });
    onClose();
  };

  const handlePin = async () => {
    await togglePin.mutateAsync({ messageId: message.id, isPinned: message.isPinned || false, roomId });
    toast.success(message.isPinned ? 'Message unpinned' : 'Message pinned');
    onClose();
  };

  // Warning dialog overlay
  if (showWarnDialog) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-sm">Send Warning</h3>
              <p className="text-[10px] text-gray-500">to {message.user?.name || 'this user'}</p>
            </div>
          </div>
          <textarea
            className="w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={3}
            placeholder="Reason for warning (user will see this)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowWarnDialog(false); setReason(''); }} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-bold">Cancel</button>
            <button onClick={handleWarn} disabled={!reason.trim()} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold disabled:opacity-50">Send Warning</button>
          </div>
        </div>
      </div>
    );
  }

  // Ban dialog overlay
  if (showBanDialog) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-2xl">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-black text-sm text-red-700 dark:text-red-400">Suspend User</h3>
              <p className="text-[10px] text-gray-500">{message.user?.name || 'This user'} will receive a final notice</p>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-3 text-xs text-red-700 dark:text-red-400">
            ⚠️ This will: send a suspension notice to the user, delete all their messages across the app, and demote their account.
          </div>
          <textarea
            className="w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            rows={3}
            placeholder="Reason for suspension (user will see this)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowBanDialog(false); setReason(''); }} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-bold">Cancel</button>
            <button onClick={handleBan} disabled={!reason.trim()} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50">Suspend Account</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150]" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar — always at top, does not scroll */}
        <div className="flex-shrink-0 pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto" />
        </div>

        {/* Message preview — fixed */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
            Message by {message.user?.name || 'User'}
          </p>
          <p className="text-sm text-gray-700 dark:text-zinc-300 line-clamp-2">{message.content}</p>
        </div>

        {/* Scrollable action list */}
        <div className="overflow-y-auto flex-1 p-3 space-y-1.5"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Own message actions */}
          {isOwnMessage && (
            <ActionButton
              icon={<Trash2 className="h-4 w-4" />}
              label="Delete my message"
              color="text-red-600"
              bg="bg-red-50 dark:bg-red-950/20"
              onClick={handleDelete}
            />
          )}

          {/* Admin-only actions */}
          {isAdmin && !isOwnMessage && !isGuideMessage && (
            <>
              <ActionButton
                icon={<Trash2 className="h-4 w-4" />}
                label="🛡 Admin Delete This Message"
                color="text-red-600"
                bg="bg-red-50 dark:bg-red-950/20"
                onClick={handleDelete}
              />
              <ActionButton
                icon={message.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                label={message.isPinned ? 'Unpin Message' : 'Pin Message'}
                color="text-orange-600"
                bg="bg-orange-50 dark:bg-orange-950/20"
                onClick={handlePin}
              />
              <ActionButton
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Clear All Messages From This User"
                color="text-purple-600"
                bg="bg-purple-50 dark:bg-purple-950/20"
                onClick={handleClearAllMessages}
              />

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-1 my-2" />

              <ActionButton
                icon={<AlertTriangle className="h-4 w-4" />}
                label="⚠️ Send Warning to User"
                color="text-amber-600"
                bg="bg-amber-50 dark:bg-amber-950/20"
                onClick={() => setShowWarnDialog(true)}
              />
              <ActionButton
                icon={<Ban className="h-4 w-4" />}
                label="🚫 Suspend User Account"
                color="text-red-700"
                bg="bg-red-100 dark:bg-red-950/30"
                onClick={() => setShowBanDialog(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, bg, onClick }: {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${bg} ${color} font-bold text-sm text-left transition-all active:scale-95`}
    >
      {icon}
      {label}
    </button>
  );
}
