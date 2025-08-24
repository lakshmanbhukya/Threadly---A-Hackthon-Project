import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import PostCard from "../components/PostCard";
import { fetchAllRecentPosts } from "../lib/api";
import { toast } from "sonner";

export default function All() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAllPosts();
  }, []);

  const loadAllPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAllRecentPosts({ limit: 50 });
      const allPosts = data.posts?.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ) || [];
      setPosts(allPosts);
    } catch (err) {
      setError("Failed to load posts");
      toast.error("Failed to load posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = (postId, isLiked) => {
    setPosts(prev => 
      prev.map(post => 
        post._id === postId 
          ? { ...post, isLiked }
          : post
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading all posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadAllPosts} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">All Posts</h1>
        <p className="text-muted-foreground">Browse all posts from every thread and community</p>
      </div>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handlePostLike}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts found</p>
            <Button onClick={loadAllPosts}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}