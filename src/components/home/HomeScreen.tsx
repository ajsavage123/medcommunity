import { TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/rooms/RoomCard';
import { TrendingBanner } from '@/components/home/TrendingBanner';
import { useRooms } from '@/hooks/useRooms';
import { useProfile } from '@/hooks/useProfile';
import { Room } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { mockMessages, mockUsers } from '@/data/mockData';

interface HomeScreenProps {
  onRoomSelect: (room: Room) => void;
  onViewAllTrending: () => void;
  onViewAllRooms: () => void;
}

export function HomeScreen({ onRoomSelect, onViewAllTrending, onViewAllRooms }: HomeScreenProps) {
  const { data: rooms = [], isLoading } = useRooms();
  const { data: profile } = useProfile();
  const featuredRooms = rooms.slice(0, 3);
  const totalMessages = mockMessages.length;
  const totalUsers = mockUsers.length + 1; // including dev user

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">
              Welcome back, {profile?.name ? profile.name.split(' ')[0] : 'EMR'} 👋
            </h1>
            <p className="text-primary-foreground/80 text-sm font-medium">
              EMR COMMUNITY
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 text-primary-foreground border-0 hover:bg-white/30"
            onClick={onViewAllRooms}
          >
            Explore Rooms
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 text-primary-foreground border-0 hover:bg-white/30"
            onClick={onViewAllTrending}
          >
            View Trending
          </Button>
        </div>
      </section>

      {/* Trending Banner - Sliding carousel */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAllTrending} className="text-primary">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <TrendingBanner onMessageClick={() => onViewAllTrending()} />
      </section>

      {/* Active Rooms */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Popular Rooms</h2>
          <Button variant="ghost" size="sm" onClick={onViewAllRooms} className="text-primary">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={onRoomSelect} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Community Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{rooms.length}</p>
            <p className="text-xs text-muted-foreground">Rooms</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{totalMessages}</p>
            <p className="text-xs text-muted-foreground">Messages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
        </div>
      </section>
    </div>
  );
}
