import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import ThreadCard from "../components/ThreadCard";
import { fetchThreads } from "../lib/api";
import { toast } from "sonner";

export default function Explore() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExploreThreads();
  }, []);

  const loadExploreThreads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchThreads({ sort: 'random' });
      const randomThreads = data.threads?.sort(() => Math.random() - 0.5) || [];
      setThreads(randomThreads);
    } catch (err) {
      setError("Failed to load threads");
      toast.error("Failed to load threads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadLike = (threadId, isLiked) => {
    setThreads(prev => 
      prev.map(thread => 
        thread._id === threadId 
          ? { ...thread, isLiked }
          : thread
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Discovering threads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadExploreThreads} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground">Discover new and interesting threads from the community</p>
      </div>

      <div className="space-y-4">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <ThreadCard
              key={thread._id}
              thread={thread}
              onLike={handleThreadLike}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No threads to explore</p>
            <Button onClick={loadExploreThreads}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}