import { useState, useEffect } from 'react';
import { Bookmark, MessageSquare, Heart, Clock, ArrowLeft, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface SavedPost {
  id: string;
  messageId: string;
  content: string;
  authorName: string;
  roomName: string;
  likes: number;
  savedAt: string;
}

interface SavedPostsProps {
  onBack: () => void;
}

export function SavedPosts({ onBack }: SavedPostsProps) {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchSavedPosts();
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      // Try to fetch from Supabase saved_posts table
      const { data, error } = await (supabase
        .from('saved_posts' as any) as any)
        .select(`
          id,
          message_id,
          created_at,
          messages:message_id (
            id,
            content,
            likes,
            room_id,
            rooms:room_id ( name ),
            profiles:user_id ( name )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet — show friendly empty state
        console.warn('saved_posts table may not exist:', error.message);
        setSavedPosts([]);
        return;
      }

      const mapped: SavedPost[] = (data || []).map((row: any) => ({
        id: row.id,
        messageId: row.message_id,
        content: row.messages?.content || '—',
        authorName: row.messages?.profiles?.name || 'Anonymous',
        roomName: row.messages?.rooms?.name || 'Unknown Room',
        likes: row.messages?.likes || 0,
        savedAt: row.created_at,
      }));
      setSavedPosts(mapped);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (savedId: string) => {
    try {
      await (supabase.from('saved_posts' as any) as any)
        .delete()
        .eq('id', savedId);
      setSavedPosts(prev => prev.filter(p => p.id !== savedId));
      toast({ title: 'Removed', description: 'Post removed from saved.' });
    } catch {
      toast({ title: 'Error', description: 'Could not remove post.', variant: 'destructive' });
    }
  };

  const filtered = savedPosts.filter(p =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Saved Posts</h1>
          <p className="text-xs text-muted-foreground">{savedPosts.length} saved</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search saved posts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bookmark className="w-9 h-9 text-primary/60" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              {searchQuery ? 'No results found' : 'No saved posts yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {searchQuery
                ? 'Try a different search term.'
                : "Bookmark messages in any room by long-pressing them. They'll appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors"
              >
                {/* Room + author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      #{post.roomName}
                    </span>
                    <span className="text-xs text-muted-foreground">by {post.authorName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(post.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground leading-relaxed line-clamp-3">{post.content}</p>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info card if no table */}
        {!loading && savedPosts.length === 0 && !searchQuery && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center mt-4">
            <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Bookmarking posts requires a database update. Ask your admin to run the saved_posts migration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
