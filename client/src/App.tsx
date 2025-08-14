import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import Prizes from "@/pages/prizes";
import Tasks from "@/pages/tasks";
import AuthPage from "@/pages/auth-page";
import ResetPasswordPage from "@/pages/reset-password";
import { AuthProvider } from "@/hooks/useAuth";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/reset-password" component={ResetPasswordPage} />
      {isLoading || !user ? (
        <Route path="/" component={AuthPage} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
          <Route path="/prizes" component={Prizes} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Setup confetti canvas on app load
    const canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    // Size canvas to device pixel ratio
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
