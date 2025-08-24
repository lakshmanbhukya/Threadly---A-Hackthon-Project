import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import ConfirmDialog from "./ui/ConfirmDialog";
import { toast } from "sonner";
import { likePost, deleteAdminPost } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PostCard = ({ post, onLike }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user: currentUser } = useAuth();

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await likePost(post._id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
      
      if (onLike) {
        onLike(post._id, response.isLiked);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteAdminPost(post._id);
      toast.success("Post deleted successfully");
      window.location.reload(); // Refresh to update the list
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
    <Card className="p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Avatar 
          className="w-10 h-10"
          src={post.isAnonymous ? null : post.createdBy?.profilePicture}
          fallback={post.isAnonymous ? "A" : (post.createdBy?.username?.[0]?.toUpperCase() || "U")}
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span 
              className={`font-medium ${!post.isAnonymous ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : ''}`}
              onClick={!post.isAnonymous ? (e) => {
                e.stopPropagation();
                navigate(`/profile/${post.createdBy?.username}`);
              } : undefined}
            >
              {post.isAnonymous ? "Anonymous" : (post.createdBy?.username || "Unknown")}
            </span>
            {post.isAnonymous && (
              <Badge variant="secondary" className="text-xs">Anonymous</Badge>
            )}
            <span className="text-sm text-gray-500">
              {formatTime(post.createdAt)}
            </span>
          </div>
          
          <div className="mb-3">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>
          
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {post.media.map((media, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="Post media"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            
            {currentUser?.isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete Post"
        cancelText="Cancel"
        type="danger"
      />
    </Card>
  );
};

export default PostCard;