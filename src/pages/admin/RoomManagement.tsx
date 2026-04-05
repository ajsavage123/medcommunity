import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Settings2, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Loader2,
  Hash
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const RoomManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...updates } = payload;
      const { error } = await supabase
        .from("rooms")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
      toast.success("Room settings updated");
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
      toast.success("Room deleted");
    }
  });

  const filteredRooms = rooms?.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Room Manager</h1>
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Global Curation</span>
            </div>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8 gap-1 rounded-full px-3">
            <Plus className="h-4 w-4" />
            <span className="text-xs">New Room</span>
          </Button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search station rooms..." 
              className="pl-10 h-10 bg-gray-100/50 dark:bg-zinc-800 border-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          filteredRooms?.map(room => (
            <RoomItem 
              key={room.id} 
              room={room} 
              onToggleAnonymous={(val) => updateRoomMutation.mutate({ id: room.id, is_anonymous: val })}
              onDelete={() => deleteRoomMutation.mutate(room.id)}
            />
          ))
        )}
      </main>
    </div>
  );
};

const RoomItem = ({ room, onToggleAnonymous, onDelete }: any) => (
  <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden">
    <CardContent className="p-0">
      <div className="flex items-start gap-4 p-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600">
          <Hash className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-zinc-50 truncate">{room.name}</h3>
            {room.is_system && <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 border-none text-[8px] h-3.5 uppercase font-black px-1">System</Badge>}
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">{room.description}</p>
        </div>
      </div>
      
      <div className="bg-gray-50/50 dark:bg-black/20 px-4 py-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={room.is_anonymous} onCheckedChange={onToggleAnonymous} className="scale-75 origin-left" />
            <span className="text-[10px] uppercase font-bold text-gray-400">{room.is_anonymous ? 'Anon: ON' : 'Anon: OFF'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RoomManagement;
