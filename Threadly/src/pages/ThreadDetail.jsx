import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/Textarea";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { ArrowLeft } from "lucide-react";
import { fetchThreadById, fetchPosts } from "../lib/api";
import { toast } from "sonner";

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadThreadAndPosts();
  }, [id]);

  const loadThreadAndPosts = async () => {
    setLoading(true);
    try {
      const threadData = await fetchThreadById(id);
      setThread(threadData.thread);

      const postsData = await fetchPosts(id);
      const sortedPosts = postsData.posts.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
      
      setError(null);
    } catch (err) {
      console.error("Failed to load thread:", err);
      setError("Failed to load thread");
      toast.error("Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    loadThreadAndPosts();
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold mb-2">Thread not found</h2>
        <p className="text-muted-foreground mb-4">
          The thread you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Threads
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>by {thread.createdBy?.username || "Unknown"}</span>
            <span>•</span>
            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{thread.topic}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {thread.title}
          </h1>
          <p className="text-foreground text-lg leading-relaxed">
            {thread.description}
          </p>
        </div>
      </div>

      <PostForm threadId={id} onPostCreated={handlePostCreated} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Posts ({posts.length})
        </h2>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handlePostLike}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-4xl mb-2">💬</div>
            <p className="text-muted-foreground">
              No posts yet. Be the first to post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}