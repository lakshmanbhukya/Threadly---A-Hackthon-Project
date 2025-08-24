import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/Textarea";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { Heart, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { fetchThreadComments, createComment, likeComment, deleteComment } from "../lib/api";
import ConfirmDialog from "./ui/ConfirmDialog";

const CommentSection = ({ threadId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, comment: null });

  useEffect(() => {
    loadComments();
  }, [threadId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchThreadComments(threadId);
      setComments(data.comments || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await createComment({
        content: newComment,
        threadId,
        isAnonymous: isAnonymous.toString()
      });
      setComments([response.comment, ...comments]);
      setNewComment("");
      setIsAnonymous(false);
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await likeComment(commentId);
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: { length: response.likesCount }, isLiked: response.isLiked }
          : comment
      ));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>
      
      {isAuthenticated && (
        <Card className="p-4 mb-6">
          <form onSubmit={handleSubmitComment}>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span className="text-sm">Comment anonymously</span>
              </label>
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment._id} className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar 
                  className="w-8 h-8"
                  src={comment.isAnonymous ? null : comment.createdBy?.profilePicture}
                  fallback={comment.isAnonymous ? "A" : (comment.createdBy?.username?.[0]?.toUpperCase() || "U")}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-sm">
                      {comment.isAnonymous ? "Anonymous" : (comment.createdBy?.username || "Unknown")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment._id)}
                      className="flex items-center space-x-1"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes?.length || 0}</span>
                    </Button>
                    {(user?.isAdmin || comment.createdBy?._id === user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ isOpen: true, comment })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, comment: null })}
        onConfirm={() => handleDeleteComment(deleteConfirm.comment?._id)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CommentSection;