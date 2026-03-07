import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreVertical, Briefcase as BriefcaseIcon, GraduationCap as GradIcon } from 'lucide-react';
import { getBadgeInfo } from '@/lib/badges';
import { getClayAvatar } from '@/lib/avatars';

interface UserProfileDrawerProps {
  user: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({ user, isOpen, onOpenChange }: UserProfileDrawerProps) {
  if (!user) return null;
  const badgeInfo = getBadgeInfo(user.userType, user.qualification, user.experienceYears);
  const avatarUrl = user.avatar || getClayAvatar(user.id || user.userId || 'guest', user.gender, user.name);
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 h-[80vh] border-none bg-background shadow-2xl z-[500]">
        <SheetHeader className="sr-only">
          <SheetTitle>{user.name || 'User'} Profile</SheetTitle>
          <SheetDescription>Professional details and contact options for {user.name || 'this member'}.</SheetDescription>
        </SheetHeader>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-50 z-50" />
        
        <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        </div>

        <div className="px-6 -mt-20 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-40 transition" />
            <div className="relative w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl border border-white/50">
              <Avatar className="w-full h-full rounded-2xl">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-black text-foreground tracking-tight">{user.name || 'Anonymous User'}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              {badgeInfo && (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {badgeInfo.label}
                </span>
              )}
              {user.experienceYears > 0 && (
                <span className="text-xs text-muted-foreground font-medium">• {user.experienceYears} Years Experience</span>
              )}
            </div>
          </div>

          <div className="w-full mt-8 space-y-4 px-2">
            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4 border border-border/50 transition-all hover:bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Role</p>
                <p className="text-sm font-semibold text-foreground">{(user.userType || 'Professional').replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4 border border-border/50 transition-all hover:bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                <GradIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Qualification</p>
                <p className="text-sm font-semibold text-foreground">{(user.qualification || 'Verified Member').replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Message Directly
              </button>
              <button className="w-14 h-14 bg-muted flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted/80 active:scale-90 transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
