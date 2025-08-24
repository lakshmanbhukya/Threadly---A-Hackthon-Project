import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Clock,
  User,
  Share,
  Bookmark,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/Badge";

const ThreadCard = ({
  id,
  title,
  content,
  author,
  upvotes = 0,
  downvotes = 0,
  isUpvoted = false,
  isDownvoted = false,
  replyCount = 0,
  topicName = "General",
  createdAt,
  onUpvote,
  onDownvote,
}) => {
  const handleVote = (voteType, e) => {
    e.stopPropagation();
    if (voteType === "up") {
      onUpvote && onUpvote();
    } else {
      onDownvote && onDownvote();
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTopicVariant = (topicName) => {
    const variants = {
      Technology: "technology",
      Science: "science",
      Programming: "programming",
      Gaming: "gaming",
      Movies: "movies",
      Music: "music",
      Sports: "sports",
      General: "general",
    };
    return variants[topicName] || "general";
  };

  return (
    <div className="bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors duration-200">
      <div className="flex">
        {/* Vote Section - Reddit-style */}
        <div className="flex flex-col items-center justify-start p-3 bg-background border-r border-border min-w-[60px]">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-upvote/10 transition-colors ${
              isUpvoted
                ? "text-upvote hover:text-upvote-hover"
                : "text-muted-foreground hover:text-upvote"
            }`}
            onClick={(e) => handleVote("up", e)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold py-1 text-foreground min-w-[20px] text-center">
            {upvotes - downvotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-destructive/10 transition-colors ${
              isDownvoted
                ? "text-destructive hover:text-destructive/80"
                : "text-muted-foreground hover:text-destructive"
            }`}
            onClick={(e) => handleVote("down", e)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header with topic and metadata */}
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant={getTopicVariant(topicName)} className="text-xs">
              r/{topicName.toLowerCase()}
            </Badge>
            <span className="text-muted-foreground text-sm">•</span>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium">u/{author}</span>
            </div>
            <span className="text-muted-foreground text-sm">•</span>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(createdAt)}</span>
            </div>
          </div>

          {/* Thread title and content */}
          <Link to={`/thread/${id}`} className="block group">
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {title}
            </h2>
            {content && (
              <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                {content}
              </p>
            )}
          </Link>

          {/* Action buttons */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link
              to={`/thread/${id}`}
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{replyCount} comments</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-accent"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-accent"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;
