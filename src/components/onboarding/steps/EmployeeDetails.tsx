import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Building2, GraduationCap, Clock, IndianRupee } from 'lucide-react';
import type { OnboardingData } from '../OnboardingWizard';
import type { Database } from '@/integrations/supabase/types';

type SectorType = Database['public']['Enums']['sector_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];

interface EmployeeDetailsProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

const experienceOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function EmployeeDetails({ data, setData }: EmployeeDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Tell us about your work</h1>
        <p className="text-muted-foreground mt-2">
          This helps us personalize your experience
        </p>
      </div>

      {/* Sector Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="w-4 h-4 text-primary" />
          Which sector do you work in?
        </Label>
        <RadioGroup
          value={data.sector || ''}
          onValueChange={(value: SectorType) => setData(prev => ({ ...prev, sector: value }))}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { value: 'private' as SectorType, label: 'Private' },
            { value: 'government' as SectorType, label: 'Government' },
          ].map((option) => (
            <Label
              key={option.value}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                data.sector === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <span className={cn(
                'font-medium',
                data.sector === option.value ? 'text-primary' : 'text-foreground'
              )}>
                {option.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Experience Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-primary" />
          Years of experience
        </Label>
        <div className="flex flex-wrap gap-2">
          {experienceOptions.map((years) => (
            <button
              key={years}
              type="button"
              onClick={() => setData(prev => ({ ...prev, experienceYears: years }))}
              className={cn(
                'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                data.experienceYears === years
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {years === 0 ? 'Fresh' : years === 10 ? '10+' : `${years} yr${years > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Qualification Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <GraduationCap className="w-4 h-4 text-primary" />
          What's your qualification?
        </Label>
        <RadioGroup
          value={data.qualification || ''}
          onValueChange={(value: QualificationType) => setData(prev => ({ ...prev, qualification: value }))}
          className="space-y-2"
        >
          {[
            { value: 'diploma_emt' as QualificationType, label: 'Diploma in EMT' },
            { value: 'pg_diploma' as QualificationType, label: 'PG Diploma in Emergency Care' },
            { value: 'bsc_emt' as QualificationType, label: 'B.Sc Emergency Medicine Technology' },
          ].map((option) => (
            <Label
              key={option.value}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                data.qualification === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={option.value} />
              <span className={cn(
                'font-medium',
                data.qualification === option.value ? 'text-primary' : 'text-foreground'
              )}>
                {option.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Salary Input */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <IndianRupee className="w-4 h-4 text-primary" />
          Monthly salary (helps salary insights)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
          <Input
            type="number"
            placeholder="e.g., 25000"
            value={data.salary || ''}
            onChange={(e) => setData(prev => ({ 
              ...prev, 
              salary: e.target.value ? parseInt(e.target.value) : null 
            }))}
            className="pl-8"
            min={0}
            max={500000}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This is anonymous and helps others understand market rates
        </p>
      </div>
    </div>
  );
}
