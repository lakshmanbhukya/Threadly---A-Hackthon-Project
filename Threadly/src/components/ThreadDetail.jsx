import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Clock,
  User,
  Reply,
} from "lucide-react";
import { Button } from "./ui/button";

// Minimal Card, Badge, Textarea, and useToast
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-card border border-card rounded-lg shadow-card ${className}`}
  >
    {children}
  </div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);
const Badge = ({ children, className = "" }) => (
  <span className={`inline-block rounded px-2 py-0.5 font-medium ${className}`}>
    {children}
  </span>
);
const Textarea = ({ value, onChange, className = "", ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
);
function useToast() {
  return {
    toast: ({ title, description, variant = "default" }) => {
      console.log(`Toast ${variant}:`, title, description || "");
      alert(`${title}\n${description || ""}`);
    },
  };
}

// Mock data
const mockThreads = [
  {
    id: "1",
    title: "Welcome to Threadly!",
    content: "This is the first thread.",
    author: "Admin",
    upvotes: 12,
    downvotes: 2,
    replyCount: 3,
    topicName: "Technology",
    createdAt: new Date().toISOString(),
  },
];
const mockReplies = [
  {
    id: "r1",
    threadId: "1",
    parentId: null,
    content: "This is a reply!",
    author: "JaneDoe",
    upvotes: 2,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  },
];

const ThreadDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState(
    mockReplies.filter((r) => r.threadId === id)
  );
  const thread = mockThreads.find((t) => t.id === id);

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral/60">
            Thread not found
          </h1>
          <Link
            to="/"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      // Simulate API call
      const newReply = {
        id: Date.now().toString(),
        threadId: id,
        parentId: parentId || null,
        content: replyContent,
        author: "CurrentUser",
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setReplies((prev) => [...prev, newReply]);
      setReplyContent("");
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (err) {
      console.error("Reply posting error:", err);
      toast({
        title: "Error",
        description: "Unable to post reply. Please try again.",
        variant: "destructive",
      });
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

  const getTopicColor = (topicName) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-700 border-blue-200",
      Science: "bg-green-100 text-green-700 border-green-200",
      Programming: "bg-purple-100 text-purple-700 border-purple-200",
      Gaming: "bg-red-100 text-red-700 border-red-200",
      Movies: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[topicName] || colors.Technology;
  };

  const renderReply = (reply, depth = 0) => (
    <div
      key={reply.id}
      className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-gray-200" : ""}`}
    >
      <Card className="mb-4 bg-background">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1 text-sm text-neutral/60">
              <User className="h-3 w-3" />
              <span className="font-medium">{reply.author}</span>
            </div>
            <span className="text-sm text-neutral/60">•</span>
            <div className="flex items-center space-x-1 text-sm text-neutral/60">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(reply.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm mb-3">{reply.content}</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-neutral/60 hover:text-primary"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <span className="text-xs">{reply.upvotes - reply.downvotes}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-neutral/60 hover:text-destructive"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-neutral/60 hover:text-primary"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        </CardContent>
      </Card>
      {reply.replies?.map((childReply) => renderReply(childReply, depth + 1))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-neutral/60">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span>{thread.topicName}</span>
      </div>
      {/* Thread Content */}
      <Card className="bg-background border-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Badge className={`text-xs ${getTopicColor(thread.topicName)}`}>
              {thread.topicName}
            </Badge>
            <span className="text-sm text-neutral/60">•</span>
            <div className="flex items-center space-x-1 text-sm text-neutral/60">
              <User className="h-3 w-3" />
              <span className="font-medium">{thread.author}</span>
            </div>
            <span className="text-sm text-neutral/60">•</span>
            <div className="flex items-center space-x-1 text-sm text-neutral/60">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(thread.createdAt)}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
          <p className="text-base mb-6 whitespace-pre-wrap">{thread.content}</p>
          <div className="flex items-center space-x-6 pt-4 border-t">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral/60 hover:text-primary"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {thread.upvotes - thread.downvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral/60 hover:text-destructive"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-1 text-neutral/60">
              <MessageCircle className="h-4 w-4" />
              <span>{thread.replyCount} replies</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Reply Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Add a Reply</h3>
          <form onSubmit={handleSubmitReply}>
            <Textarea
              placeholder="Share your thoughts..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-4 min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!replyContent.trim()}>
                Post Reply
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Replies ({replies.filter((r) => !r.parentId).length})
        </h3>
        {replies
          .filter((reply) => !reply.parentId)
          .map((reply) => renderReply(reply))}
      </div>
    </div>
  );
};

export default ThreadDetail;
