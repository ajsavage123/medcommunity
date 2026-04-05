import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wrench, 
  Search, 
  Trash2, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Settings2,
  Eye,
  Activity,
  Pill,
  BookOpen,
  ClipboardCheck,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ResourceManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tools")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast.success("Resource removed");
    }
  });

  const filteredTools = tools?.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-lg font-bold">Resource Hub</h1>
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Global Tools Portal</span>
            </div>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8 gap-1 rounded-full px-3">
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Tool</span>
          </Button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search clinical resources..." 
              className="pl-10 h-10 bg-gray-100/50 dark:bg-zinc-800 border-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          filteredTools?.map(tool => (
            <ToolItem 
              key={tool.id} 
              tool={tool} 
              onDelete={() => deleteToolMutation.mutate(tool.id)}
            />
          ))
        )}
      </main>
    </div>
  );
};

const ToolItem = ({ tool, onDelete }: any) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'salary': return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'drugs': return <Pill className="h-5 w-5 text-red-500" />;
      case 'protocols': return <BookOpen className="h-5 w-5 text-amber-500" />;
      case 'ecg': return <Activity className="h-5 w-5 text-green-500" />;
      case 'study': return <ClipboardCheck className="h-5 w-5 text-purple-500" />;
      default: return <Wrench className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-between p-4 px-2">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
          {getIcon(tool.category)}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm leading-tight">{tool.name}</h3>
            <Badge variant="outline" className="uppercase text-[8px] h-3.5 px-1 font-black border-gray-200 dark:border-zinc-800 text-gray-400">{tool.type}</Badge>
          </div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-normal">{tool.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300">
           <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-500" onClick={onDelete}>
           <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ResourceManagement;
