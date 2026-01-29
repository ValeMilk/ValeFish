import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'operador' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se tem token salvo
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') as 'admin' | 'operador' | null;
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <div className="text-center">
          <img 
            src="/Logo ValeFish.png" 
            alt="ValeFish" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login 
                    onLoginSuccess={(token, user) => {
                      setIsAuthenticated(true);
                      setUserRole(user.role);
                      localStorage.setItem('userRole', user.role);
                    }}
                  />
                )
              }
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Index onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route 
              path="/admin" 
              element={
                isAuthenticated && userRole === 'admin' ? (
                  <Admin />
                ) : isAuthenticated ? (
                  <Navigate to="/" replace
              element={
                isAuthenticated ? (
                  <Index onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
