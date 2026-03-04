import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

export interface BadgeInfo {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export function getBadgeInfo(
  userType: UserType | null,
  qualification: QualificationType | null,
  experienceYears?: number
): BadgeInfo | null {
  if (!userType) return null;

  const exp = experienceYears || 0;
  const expLabel = exp > 0 ? ` • ${exp}y` : '';

  switch (userType) {
    case 'student':
      return {
        label: `Student${expLabel}`,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: '🎓',
        description: 'Currently pursuing EMS education',
      };

    case 'intern':
      return {
        label: `Intern${expLabel}`,
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: '📋',
        description: 'Currently doing clinical rotations/internship',
      };

    case 'employee':
      if (qualification === 'bsc_emt') {
        return {
          label: `Paramedic${expLabel}`,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: '🚑',
          description: 'B.Sc Emergency Medicine Technology',
        };
      } else if (qualification === 'pg_diploma') {
        return {
          label: `AEMT${expLabel}`,
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: '⭐',
          description: 'Advanced Emergency Medical Technician',
        };
      } else if (qualification === 'diploma_emt') {
        return {
          label: `EMT${expLabel}`,
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: '🏥',
          description: 'Emergency Medical Technician',
        };
      }
      return {
        label: `Professional${expLabel}`,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: '👨‍💼',
        description: 'EMS Professional',
      };

    case 'instructor':
      return {
        label: 'Instructor',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: '👨‍🏫',
        description: 'Certified Instructor/Trainer',
      };

    case 'faculty':
      return {
        label: 'Faculty',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: '🎓',
        description: 'Faculty/Lecturer in EMS Program',
      };

    case 'hr':
      return {
        label: 'HR Manager',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        icon: '👥',
        description: 'Human Resources Manager',
      };

    case 'international_coordinator':
      return {
        label: 'Global Coordinator',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: '🌍',
        description: 'International Opportunities Coordinator',
      };

    default:
      return null;
  }
}

export function getBadgeColor(userType: UserType | null): string {
  const badge = getBadgeInfo(userType, null, 0);
  return badge?.color || 'bg-gray-100 text-gray-700';
}
