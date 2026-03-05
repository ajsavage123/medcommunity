import { useState } from 'react';
import { Settings, LogOut, Bell, Shield, HelpCircle, ChevronRight, Bookmark, MessageSquare, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUserRoles, getExperienceYears } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { UserBadge } from './UserBadge';
import { AvatarUploadDialog } from './AvatarUploadDialog';
import { cn } from '@/lib/utils';
import { getClayAvatar } from '@/lib/avatars';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('Passionate about pre-hospital care and continuous learning. Let’s connect!');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out', description: 'See you next time!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' });
    }
  };

  const isLoading = profileLoading || rolesLoading;
  const experienceYears = profile?.experienceStartDate ? getExperienceYears(profile.experienceStartDate) : 0;

  const isVerified = roles.includes('verified');
  const isAdmin = roles.includes('admin');

  const menuItems = [
    { icon: Bookmark, label: 'Saved Posts' },
    { icon: MessageSquare, label: 'My Rooms' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & Safety' },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {isLoading ? (
          <>
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="relative mb-4">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200 shadow-inner">
                  <img
                    src={getClayAvatar(user?.id || 'guest', profile?.gender as any, profile?.name)}
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setShowAvatarUpload(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Camera className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-foreground">{profile?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>

            {/* User Badge */}
            <div className="mt-3">
              <UserBadge
                userType={profile?.userType || null}
                qualification={profile?.qualification || null}
                experienceYears={experienceYears}
              />
            </div>
            {/* allow user to reopen onboarding wizard to edit their answers */}
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => window.location.assign('/onboarding')}>
                Edit Profile
              </Button>
            </div>

            {/* Verification badges */}
            {(isVerified || isAdmin) && (
              <div className="flex gap-2 mt-2">
                {isVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    ✓ Verified
                  </span>
                )}
                {isAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    Admin
                  </span>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-2">
              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
            </p>

            {/* Editable Bio String */}
            <div className="mt-4 w-full text-center px-4">
              {isEditingBio ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full bg-muted/50 border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => setIsEditingBio(false)}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="group relative cursor-pointer" onClick={() => setIsEditingBio(true)}>
                  <p className="text-sm text-foreground/90 italic">"{bio}"</p>
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to edit bio
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <p className="text-lg font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">Posts</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <p className="text-lg font-bold text-foreground">142</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <p className="text-lg font-bold text-foreground">5</p>
          <p className="text-xs text-muted-foreground">Rooms</p>
        </div>
      </div>

      {/* Verification CTA - only for non-verified employees */}
      {profile?.userType === 'employee' && !isVerified && (
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Get Verified</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Verify your credentials to unlock more features and build trust.
              </p>
              <Button size="sm" className="mt-3">
                Start Verification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
          >
            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="flex-1 text-left text-foreground">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        MedicConnect v1.0.0
      </p>

      {/* Avatar Upload Dialog */}
      <AvatarUploadDialog
        open={showAvatarUpload}
        onOpenChange={setShowAvatarUpload}
      />
    </div>
  );
}
