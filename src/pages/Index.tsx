import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomeScreen } from '@/components/home/HomeScreen';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RedditChat } from '@/components/rooms/RedditChat';
import { WhatsAppChat } from '@/components/rooms/WhatsAppChat';
import { QAForumChat } from '@/components/rooms/QAForumChat';
import { LibraryRoom } from '@/components/rooms/LibraryRoom';
import { JobBoard } from '@/components/rooms/JobBoard';
import { RoomTopicList } from '@/components/rooms/RoomTopicList';
import { TrendingPage } from '@/components/trending/TrendingPage';
import { ToolCard } from '@/components/tools/ToolCard';
import { SalaryInsights } from '@/components/tools/SalaryInsights';
import { UserProfile } from '@/components/profile/UserProfile';
import { useRooms } from '@/hooks/useRooms';
import { useTools } from '@/hooks/useTools';
import { useProfile, getExperienceYears } from '@/hooks/useProfile';
import { Room, Tool } from '@/types';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

type Screen = 'main' | 'room-chat' | 'salary-insights';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: tools = [], isLoading: toolsLoading } = useTools();
  const { data: profile } = useProfile();

  // Handle Mobile Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we go back and the state is empty, reset to main screen
      if (currentScreen !== 'main') {
        setCurrentScreen('main');
        setSelectedRoom(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCurrentScreen('room-chat');
    // Push state so back button works
    window.history.pushState({ screen: 'room-chat' }, '');
  };

  const handleBackFromChat = () => {
    if (currentScreen !== 'main') {
      window.history.back(); // This will trigger popstate listener
    }
  };

  const handleToolClick = (tool: Tool) => {
    if (tool.type === 'internal' && tool.category === 'salary') {
      setCurrentScreen('salary-insights');
      window.history.pushState({ screen: 'salary' }, '');
    } else if (tool.url) {
      window.open(tool.url, '_blank');
    }
  };

  const handleBackFromSalary = () => {
    if (currentScreen !== 'main') {
      window.history.back();
    }
  };

  const renderContent = () => {
    // Handle sub-screens first — route each room type to its chat format
    if (currentScreen === 'room-chat' && selectedRoom) {
      // Salary → Reddit anonymous voting board
      if (selectedRoom.type === 'salary') {
        return <RedditChat room={selectedRoom} onBack={handleBackFromChat} />;
      }
      // Leadership & Rights → Q&A Forum (raise complaints, discuss)
      if (selectedRoom.type === 'library') {
        return <LibraryRoom room={selectedRoom} onBack={handleBackFromChat} />;
      }
      if (selectedRoom.type === 'leadership') {
        return <QAForumChat room={selectedRoom} onBack={handleBackFromChat} />;
      }
      // Career → Structured Job Board
      if (selectedRoom.type === 'career') {
        return <JobBoard room={selectedRoom} onBack={handleBackFromChat} />;
      }
      // All others (General, Students, Certifications, Entrepreneurship, etc.) → WhatsApp Chat
      return <WhatsAppChat room={selectedRoom} onBack={handleBackFromChat} />;
    }

    if (currentScreen === 'salary-insights') {
      return (
        <div>
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Button variant="ghost" size="icon-sm" onClick={handleBackFromSalary}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Salary Insights</h1>
          </div>
          <SalaryInsights 
            userDesignation={profile?.designation} 
            userSector={profile?.sector}
            userExperienceYears={profile?.experienceStartDate ? getExperienceYears(profile.experienceStartDate) : undefined}
          />
        </div>
      );
    }

    // Main tab content
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onRoomSelect={handleRoomSelect}
            onViewAllTrending={() => setActiveTab('trending')}
            onViewAllRooms={() => setActiveTab('rooms')}
            onJobsClick={() => {
              const careerRoom = rooms.find(r => r.type === 'career');
              if (careerRoom) handleRoomSelect(careerRoom);
            }}
          />
        );

      case 'rooms': {
        const ROOM_CATEGORIES: { title: string; types: string[] }[] = [
          { title: '💬 Community', types: ['general', 'salary'] },
          { title: '🏆 Career & Growth', types: ['career', 'leadership', 'entrepreneurship'] },
          { title: '📚 Study & Resources', types: ['certifications', 'students', 'library'] },
        ];
        return (
          <div className="p-4 pb-24 space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">All Rooms</h2>
            {roomsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : (
              ROOM_CATEGORIES.map(cat => {
                const catRooms = rooms.filter(r => cat.types.includes(r.type));
                if (catRooms.length === 0) return null;
                return (
                  <div key={cat.title} className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">{cat.title}</h3>
                    {catRooms.map(room => (
                      <RoomCard key={room.id} room={room} onClick={handleRoomSelect} />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        );
      }

      case 'trending':
        return <TrendingPage onNavigateToRoom={(roomName) => {
          const roomToJoin = rooms.find(r => r.name === roomName);
          if (roomToJoin) handleRoomSelect(roomToJoin);
        }} />;

      case 'tools': {
        if (toolsLoading) {
          return (
            <div className="p-4 pb-24 space-y-3 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-4">Tools & Resources</h2>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          );
        }

        const categories = {
          '💰 Career & Salary': tools.filter(t => t.category === 'salary'),
          '📚 Clinical & Study': tools.filter(t => ['drugs', 'protocols', 'ecg', 'study', 'guidelines'].includes(t.category)),
        };

        return (
          <div className="p-4 pb-24 space-y-6 animate-fade-in">
            {/* Featured resource banner */}
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Featured Resource</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">New ACLS Guidelines 2024</h3>
              <p className="text-sm text-muted-foreground mb-3">Download the latest quick-reference PDF for cardiac life support.</p>
              <Button size="sm" variant="secondary" className="w-full bg-background border border-border text-foreground hover:bg-muted">
                Download PDF
              </Button>
            </div>

            {Object.entries(categories).map(([title, catTools]) => catTools.length > 0 && (
              <div key={title} className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">{title}</h2>
                <div className="space-y-3">
                  {catTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} onClick={handleToolClick} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'profile':
        return <UserProfile />;

      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    if (currentScreen !== 'main') return undefined;

    switch (activeTab) {
      case 'rooms': return 'Rooms';
      case 'trending': return 'Trending';
      case 'tools': return 'Tools';
      case 'profile': return 'Profile';
      default: return undefined;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background max-w-lg mx-auto relative flex flex-col overflow-x-hidden">
      {currentScreen === 'main' && (
        <Header
          title={getHeaderTitle()}
          showSearch={activeTab !== 'profile'}
          showNotifications={activeTab !== 'profile'}
        />
      )}

      <main className={currentScreen === 'main' ? 'pb-20' : ''}>
        {renderContent()}
      </main>

      {currentScreen === 'main' && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
