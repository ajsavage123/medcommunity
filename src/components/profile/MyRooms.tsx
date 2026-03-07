import { ArrowLeft, Rocket, Clock, Star, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MyRoomsProps {
  onBack: () => void;
}

const upcomingFeatures = [
  { icon: Star, title: 'Favourite Rooms', desc: 'Pin your most-visited rooms for quick access.' },
  { icon: Users, title: 'Room Members', desc: 'See who else is active in your rooms.' },
  { icon: Bell, title: 'Room Alerts', desc: 'Get notified when new posts hit your rooms.' },
];

export function MyRooms({ onBack }: MyRoomsProps) {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">My Rooms</h1>
      </div>

      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
        {/* Animated rocket */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
          </div>
          {/* Orbiting dot */}
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-accent animate-bounce" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>

        <h2 className="text-2xl font-bold text-foreground mb-3">Your Personal Rooms Hub</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
          We're building a dedicated space where you can manage all the rooms you've joined, 
          favourite your top communities, and control your alerts — all in one place.
        </p>

        {/* Upcoming feature cards */}
        <div className="w-full space-y-3 mb-8">
          {upcomingFeatures.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={onBack} className="w-full max-w-xs">
          Back to Profile
        </Button>
      </div>
    </div>
  );
}
