import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useSocket } from "./hooks/useSocket";
import LoadingScreen from "./components/LoadingScreen";
import ServerError from "./components/ServerError";
import Layout from "./components/Layout";
import { checkAuth } from "./lib/api";
import Home from "./pages/Home";
import ThreadDetail from "./pages/ThreadDetail";
import CreateThread from "./pages/CreateThread";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ServerStatus from "./pages/ServerStatus";
import Explore from "./pages/Explore";
import All from "./pages/All";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const { user, loading, refreshSession } = useAuth();
  const [serverError, setServerError] = useState(false);
  
  useSocket(user?.id);
  
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        await checkAuth();
        setServerError(false);
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          setServerError(true);
        }
      }
    };
    
    checkServerConnection();
  }, []);
  
  if (serverError) {
    return <ServerError onRetry={async () => {
      try {
        await checkAuth();
        setServerError(false);
        await refreshSession();
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          setServerError(true);
        }
      }
    }} />;
  }
  
  if (loading) {
    return <LoadingScreen message="Checking authentication" />;
  }
  
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/thread/:id"
        element={
          <Layout>
            <ThreadDetail />
          </Layout>
        }
      />
      <Route
        path="/create"
        element={
          <Layout>
            <CreateThread />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile/:username"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminDashboard />
          </Layout>
        }
      />
      <Route
        path="/status"
        element={
          <Layout>
            <ServerStatus />
          </Layout>
        }
      />
      <Route
        path="/explore"
        element={
          <Layout>
            <Explore />
          </Layout>
        }
      />
      <Route
        path="/all"
        element={
          <Layout>
            <All />
          </Layout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
