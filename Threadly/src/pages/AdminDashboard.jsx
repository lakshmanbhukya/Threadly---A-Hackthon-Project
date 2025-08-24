import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Trash2, Users, MessageSquare, FileText, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { fetchAdminUsers, fetchAdminThreads, fetchAdminPosts, deleteAdminUser, deleteAdminThread, deleteAdminPost, toggleUserAdmin } from "../lib/api";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalThreads: 0, totalPosts: 0 });
  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', item: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!user?.isAdmin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isAuthenticated, user, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, threadsData, postsData] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminThreads(),
        fetchAdminPosts()
      ]);
      
      setUsers(usersData.users || []);
      setThreads(threadsData.threads || []);
      setPosts(postsData.posts || []);
      
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalThreads: threadsData.threads?.length || 0,
        totalPosts: postsData.posts?.length || 0,
      });
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      toast.success("User and all content deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openDeleteConfirm = (type, item) => {
    setConfirmDialog({ isOpen: true, type, item });
  };

  const handleConfirmAction = () => {
    const { type, item } = confirmDialog;
    if (type === 'user') {
      handleDeleteUser(item._id);
    } else if (type === 'thread') {
      handleDeleteThread(item._id);
    } else if (type === 'post') {
      handleDeletePost(item._id);
    }
  };

  const getConfirmDialogProps = () => {
    const { type, item } = confirmDialog;
    if (type === 'user') {
      return {
        title: 'Delete User Account',
        message: `Are you sure you want to permanently delete user "${item?.username}" and all their content? This action cannot be undone and will remove all threads, posts, and data associated with this account.`,
        confirmText: 'Delete Permanently'
      };
    } else if (type === 'thread') {
      return {
        title: 'Delete Thread',
        message: `Are you sure you want to delete the thread "${item?.title}" and all its posts? This action cannot be undone.`,
        confirmText: 'Delete Thread'
      };
    } else if (type === 'post') {
      return {
        title: 'Delete Post',
        message: `Are you sure you want to delete this post? This action cannot be undone.`,
        confirmText: 'Delete Post'
      };
    }
    return {};
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteAdminThread(threadId);
      setThreads(threads.filter(thread => thread._id !== threadId));
      setStats(prev => ({ ...prev, totalThreads: prev.totalThreads - 1 }));
      toast.success("Thread deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteAdminPost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const result = await toggleUserAdmin(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: result.isAdmin } : u));
      toast.success("Admin status updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, threads, and posts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalThreads}</p>
              <p className="text-sm text-muted-foreground">Total Threads</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {["users", "threads", "posts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {activeTab === "users" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Users</h3>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleToggleAdmin(user._id)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm('user', user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "threads" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Threads</h3>
            <div className="space-y-3">
              {threads.map((thread) => (
                <div key={thread._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{thread.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {thread.createdBy?.username || 'Anonymous'} • {thread.likes?.length || 0} likes
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm('thread', thread)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Posts</h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{post.content.substring(0, 100)}...</p>
                    <p className="text-sm text-muted-foreground">
                      by {post.createdBy?.username || 'Anonymous'} in {post.threadId?.title || 'Unknown Thread'} • {post.likes?.length || 0} likes
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm('post', post)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', item: null })}
        onConfirm={handleConfirmAction}
        {...getConfirmDialogProps()}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}