import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock } from 'lucide-react';
import { useCreateTopic } from '@/hooks/useTopics';
import { toast } from '@/hooks/use-toast';

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomIsAnonymous?: boolean;
}

export function CreateTopicDialog({ 
  open, 
  onOpenChange, 
  roomId,
  roomIsAnonymous = false 
}: CreateTopicDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(roomIsAnonymous);
  const createTopic = useCreateTopic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your topic',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedTitle.length > 200) {
      toast({
        title: 'Title too long',
        description: 'Title must be 200 characters or less',
        variant: 'destructive',
      });
      return;
    }

    if (content.length > 5000) {
      toast({
        title: 'Content too long',
        description: 'Content must be 5000 characters or less',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTopic.mutateAsync({
        roomId,
        title: trimmedTitle,
        content: content.trim() || undefined,
        isAnonymous: roomIsAnonymous || isAnonymous,
      });

      toast({
        title: 'Topic created',
        description: 'Your topic has been created successfully',
      });

      // Reset form and close
      setTitle('');
      setContent('');
      setIsAnonymous(roomIsAnonymous);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create topic',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Start a new clinical discussion or ask a question to the community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              maxLength={200}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Details (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add more context to your topic..."
              maxLength={5000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000
            </p>
          </div>

          {!roomIsAnonymous && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Post anonymously
                </Label>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
          )}

          {(roomIsAnonymous || isAnonymous) && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
              Your identity will be hidden from other users
            </p>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTopic.isPending || !title.trim()}
            >
              {createTopic.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
