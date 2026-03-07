import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useProfile } from '@/hooks/useProfile';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const hasShownWelcome = useRef(false);

  // Initialize real-time sync globally
  useRealtimeSync();

  // Show "welcome back" toast for returning users (only once per session)
  useEffect(() => {
    if (!loading && !profileLoading && user && profile?.onboardingCompleted) {
      const sessionKey = `welcomed_${user.id}`;
      const alreadyWelcomed = sessionStorage.getItem(sessionKey);
      if (!alreadyWelcomed && !hasShownWelcome.current) {
        hasShownWelcome.current = true;
        sessionStorage.setItem(sessionKey, '1');
        const firstName = profile?.name?.split(' ')[0] || 'back';
        toast({
          title: `Welcome back, ${firstName}! 👋`,
          description: "Great to see you again on EMR Community.",
          duration: 3500,
        });
      }
    }
  }, [loading, profileLoading, user, profile]);

  // while we're waiting for auth or profile info just show skeleton
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // redirect to onboarding only for brand new users who haven't completed it
  if (!profile?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // We show the main app only after splash is gone to ensure a stunning first impression
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />

          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

          <div className={showSplash ? "hidden" : "block animate-fade-in duration-1000"}>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
