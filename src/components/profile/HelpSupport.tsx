import { ArrowLeft, HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp, Search, BookOpen, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HelpSupportProps {
  onBack: () => void;
}

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
    questions: [
      {
        q: 'How do I join a room?',
        a: 'Tap the Rooms tab in the bottom navigation. All rooms are open to join — simply tap any room card to enter it and start reading or posting.',
      },
      {
        q: 'How do I get verified?',
        a: 'Go to your Profile tab. If you are a healthcare employee, you\'ll see a "Get Verified" card. Tap it and submit your credentials for review by our admin team.',
      },
      {
        q: 'Can I edit my profile after onboarding?',
        a: 'Yes! On your Profile page, tap the "Edit Profile" button to reopen the onboarding wizard and update any of your details.',
      },
    ],
  },
  {
    category: 'Rooms & Messaging',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-500/10',
    questions: [
      {
        q: 'How do I mention someone in a chat?',
        a: 'Type @ followed by their name while composing a message. A dropdown will appear showing matching members — tap a name to tag them. They will receive a mention notification.',
      },
      {
        q: 'Can I post anonymously?',
        a: 'Yes, in rooms that support it (like the Salary Room). Toggle the "Anonymous" option before sending your message. Your name and avatar will be hidden from other members.',
      },
      {
        q: 'How do I reply to a message?',
        a: 'Long-press (or swipe) any message to see the reply option. Your reply will be threaded to the original message.',
      },
      {
        q: 'Why can\'t I delete a message?',
        a: 'You can delete any message you sent. Long-press the message and select "Delete". Admins can also remove any message that violates community guidelines.',
      },
    ],
  },
  {
    category: 'Notifications',
    icon: Shield,
    color: 'text-purple-500 bg-purple-500/10',
    questions: [
      {
        q: 'Why am I not getting notifications?',
        a: 'Make sure notifications are enabled for this app in your device settings. Also check the Notifications page inside the app to ensure you haven\'t missed any.',
      },
      {
        q: 'What kinds of notifications will I get?',
        a: 'You\'ll be notified for: @mentions, replies to your posts, likes, new job posts matching your profile, and trending community discussions.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10',
    questions: [
      {
        q: 'How do I change my password?',
        a: 'On the Login screen, tap "Forgot Password" and enter your email. You\'ll receive a reset link. Currently, password changes from within the app are coming soon.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Account deletion is currently handled manually. Email us at support@emrcommunity.app with your registered email and we\'ll process it within 48 hours.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'border border-border rounded-xl overflow-hidden transition-all cursor-pointer',
        open && 'border-primary/30'
      )}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug">{q}</p>
          {open && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a}</p>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
      </div>
    </div>
  );
}

export function HelpSupport({ onBack }: HelpSupportProps) {
  const [search, setSearch] = useState('');

  const allQs = faqs.flatMap(f => f.questions.map(q => ({ ...q, category: f.category })));
  const filtered = search.trim()
    ? allQs.filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Help & Support</h1>
          <p className="text-xs text-muted-foreground">We're here to help</p>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground mb-1">How can we help?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse frequently asked questions below or contact our support team directly.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Search results */}
        {filtered !== null ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No results found. Try different keywords.
              </p>
            ) : (
              filtered.map((q, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">{q.category}</p>
                  <FAQItem q={q.q} a={q.a} />
                </div>
              ))
            )}
          </div>
        ) : (
          /* FAQ sections */
          <div className="space-y-6">
            {faqs.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', section.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{section.category}</h3>
                  </div>
                  <div className="space-y-2">
                    {section.questions.map((q, j) => <FAQItem key={j} q={q.q} a={q.a} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact options */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Still need help?</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="mailto:support@emrcommunity.app"
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">Email Support</p>
              <p className="text-[10px] text-muted-foreground text-center">support@emrcommunity.app</p>
            </a>
            <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs font-semibold text-foreground">Community Docs</p>
              <p className="text-[10px] text-muted-foreground text-center">Coming soon</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Response time: within 24 hours</p>
        </div>
      </div>
    </div>
  );
}
