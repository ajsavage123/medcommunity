import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateOnboardingProfile } from '@/hooks/useOnboarding';
import { useSubmitSalaryData } from '@/hooks/useSalaryData';
import { useProfile, getExperienceYears } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RoleSelection } from './steps/RoleSelection';
import { EmployeeDetails } from './steps/EmployeeDetails';
import { StudentDetails } from './steps/StudentDetails';
import { NameInput } from './steps/NameInput';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { getClayAvatar } from '@/lib/avatars';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type QualificationType = Database['public']['Enums']['qualification_type'];
type SectorType = Database['public']['Enums']['sector_type'];

export interface OnboardingData {
  name: string;
  gender: 'male' | 'female' | 'other' | null;
  userType: UserType | null;
  isIntern: boolean;
  sector: SectorType | null;
  experienceYears: number;
  qualification: QualificationType | null;
  salary: number | null;
}

const STEP_LABELS = ['Name & Gender', 'Your Role', 'Details'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateOnboardingProfile();
  const { data: profileData } = useProfile();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    gender: null,
    userType: null,
    isIntern: false,
    sector: null,
    experienceYears: 0,
    qualification: null,
    salary: null,
  });

  // add gender selection as part of name step (step 0); count doesn't change
  const totalSteps = data.userType === 'employee' || data.userType === 'student' ? 3 : 2;

  // if the profile has been completed previously we treat this as an edit flow
  const isEdit = !!profileData?.onboardingCompleted;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.name.trim().length >= 2 && data.gender !== null;
      case 1:
        return data.userType !== null;
      case 2:
        if (data.userType === 'employee') {
          return data.sector && data.qualification && data.salary !== null;
        }
        if (data.userType === 'student') {
          return true; // isIntern is already set
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateExperienceStartDate = (years: number): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date.toISOString().split('T')[0];
  };

  const submitSalary = useSubmitSalaryData();

  // if profile already exists we want to pre‑populate the wizard (allows editing later)
  useEffect(() => {
    if (!profileData) return;

    // update form fields from profile; this will run on initial load and
    // also if the user edits their profile via the wizard again
    setData(prev => ({
      name: profileData.name || prev.name,
      gender: (profileData.gender as any) ?? prev.gender,
      userType: profileData.userType,
      // intern is a derivation of userType
      isIntern: profileData.userType === 'intern',
      sector: profileData.sector || prev.sector,
      experienceYears: profileData.experienceStartDate
        ? getExperienceYears(profileData.experienceStartDate)
        : prev.experienceYears,
      qualification: profileData.qualification || prev.qualification,
      salary: profileData.salary ?? prev.salary,
    }));
  }, [profileData]);

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Determine final user type (handle intern case)
      let finalUserType = data.userType;
      if (data.userType === 'student' && data.isIntern) {
        finalUserType = 'intern';
      }

      const genderForAvatar: 'male' | 'female' | undefined = 
        data.gender === 'other' ? undefined : (data.gender as 'male' | 'female');
      const avatarUrl = user
        ? getClayAvatar(user.id, genderForAvatar, data.name)
        : null;

      await updateProfile.mutateAsync({
        name: data.name,
        gender: data.gender,
        avatar_url: avatarUrl,
        userType: finalUserType,
        sector: data.userType === 'employee' ? data.sector : null,
        qualification: data.userType === 'employee' ? data.qualification : null,
        salary: data.userType === 'employee' ? data.salary : null,
        experienceStartDate: data.userType === 'employee' 
          ? calculateExperienceStartDate(data.experienceYears) 
          : null,
      });

      // optionally push salary post if user provided salary and employee
      if (data.userType === 'employee' && data.salary != null) {
        try {
          // only post if none exists for this user already
          const { data: existing, error: fetchErr } = await supabase
            .from('salary_posts')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (!fetchErr && !existing) {
            await submitSalary.mutateAsync({
              role: 'emt', // default until we add explicit role step
              sector: data.sector || 'private',
              location: '',
              experienceYears: data.experienceYears,
              salary: data.salary,
              currency: 'INR',
              workingHours: 12,
            });
          }
        } catch (err) {
          // non-critical, just log
          console.warn('Failed to auto-submit salary post:', err);
        }
      }

      toast({ title: 'Welcome!', description: 'Your profile is all set up.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <NameInput data={data} setData={setData} />;
      case 1:
        return <RoleSelection data={data} setData={setData} />;
      case 2:
        if (data.userType === 'employee') {
          return <EmployeeDetails data={data} setData={setData} />;
        }
        if (data.userType === 'student') {
          return <StudentDetails data={data} setData={setData} />;
        }
        return null;
      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps - 1;
  const showDetailsStep = data.userType === 'employee' || data.userType === 'student';

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-border">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-foreground">
              {STEP_LABELS[step] || (isEdit ? 'Update' : 'Complete')}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-10 bg-background p-4 border-t border-border">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {isLastStep ? (
            <Button 
              onClick={handleComplete}
              disabled={!canProceed() || updateProfile.isPending}
              className="flex-1"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isEdit ? 'Save Changes' : 'Complete Setup'}
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
