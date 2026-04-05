import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  MessageSquare, 
  Wrench, 
  ShieldAlert, 
  ChevronRight, 
  ArrowLeft,
  Hash,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  // Fetch live stats
  const { data: userCount = '--' } = useQuery({
    queryKey: ['admin-stat-users'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      return count ?? '--';
    },
  });

  const { data: messageCount = '--' } = useQuery({
    queryKey: ['admin-stat-messages'],
    queryFn: async () => {
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true });
      return count ?? '--';
    },
  });

  const { data: roomCount = '--' } = useQuery({
    queryKey: ['admin-stat-rooms'],
    queryFn: async () => {
      const { count } = await supabase.from('rooms').select('id', { count: 'exact', head: true });
      return count ?? '--';
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full bg-red-600 dark:bg-red-900 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 text-white">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" />
              <h1 className="text-lg font-bold tracking-tight uppercase">Admin Console</h1>
            </div>
          </div>
          <Badge variant="outline" className="text-white border-white font-mono bg-white/10 uppercase py-0.5 px-2">
            God Mode
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Welcome Section */}
        <section className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50">Station HQ</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Managing the frontlines of CodeBluer EMR Community</p>
        </section>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="h-1 bg-blue-500 w-full" />
            <CardContent className="p-3 flex flex-col items-center pt-3">
              <Users className="h-4 w-4 text-blue-500 mb-1" />
              <span className="text-xl font-black text-blue-600">{userCount}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">Members</span>
            </CardContent>
          </Card>
          <Card className="border-none bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="h-1 bg-green-500 w-full" />
            <CardContent className="p-3 flex flex-col items-center pt-3">
              <MessageSquare className="h-4 w-4 text-green-500 mb-1" />
              <span className="text-xl font-black text-green-600">{messageCount}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">Messages</span>
            </CardContent>
          </Card>
          <Card className="border-none bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="h-1 bg-purple-500 w-full" />
            <CardContent className="p-3 flex flex-col items-center pt-3">
              <Hash className="h-4 w-4 text-purple-500 mb-1" />
              <span className="text-xl font-black text-purple-600">{roomCount}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">Rooms</span>
            </CardContent>
          </Card>
        </div>

        {/* Administration Links */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest pl-1">Command Modules</h3>
          
          <AdminNavItem 
            to="/admin/users" 
            icon={<Users className="text-blue-500" />} 
            title="User Management" 
            description="Manage roles, verify EMR professionals"
            badge="Live"
          />
          
          <AdminNavItem 
            to="/admin/rooms" 
            icon={<MessageSquare className="text-purple-500" />} 
            title="Room Manager" 
            description="Configure chat rooms, toggle anonymity"
            badge={String(roomCount)}
          />
          
          <AdminNavItem 
            to="/admin/tools" 
            icon={<Wrench className="text-orange-500" />} 
            title="Resource Hub" 
            description="Add/remove clinical tools & calculators"
          />
        </div>

        {/* Admin Tip Box */}
        <Card className="border-dashed border-2 border-red-200 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader className="p-4 flex flex-row items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Activity className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-sm text-red-700 dark:text-red-400">Admin Tip</CardTitle>
              <CardDescription className="text-xs">
                Long-press any message in Chat Rooms to access Admin Delete & Pin controls.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

interface AdminNavItemProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const AdminNavItem = ({ to, icon, title, description, badge }: AdminNavItemProps) => (
  <Link 
    to={to} 
    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-transparent hover:border-red-500/20 active:scale-95 transition-all w-full text-left"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl">
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-zinc-50">{title}</span>
          {badge && <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{badge}</Badge>}
        </div>
        <span className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{description}</span>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-300" />
  </Link>
);

export default AdminDashboard;
