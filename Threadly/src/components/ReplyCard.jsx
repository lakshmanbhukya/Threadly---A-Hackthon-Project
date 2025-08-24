import React, { useState } from "react";
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
import { Textarea } from "./ui/Textarea";

const ReplyCard = ({
  author,
  content,
  createdAt,
  upvotes = 0,
  downvotes = 0,
  isUpvoted = false,
  isDownvoted = false,
  depth = 0,
  onUpvote,
  onDownvote,
  onReply,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleVote = (voteType, e) => {
    e.stopPropagation();
    if (voteType === "up") {
      onUpvote && onUpvote();
    } else {
      onDownvote && onDownvote();
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply && onReply(replyContent);
      setReplyContent("");
      setShowReplyForm(false);
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

  return (
    <div className="flex space-x-2">
      {/* Comment nesting lines */}
      {depth > 0 && (
        <div className="flex flex-col items-center min-w-[20px]">
          {Array.from({ length: depth }, (_, i) => (
            <div
              key={i}
              className="w-px h-4 bg-border"
              style={{ marginLeft: `${i * 8}px` }}
            />
          ))}
        </div>
      )}

      {/* Comment content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-lg p-4 mb-3 hover:bg-accent/30 transition-colors duration-200">
          {/* Comment header */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium text-foreground">u/{author}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(createdAt)}</span>
            </div>
          </div>

          {/* Comment content */}
          <div className="text-foreground text-sm whitespace-pre-line mb-4 leading-relaxed">
            {content}
          </div>

          {/* Comment actions */}
          <div className="flex items-center space-x-4 text-sm">
            {/* Vote buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 hover:bg-upvote/10 transition-colors ${
                  isUpvoted
                    ? "text-upvote hover:text-upvote-hover"
                    : "text-muted-foreground hover:text-upvote"
                }`}
                onClick={(e) => handleVote("up", e)}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <span className="text-xs font-bold text-foreground min-w-[20px] text-center">
                {upvotes - downvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 hover:bg-destructive/10 transition-colors ${
                  isDownvoted
                    ? "text-destructive hover:text-destructive/80"
                    : "text-muted-foreground hover:text-destructive"
                }`}
                onClick={(e) => handleVote("down", e)}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Share className="h-3 w-3 mr-1" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <form
              onSubmit={handleReply}
              className="mt-4 pt-4 border-t border-border"
            >
              <Textarea
                className="mb-3"
                rows="3"
                placeholder="What are your thoughts?"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
