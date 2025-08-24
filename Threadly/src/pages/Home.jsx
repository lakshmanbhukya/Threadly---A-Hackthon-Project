import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import {
  fetchThreads,
  likeThread,
  voteOnPoll,
  transformThread,
} from "../lib/api";
import {
  ChevronDown,
  Calendar,
  MessageSquare,
  Share2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Image,
  Link,
  Hash,
  MessageSquare as ThreadIcon,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await fetchThreads();
      const transformedThreads = data.threads.map(transformThread);
      setThreads(transformedThreads);
    } catch (err) {
      setError("Failed to load threads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (threadId) => {
    try {
      await likeThread(threadId);
      // Update local state
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                upvotes: thread.isUpvoted
                  ? thread.upvotes - 1
                  : thread.upvotes + 1,
                isUpvoted: !thread.isUpvoted,
              }
            : thread
        )
      );
    } catch (err) {
      console.error("Failed to like thread:", err);
    }
  };

  const handlePollVote = async (threadId, optionIndex) => {
    try {
      const response = await voteOnPoll(threadId, optionIndex);

      // Update local state with new poll data
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                pollOptions: response.pollOptions,
                totalVotes: response.totalVotes,
              }
            : thread
        )
      );
    } catch (err) {
      console.error("Failed to vote on poll:", err);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const getPostTypeIcon = (postType) => {
    switch (postType) {
      case "media":
        return <Image className="h-4 w-4" />;
      case "link":
        return <Link className="h-4 w-4" />;
      case "poll":
        return <Hash className="h-4 w-4" />;
      default:
        return <ThreadIcon className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (postType) => {
    switch (postType) {
      case "media":
        return "Images & Video";
      case "link":
        return "Link";
      case "poll":
        return "Poll";
      default:
        return "Thread";
    }
  };

  const renderPostContent = (thread) => {
    switch (thread.postType) {
      case "media":
        return (
          <div className="mt-3">
            {thread.mediaFiles && thread.mediaFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {thread.mediaFiles.slice(0, 4).map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Video</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {thread.content && (
              <p className="mt-3 text-foreground">{thread.content}</p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mt-3">
            {thread.content && (
              <p className="text-foreground mb-3">{thread.content}</p>
            )}
            {thread.linkUrl && (
              <div className="border border-border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Link className="h-4 w-4" />
                  <span>Link</span>
                </div>
                <a
                  href={thread.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover break-all"
                >
                  {thread.linkUrl}
                </a>
              </div>
            )}
          </div>
        );

      case "poll":
        return (
          <div className="mt-3">
            {thread.content && (
              <p className="text-foreground mb-3">{thread.content}</p>
            )}
            {thread.pollOptions && thread.pollOptions.length > 0 && (
              <div className="space-y-2">
                {thread.pollOptions.map((option, index) => {
                  const totalVotes = thread.pollOptions.reduce(
                    (sum, opt) => sum + (opt.votes?.length || 0),
                    0
                  );
                  const optionVotes = option.votes?.length || 0;
                  const percentage =
                    totalVotes > 0
                      ? Math.round((optionVotes / totalVotes) * 100)
                      : 0;

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handlePollVote(thread.id, index)}
                        className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">{option.text}</span>
                          <span className="text-sm text-muted-foreground">
                            {optionVotes} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground mt-2">
                  Total votes:{" "}
                  {thread.pollOptions.reduce(
                    (sum, opt) => sum + (opt.votes?.length || 0),
                    0
                  )}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-3">
            {thread.content && (
              <p className="text-foreground">{thread.content}</p>
            )}
          </div>
        );
    }
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

  // Sort threads by upvotes descending before rendering
  const sortedThreads = [...threads].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sort Options */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 px-3 py-2 rounded-lg transition-colors">
                <span className="font-medium">Best</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <button className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors">
              Hot
            </button>
            <button className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors">
              New
            </button>
            <button className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors">
              Top
            </button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Today</span>
          </div>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {sortedThreads.map((thread) => (
          <div
            key={thread.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/20 transition-colors"
          >
            {/* Thread Header */}
            <div className="flex items-start gap-3">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleLike(thread.id)}
                  className={`p-1 rounded hover:bg-muted transition-colors ${
                    thread.isUpvoted ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-foreground">
                  {thread.upvotes}
                </span>
                <button
                  onClick={() => handleLike(thread.id)}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                >
                  <ArrowDown className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Post Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <div className="flex items-center gap-1">
                      {getPostTypeIcon(thread.postType)}
                      {getPostTypeLabel(thread.postType)}
                    </div>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Posted by u/{thread.author}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(thread.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary cursor-pointer">
                  {thread.title}
                </h3>

                {/* Post Content */}
                {renderPostContent(thread)}

                {/* Tags */}
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {thread.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">
                      {thread.replyCount} Comments
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No threads found</p>
          <Button onClick={() => navigate("/create")}>
            Create the first thread
          </Button>
        </div>
      )}
    </div>
  );
}
