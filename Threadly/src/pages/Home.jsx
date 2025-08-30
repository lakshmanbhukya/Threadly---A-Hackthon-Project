import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import ThreadCard from "../components/ThreadCard";
import { fetchThreads } from "../lib/api";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadThreads();
  }, [searchParams]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError("");
      const sort = searchParams.get('sort');
      const community = searchParams.get('community');
      
      const data = await fetchThreads({ sort, community });
      let sortedThreads = data.threads || [];
      
      // Apply sorting based on URL parameter
      if (sort === 'trending') {
        sortedThreads = sortedThreads.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      } else {
        sortedThreads = sortedThreads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setThreads(sortedThreads);
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
          <p className="text-muted-foreground">Loading threads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadThreads} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {searchParams.get('sort') === 'trending' ? 'Popular Threads' :
             searchParams.get('sort') === 'answers' ? 'Q&A Threads' :
             searchParams.get('community') ? `${searchParams.get('community')} Community` :
             'Latest Threads'}
          </h1>
          <Button onClick={() => navigate("/create-thread")}>
            Create Thread
          </Button>
        </div>
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
            <p className="text-muted-foreground mb-4">No threads found</p>
            <Button onClick={() => navigate("/create")}>
              Create the first thread
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}