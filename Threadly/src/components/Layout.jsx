import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "./ui/ThemeToggle";
import { fetchAllRecentPosts, fetchNotifications } from "../lib/api";
import { useSocket } from "../hooks/useSocket";
import NotificationPanel from "./NotificationPanel";
import UserChatPanel from "./UserChatPanel";
import {
  Home,
  TrendingUp,
  Plus,
  Search,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  MessageCircle,
  Gamepad2,
  Users,
  Star,
  Clock,
  Eye,
  ChevronRight,
  Settings,
  HelpCircle,
  Globe,
  Sparkles,
  Shield,
} from "lucide-react";

export default function Layout({ children }) {
  const { isOpen, setIsOpen } = useSidebar();
  const { user, isAuthenticated, logout } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const socket = useSocket();

  const subredditItems = [
    { name: "r/technology", members: "12.4M", icon: "🔧" },
    { name: "r/gaming", members: "8.9M", icon: "🎮" },
    { name: "r/science", members: "32.1M", icon: "🔬" },
    { name: "r/programming", members: "6.7M", icon: "💻" },
    { name: "r/movies", members: "29.8M", icon: "🎬" },
    { name: "r/music", members: "15.2M", icon: "🎵" },
    { name: "r/sports", members: "18.3M", icon: "⚽" },
    { name: "r/food", members: "22.7M", icon: "🍕" },
    { name: "r/art", members: "11.9M", icon: "🎨" },
    { name: "r/books", members: "20.1M", icon: "📚" },
  ];

  useEffect(() => {
    loadRecentPosts();
    if (isAuthenticated) {
      loadNotificationCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket && isAuthenticated && user) {
      // Join user's notification room
      socket.emit("join", user._id);

      socket.on("newPost", () => {
        loadRecentPosts();
      });

      socket.on("newNotification", () => {
        loadNotificationCount();
      });

      return () => {
        socket.off("newPost");
        socket.off("newNotification");
      };
    }
  }, [socket, isAuthenticated, user]);

  const loadRecentPosts = async () => {
    try {
      const data = await fetchAllRecentPosts();
      const sortedPosts =
        data.posts
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5) || [];
      setRecentPosts(sortedPosts);
    } catch (error) {
      console.error("Failed to load recent posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const data = await fetchNotifications();
      setUnreadNotifications(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notification count:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hr. ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Reddit Style */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left side - Logo and Search */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-primary">
                  <img
                    src="/favicon.png" // replace with your logo path
                    alt="Threadly Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="hidden sm:inline-block font-medium text-xl text-foreground">
                  threadly
                </span>
              </Link>

              {/* Search bar - Reddit style */}
              <div className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                    placeholder="Search Threadly"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-2">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Action buttons - Reddit style */}
              {/* Remove AD button */}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatPanelOpen(true)}
                title="Open Chat"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>

              <Link to="/create">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Post</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setNotificationPanelOpen(true)}
                title="Open Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Button>

              {/* User profile and logout */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link to={`/profile/${user?.username}`}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-colors">
                      <span className="text-primary-foreground font-bold text-sm">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar - Reddit Style */}
        <aside
          className={`${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0 overflow-y-auto h-[calc(100vh-3.5rem)] scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70`}
        >
          {/* Main Navigation */}
          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/?sort=trending"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Popular</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/?sort=answers"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Answers BETA</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span>Explore</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/all"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Star className="h-5 w-5" />
                  <span>All</span>
                </Link>
              </li>
              {user?.isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Games on Threadly Section - Reddit Style */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <h3 className="text-sm font-semibold text-sidebar-foreground">
                GAMES ON THREADLY
              </h3>
            </div>
            <div className="space-y-3">
              <div className="bg-sidebar-accent rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    🧩
                  </div>
                  <div>
                    <div className="text-sm font-medium text-sidebar-foreground">
                      ThreadPuzzle
                    </div>
                    <div className="text-xs text-sidebar-muted-foreground">
                      Solve puzzles! 15K monthly players
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-sidebar-muted-foreground space-y-1">
                <div className="cursor-pointer hover:text-sidebar-foreground">
                  Word Thread
                </div>
                <div className="cursor-pointer hover:text-sidebar-foreground">
                  Thread Quiz
                </div>
                <div className="cursor-pointer hover:text-sidebar-foreground">
                  Thread Trivia
                </div>
                <div className="cursor-pointer hover:text-sidebar-foreground">
                  Discover more games
                </div>
              </div>
            </div>
          </div>

          {/* Custom Feeds Section - Reddit Style */}
          <div className="p-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">
              CUSTOM FEEDS
            </h3>
            <Button variant="outline" size="sm" className="w-full">
              + Create Custom Feed
            </Button>
          </div>

          {/* Subreddits Section */}
          <div className="p-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">
              POPULAR COMMUNITIES
            </h3>
            <div className="space-y-2">
              {subredditItems.map((subreddit) => (
                <Link
                  key={subreddit.name}
                  to={`/?community=${subreddit.name}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{subreddit.icon}</span>
                    <span className="text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                      {subreddit.name}
                    </span>
                  </div>
                  <span className="text-xs text-sidebar-muted-foreground">
                    {subreddit.members}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Logout Section - Only show when authenticated */}
          {isAuthenticated && (
            <div className="p-4 border-t border-sidebar-border mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-3.5rem)] scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70">
          {/* Mobile search bar */}
          {isOpen && (
            <div className="md:hidden p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200"
                  placeholder="Search Threadly"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 md:p-6 min-h-[calc(100vh-7rem)]">{children}</div>
        </main>

        {/* Right Sidebar - Recent Posts - Reddit Style */}
        <aside className="hidden lg:block w-80 bg-sidebar-background border-l border-sidebar-border p-6 overflow-y-auto h-[calc(100vh-3.5rem)] scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70">
          {/* Recent Posts Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-sidebar-foreground">
              RECENT POSTS
            </h3>
            <Button variant="ghost" size="sm" className="text-xs">
              Clear
            </Button>
          </div>

          {/* Recent Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div
                  key={post._id}
                  className="p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-2 mb-2">
                    <div className="text-xs text-sidebar-muted-foreground">
                      by {post.createdBy?.username || "Anonymous"}
                    </div>
                    <div className="text-xs text-sidebar-muted-foreground">
                      • {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-sidebar-foreground mb-2 line-clamp-2">
                    {post.content.length > 60
                      ? `${post.content.substring(0, 60)}...`
                      : post.content}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs text-sidebar-muted-foreground">
                    <span>
                      {post.likes?.length > 1000
                        ? `${(post.likes.length / 1000).toFixed(1)}k`
                        : post.likes?.length || 0}{" "}
                      likes
                    </span>
                    {post.media?.length > 0 && (
                      <span>
                        📎 {post.media.length} file
                        {post.media.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sidebar-muted-foreground text-sm">
                No recent posts
              </div>
            )}
          </div>

          {/* Community info */}
          <div className="mt-8 bg-sidebar-accent rounded-lg p-4">
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-2">
              About Threadly
            </h3>
            <p className="text-sm text-sidebar-muted-foreground mb-3">
              A place for meaningful discussions and community building.
            </p>
            <div className="text-xs text-sidebar-muted-foreground">
              <p>• Founded 2024</p>
              <p>• {subredditItems.length} communities</p>
              <p>• Be kind and respectful</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => {
          setNotificationPanelOpen(false);
          loadNotificationCount(); // Refresh count when panel closes
        }}
      />

      {/* Chat Panel */}
      <UserChatPanel
        isOpen={chatPanelOpen}
        onClose={() => setChatPanelOpen(false)}
      />
    </div>
  );
}
