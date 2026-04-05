import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  UserMinus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users with their roles and profile data
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Joining profiles and user_roles
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          name,
          avatar_url,
          user_type,
          user_roles (
            role
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation for updating user roles
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "user" | "verified" | "paid" | "admin" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">User Management</h1>
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">EMR Community Admin</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-10 h-10 bg-gray-100/50 dark:bg-zinc-800 border-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers?.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No users found.</div>
            ) : (
              filteredUsers?.map((user) => (
                <UserItem 
                  key={user.id} 
                  user={user} 
                  onUpdateRole={(role) => updateRoleMutation.mutate({ userId: user.user_id, newRole: role })}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const UserItem = ({ user, onUpdateRole }: { user: any, onUpdateRole: (role: "user" | "verified" | "paid" | "admin") => void }) => {
  const currentRole = (user.user_roles?.[0]?.role as "user" | "verified" | "paid" | "admin") || "user";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-red-500 hover:bg-red-500 uppercase text-[9px] px-1.5 h-4">Admin</Badge>;
      case "verified": return <Badge className="bg-blue-500 hover:bg-blue-500 uppercase text-[9px] px-1.5 h-4">Verified</Badge>;
      case "paid": return <Badge className="bg-amber-500 hover:bg-amber-500 uppercase text-[9px] px-1.5 h-4">Paid</Badge>;
      default: return <Badge variant="secondary" className="uppercase text-[9px] px-1.5 h-4">User</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-gray-50 dark:border-zinc-800">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-red-50 dark:bg-red-900/20 text-red-600 font-bold uppercase text-xs">
            {user.name?.substring(0, 2) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-gray-900 dark:text-zinc-50">{user.name || "Anonymous User"}</span>
            {getRoleBadge(currentRole)}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono tracking-tight">{user.user_type || "No Sector"}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
          <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 font-bold px-2 py-1.5">Change Authority</DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => onUpdateRole("admin")}>
            <ShieldCheck className="h-4 w-4 text-red-500" />
            <span>Make Admin</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => onUpdateRole("verified")}>
            <UserCheck className="h-4 w-4 text-blue-500" />
            <span>Verify User</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => onUpdateRole("paid")}>
            <UserPlus className="h-4 w-4 text-amber-500" />
            <span>Set as Paid Member</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 rounded-lg text-red-600" onClick={() => onUpdateRole("user")}>
            <UserMinus className="h-4 w-4" />
            <span>Revoke Authority</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserManagement;
