import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Globe, 
  Award, 
  BookOpen 
} from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];

interface RoleSelectionProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

const roles: { type: UserType; label: string; description: string; hint: string; icon: React.ElementType }[] = [
  {
    type: 'student',
    label: 'Student',
    description: 'Currently studying or interning in EMS',
    hint: 'Learn, grow, and connect with fellow healthcare professionals',
    icon: GraduationCap,
  },
  {
    type: 'employee',
    label: 'Employee',
    description: 'Working as EMT or Paramedic',
    hint: 'Share expertise, network, and access career resources',
    icon: Briefcase,
  },
  {
    type: 'hr',
    label: 'HR Manager',
    description: 'Recruiting & managing EMS professionals',
    hint: 'Post jobs, manage team, and find top talent in emergency medicine',
    icon: Users,
  },
  {
    type: 'international_coordinator',
    label: 'International Opportunities',
    description: 'Bring abroad opportunities to EMS professionals',
    hint: 'Connect professionals with global career opportunities and international assignments',
    icon: Globe,
  },
  {
    type: 'instructor',
    label: 'Instructor / Trainer',
    description: 'Provide certifications and training programs',
    hint: 'Offer ACLS, BLS, PALS, PTLS certifications and professional development courses',
    icon: Award,
  },
  {
    type: 'faculty',
    label: 'Faculty / Lecturer',
    description: 'Teach in paramedic or EMS programs',
    hint: 'Educate the next generation of emergency medical professionals',
    icon: BookOpen,
  },
];

export function RoleSelection({ data, setData }: RoleSelectionProps) {
  const handleSelect = (type: UserType) => {
    setData(prev => ({ 
      ...prev, 
      userType: type,
      // Reset employee/student specific fields when changing role
      sector: null,
      qualification: null,
      salary: null,
      experienceYears: 0,
      isIntern: false,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Who are you?</h1>
        <p className="text-muted-foreground mt-2">
          Select the role that best describes you
        </p>
      </div>

      <div className="grid gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.userType === role.type;
          
          return (
            <button
              key={role.type}
              onClick={() => handleSelect(role.type)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left',
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-semibold',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {role.label}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {role.description}
                </p>
                {isSelected && (
                  <p className="text-xs text-primary mt-2 font-medium">
                    💡 {role.hint}
                  </p>
                )}
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
                isSelected 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground'
              )}>
                {isSelected && (
                  <svg className="w-full h-full text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
