import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, PlusCircle, X,
  ChevronDown, IndianRupee, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalaryData, useSubmitSalaryData } from '@/hooks/useSalaryData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DesignationType = Database['public']['Enums']['designation_type'];
type SectorType = Database['public']['Enums']['sector_type'];
type FilterRole = 'all' | 'emt' | 'paramedic';
type FilterSector = 'all' | 'private' | 'government' | 'ngo';

interface SalaryInsightsProps {
  userDesignation?: DesignationType | null;
  userSector?: SectorType | null;
  userExperienceYears?: number;
}

const formatSalary = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}k`;
};

const ROLE_BADGES: Record<string, string> = {
  emt: 'bg-blue-100 text-blue-700',
  paramedic: 'bg-purple-100 text-purple-700',
};
const SECTOR_BADGES: Record<string, string> = {
  private: 'bg-orange-100 text-orange-700',
  government: 'bg-green-100 text-green-700',
  ngo: 'bg-pink-100 text-pink-700',
};

function SubmitModal({ onClose }: { onClose: () => void }) {
  const submitSalary = useSubmitSalaryData();
  const [form, setForm] = useState({
    role: '' as 'emt' | 'paramedic' | '',
    sector: '' as 'private' | 'government' | 'ngo' | '',
    location: '',
    experienceYears: 0,
    salary: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const isValid = form.role && form.sector && form.location.trim() && form.salary;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await submitSalary.mutateAsync({
        role: form.role as 'emt' | 'paramedic',
        sector: form.sector as 'private' | 'government' | 'ngo',
        location: form.location,
        experienceYears: form.experienceYears,
        salary: parseInt(form.salary),
        currency: 'INR',
        workingHours: 12,
      });
      setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to submit', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Share Your Salary</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">Thank you! 🙏</p>
              <p className="text-sm text-muted-foreground mt-1">Your salary data has been added anonymously and helps others understand market rates.</p>
            </div>
            <Button onClick={onClose} className="w-full mt-2">Done</Button>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
              🔒 <strong>100% anonymous.</strong> No personal info is stored. Only aggregated data is shown.
            </p>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Your Role *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['emt', 'paramedic'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={cn(
                      'p-3 rounded-xl border-2 text-sm font-medium transition-all',
                      form.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/40'
                    )}
                  >
                    {r === 'emt' ? 'EMT' : 'Paramedic'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Sector *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['private', 'government', 'ngo'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(f => ({ ...f, sector: s }))}
                    className={cn(
                      'p-3 rounded-xl border-2 text-xs font-medium transition-all capitalize',
                      form.sector === s ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/40'
                    )}
                  >
                    {s === 'ngo' ? 'NGO' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">City / Location *</label>
              <input
                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Years of Experience</label>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 5, 8, 10].map(y => (
                  <button
                    key={y}
                    onClick={() => setForm(f => ({ ...f, experienceYears: y }))}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                      form.experienceYears === y ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/40'
                    )}
                  >
                    {y === 0 ? 'Fresh' : y === 10 ? '10+' : `${y} yr`}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Monthly Salary (₹) *</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors [appearance:textfield]"
                  placeholder="e.g., 25000"
                  min={0}
                  max={1000000}
                  value={form.salary}
                  onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!isValid || submitSalary.isPending}
            >
              {submitSalary.isPending ? 'Submitting…' : 'Submit Anonymously'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SalaryInsights({ 
  userDesignation, 
  userSector, 
  userExperienceYears 
}: SalaryInsightsProps) {
  const [roleFilter, setRoleFilter] = useState<FilterRole>(
    userDesignation && (userDesignation === 'emt' || userDesignation === 'paramedic') 
      ? (userDesignation as FilterRole) 
      : 'all'
  );
  const [sectorFilter, setSectorFilter] = useState<FilterSector>(
    userSector && (userSector === 'private' || userSector === 'government' || userSector === 'ngo') 
      ? (userSector as FilterSector) 
      : 'all'
  );
  const [showSubmit, setShowSubmit] = useState(false);
  const { data: salaryData = [], isLoading, isError, error } = useSalaryData();

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="font-semibold">Failed to load salary data.</p>
        <p className="text-sm">{(error as any)?.message || 'Please try again later.'}</p>
      </div>
    );
  }

  // deduplicate by userId, keep most recent post per user
  const dedupedData = salaryData.reduce<SalaryPost[]>((acc, item) => {
    const existingIndex = acc.findIndex(a => a.userId === item.userId);
    if (existingIndex === -1) {
      acc.push(item);
    } else {
      // replace if this item is newer
      if (item.createdAt.getTime() > acc[existingIndex].createdAt.getTime()) {
        acc[existingIndex] = item;
      }
    }
    return acc;
  }, []);

  const filteredData = dedupedData.filter(s => {
    if (roleFilter !== 'all' && s.role !== roleFilter) return false;
    if (sectorFilter !== 'all' && s.sector !== sectorFilter) return false;
    return true;
  });

  const avgSalary = filteredData.length > 0
    ? Math.round(filteredData.reduce((acc, s) => acc + s.salary, 0) / filteredData.length)
    : 0;
  const minSalary = filteredData.length > 0 ? Math.min(...filteredData.map(s => s.salary)) : 0;
  const maxSalary = filteredData.length > 0 ? Math.max(...filteredData.map(s => s.salary)) : 0;

  const expGroups = [
    { label: '0-2 yrs', range: [0, 2] },
    { label: '3-5 yrs', range: [3, 5] },
    { label: '6-10 yrs', range: [6, 10] },
    { label: '10+ yrs', range: [11, 100] },
  ];

  const expData = expGroups.map(group => {
    const gs = filteredData.filter(s => s.experienceYears >= group.range[0] && s.experienceYears <= group.range[1]);
    const avg = gs.length > 0 ? Math.round(gs.reduce((acc, s) => acc + s.salary, 0) / gs.length) : 0;
    return { ...group, avg, count: gs.length };
  });
  const maxAvg = Math.max(...expData.map(d => d.avg), 1);

  // Sector breakdown
  const sectorBreakdown = ['private', 'government', 'ngo'].map(sec => {
    const group = filteredData.filter(s => s.sector === sec);
    const avg = group.length > 0 ? Math.round(group.reduce((a, s) => a + s.salary, 0) / group.length) : 0;
    return { sector: sec, avg, count: group.length };
  }).filter(s => s.count > 0);
  const maxSec = Math.max(...sectorBreakdown.map(s => s.avg), 1);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // show full empty state when there is absolutely no data
  if (!isLoading && dedupedData.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-lg font-semibold text-foreground">No salary data yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share anonymously.</p>
        <Button onClick={() => setShowSubmit(true)} className="mt-4">
          Share Mine
        </Button>
      </div>
    );
  }

  return (
    <>
      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} />}

      <div className="p-4 space-y-5 animate-fade-in pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Salary Insights</h2>
              <p className="text-xs text-muted-foreground">Anonymous community data</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowSubmit(true)}
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Share Mine
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Role</label>
            <div className="flex gap-2">
              {(['all', 'emt', 'paramedic'] as FilterRole[]).map(role => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                  className="flex-1"
                >
                  {role === 'all' ? 'All' : role.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Sector</label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'private', 'government', 'ngo'] as FilterSector[]).map(sector => (
                <Button
                  key={sector}
                  variant={sectorFilter === sector ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setSectorFilter(sector)}
                  className="flex-1 min-w-[70px]"
                >
                  {sector === 'all' ? 'All' : sector === 'ngo' ? 'NGO' : sector.charAt(0).toUpperCase() + sector.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Average', value: formatSalary(avgSalary), color: 'text-primary' },
            { label: 'Min', value: formatSalary(minSalary), color: 'text-foreground' },
            { label: 'Max', value: formatSalary(maxSalary), color: 'text-success' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Experience chart */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Salary by Experience
          </h3>
          <div className="space-y-4">
            {expData.map((group) => (
              <div key={group.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{group.label}</span>
                  <span className="font-semibold text-foreground">
                    {group.avg > 0 ? formatSalary(group.avg) : '—'}
                    {group.count > 0 && <span className="text-xs text-muted-foreground font-normal ml-1">({group.count})</span>}
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                    style={{ width: `${group.avg > 0 ? (group.avg / maxAvg) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector chart */}
        {sectorBreakdown.length > 0 && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Salary by Sector
            </h3>
            <div className="space-y-4">
              {sectorBreakdown.map(item => (
                <div key={item.sector}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={cn('text-xs font-semibold rounded-full px-2 py-0.5', SECTOR_BADGES[item.sector])}>
                      {item.sector === 'ngo' ? 'NGO' : item.sector.charAt(0).toUpperCase() + item.sector.slice(1)}
                    </span>
                    <span className="font-semibold text-foreground">{formatSalary(item.avg)}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-700"
                      style={{ width: `${(item.avg / maxSec) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Recent Submissions
            <span className="ml-auto text-xs font-normal text-muted-foreground">{filteredData.length} entries</span>
          </h3>
          {filteredData.slice(0, 8).map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <div className={cn('text-[10px] font-bold rounded-full px-2 py-0.5', ROLE_BADGES[s.role])}>
                {s.role.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium truncate">{s.location}</p>
                <p className="text-[11px] text-muted-foreground">
                  {s.experienceYears === 0 ? 'Fresh' : `${s.experienceYears} yr`} · {s.sector.charAt(0).toUpperCase() + s.sector.slice(1)}
                </p>
              </div>
              <p className="text-sm font-bold text-primary shrink-0">{formatSalary(s.salary)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No data for this filter. Be the first to share!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
