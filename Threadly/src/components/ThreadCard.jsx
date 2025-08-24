import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  User,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import ConfirmDialog from "./ui/ConfirmDialog";
import { toast } from "sonner";
import { likeThread, deleteAdminThread } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const ThreadCard = ({ thread, onLike }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(thread.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (typeof thread.createdBy === "string") {
        try {
          const response = await axios.get(
            `http://localhost:3000/users/user/${thread.createdBy}`,
            {
              withCredentials: true,
            }
          );
          setUserInfo(response.data.user);
          setUserNotFound(false);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          setUserNotFound(true);
        }
      } else if (thread.createdBy?.username) {
        setUserInfo(thread.createdBy);
        setUserNotFound(false);
      } else {
        setUserNotFound(true);
      }
    };

    fetchUserInfo();
    fetchCommentCount();
  }, [thread.createdBy, thread._id]);

  const fetchCommentCount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/comments/thread/${thread._id}`
      );
      setCommentCount(response.data.comments?.length || 0);
    } catch (error) {
      console.error("Failed to fetch comment count:", error);
    }
  };

  const displayUser = userNotFound
    ? { username: "Anonymous" }
    : userInfo || thread.createdBy;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await likeThread(thread._id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);

      if (onLike) {
        onLike(thread._id, response.isLiked);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/thread/${thread._id}`);
  };

  const handleDeleteThread = async () => {
    try {
      await deleteAdminThread(thread._id);
      toast.success("Thread deleted successfully");
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
    <Card
      className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ">
          {displayUser?.profilePicture ? (
            <img
              className="aspect-square h-full w-full object-cover"
              src={displayUser.profilePicture}
              alt="Profile"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-muted"
            style={{ display: displayUser?.profilePicture ? "none" : "flex" }}
          >
            <span className="text-sm font-medium text-muted-foreground">
              {displayUser?.username?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className="text-sm text-gray-400 hover:text-orange-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (displayUser?.username && !userNotFound) {
                  navigate(`/profile/${displayUser.username}`);
                }
              }}
            >
              {displayUser?.username || "Anonymous"}
            </span>
            <Badge variant="outline" className="text-xs">
              {thread.topic}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatTime(thread.createdAt)}
            </span>
          </div>

          <h3 className="text-lg font-medium mb-2 text-[#ef4444] hover:text-orange-400 cursor-pointer">
            {thread.title}
          </h3>

          <p className="text-[#f9fafb] mb-3 line-clamp-3">{thread.description}</p>

          <div className="flex items-center space-x-4 text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>

            {currentUser?.isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteThread}
        title="Delete Thread"
        message={`Are you sure you want to delete the thread "${thread.title}" and all its posts? This action cannot be undone.`}
        confirmText="Delete Thread"
        cancelText="Cancel"
        type="danger"
      />
    </Card>
  );
};

export default ThreadCard;
