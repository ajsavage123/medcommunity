import { cn } from '@/lib/utils';
import { getBadgeInfo } from '@/lib/badges';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export function formatBadgeWithExperience(
  userType: UserType | null,
  qualification: QualificationType | null,
  experienceYears: number = 0
): string | null {
  const badgeInfo = getBadgeInfo(userType, qualification, experienceYears);
  return badgeInfo ? badgeInfo.label : null;
}

interface UserBadgeProps {
  userType: UserType | null;
  qualification: QualificationType | null;
  experienceYears?: number;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  showDescription?: boolean;
}

export function UserBadge({ 
  userType, 
  qualification, 
  experienceYears = 0, 
  className, 
  showIcon = true,
  compact = false,
  showDescription = false
}: UserBadgeProps) {
  const badgeInfo = getBadgeInfo(userType, qualification, experienceYears);

  if (!badgeInfo) {
    return null;
  }

  if (compact) {
    return (
      <span className={cn(
        'text-xs text-muted-foreground',
        className
      )}>
        ({badgeInfo.label})
      </span>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2',
      className
    )}>
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
        badgeInfo.color
      )}>
        {showIcon && <span>{badgeInfo.icon}</span>}
        <span>{badgeInfo.label}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-muted-foreground">
          {badgeInfo.description}
        </p>
      )}
    </div>
  );
}