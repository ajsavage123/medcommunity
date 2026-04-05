import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

export function AdminRoute() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If mobile, ensure we render full height mobile views
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 sm:mx-auto sm:max-w-md sm:border-x sm:border-gray-200 sm:dark:border-zinc-800">
      <Outlet />
    </div>
  );
}
