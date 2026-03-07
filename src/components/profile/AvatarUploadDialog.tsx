import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { Camera, Link, Loader2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarUploadDialog({ open, onOpenChange }: AvatarUploadDialogProps) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async () => {
    if (!avatarUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter an image URL', variant: 'destructive' });
      return;
    }

    try {
      await updateProfile.mutateAsync({ avatarUrl });
      toast({ title: 'Avatar updated!', description: 'Your profile picture has been changed.' });
      onOpenChange(false);
      setAvatarUrl('');
      setPreviewUrl(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update avatar', variant: 'destructive' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be less than 2MB', variant: 'destructive' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Choose how you'd like to update your avatar. You can provide a URL or upload a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2" disabled>
              <Camera className="w-4 h-4" />
              Upload (Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Image URL</Label>
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a direct link to an image (JPG, PNG, GIF)
              </p>
            </div>

            {avatarUrl && (
              <div className="flex justify-center">
                <img 
                  src={avatarUrl} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <Button 
              onClick={handleUrlSubmit} 
              disabled={updateProfile.isPending || !avatarUrl.trim()}
              className="w-full"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save Avatar'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button
                    onClick={clearPreview}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Button className="w-full" disabled>
                  Upload (Coming Soon)
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select an image
                  </span>
                </div>
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
