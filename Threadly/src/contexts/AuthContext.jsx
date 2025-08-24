/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { checkAuth, logoutUser } from "../lib/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount and refresh
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Redirect to /login if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      const publicPaths = ["/login", "/register"];
      if (!publicPaths.includes(location.pathname)) {
        navigate("/login");
      }
    }
  }, [loading, user, location.pathname, navigate]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await checkAuth();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if backend logout fails
      setUser(null);
    }
  };

  const refreshSession = async () => {
    await checkAuthStatus();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
