import { ArrowLeft, Shield, Eye, Lock, UserX, Bell, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PrivacySafetyProps {
  onBack: () => void;
}

const sections = [
  {
    icon: Eye,
    color: 'text-blue-500 bg-blue-500/10',
    title: 'What Data We Collect',
    content: `We collect only what's necessary to provide you the best experience:
    
• **Account info**: Your name, email, and profile picture.
• **Profile details**: Your role, qualification, sector, and experience — used to personalise your feed and verify credentials.
• **Messages**: Content you post in rooms, stored securely in our database.
• **Usage data**: Which rooms you visit and features you use, to improve the app.

We do NOT collect your location, contacts, or any sensitive personal health records.`,
  },
  {
    icon: Lock,
    color: 'text-emerald-500 bg-emerald-500/10',
    title: 'How We Protect Your Data',
    content: `Your security is our top priority:

• All data is encrypted in transit using TLS 1.3.
• Passwords are hashed — we never store them in plain text.
• Your database is hosted on Supabase with row-level security (RLS), meaning each user can only access their own data.
• We never sell your personal data to third parties.`,
  },
  {
    icon: UserX,
    color: 'text-orange-500 bg-orange-500/10',
    title: 'Anonymous Posting',
    content: `In select rooms (e.g., the Salary Room), you can post anonymously:

• Your name and avatar are hidden from other members.
• Even in anonymous mode, your content is still stored against your account internally for moderation.
• Admins can review anonymous posts in cases of reported abuse.`,
  },
  {
    icon: Bell,
    color: 'text-purple-500 bg-purple-500/10',
    title: 'Notifications & Communications',
    content: `We send you notifications for:

• Mentions (@yourname) in chat rooms.
• Replies to your posts.
• Job alerts relevant to your profile.
• Platform updates and announcements.

You can turn off any of these from your device notification settings.`,
  },
  {
    icon: Database,
    color: 'text-primary bg-primary/10',
    title: 'Data Retention & Deletion',
    content: `You are in control of your data:

• You can delete your account at any time from the Profile settings.
• On deletion, your messages become anonymous and your personal profile is removed within 30 days.
• Backup copies may be retained for up to 90 days for legal compliance.

To request full data deletion, contact us at privacy@emrcommunity.app.`,
  },
];

function AccordionItem({ section, defaultOpen = false }: { section: typeof sections[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden transition-all', open && 'border-primary/30')}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', section.color)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">{section.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </div>
      )}
    </div>
  );
}

export function PrivacySafety({ onBack }: PrivacySafetyProps) {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Privacy & Safety</h1>
          <p className="text-xs text-muted-foreground">Last updated March 2025</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground mb-1">Your Privacy Matters</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EMR Community is built for healthcare professionals. We handle your data with the same care you bring to patient safety.
            </p>
          </div>
        </div>

        {/* Policy accordion */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <AccordionItem key={i} section={section} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Contact */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Questions? Reach us at{' '}
            <a href="mailto:privacy@emrcommunity.app" className="text-primary underline underline-offset-2">
              privacy@emrcommunity.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
