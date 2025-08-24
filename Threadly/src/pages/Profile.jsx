import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import ProfileStats from "../components/ProfileStats";
import {
  Settings,
  Plus,
  Eye,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Award,
  Bookmark,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Users,
  Clock,
  Star,
} from "lucide-react";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData] = useState({
    username: username || "LazyDragonite",
    userId: "u/Senior-Rub9424",
    avatar: null,
    joinDate: "2024-01-15",
    karma: 1247,
    posts: 23,
    comments: 156,
    saved: 8,
    hidden: 2,
    upvoted: 45,
    downvoted: 3,
    totalViews: "12.4k",
  });

  const [userContent] = useState({
    posts: [
      {
        id: 1,
        subreddit: "r/lovable",
        title: "How do you download your Lovable app?",
        content: "yes, thats correct.",
        type: "comment",
        replyTo: "Inevitable-Glove-274",
        timeAgo: "1 mo. ago",
        upvotes: 1,
        downvotes: 0,
        views: 237,
        insights: true,
      },
      {
        id: 2,
        subreddit: "r/Christianity",
        title: "How do I stop struggling with lust and sexual sin",
        content: "This is a personal struggle that many face...",
        type: "post",
        timeAgo: "2 mo. ago",
        upvotes: 12,
        downvotes: 2,
        views: 1247,
        insights: true,
      },
    ],
    comments: [
      {
        id: 3,
        subreddit: "r/technology",
        content: "Great insight! This technology is really promising.",
        timeAgo: "3 days ago",
        upvotes: 8,
        downvotes: 1,
        postTitle: "New AI breakthrough in machine learning",
      },
    ],
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "posts", label: "Posts", icon: Plus },
    { id: "comments", label: "Comments", icon: MessageCircle },
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "hidden", label: "Hidden", icon: EyeOff },
    { id: "upvoted", label: "Upvoted", icon: ThumbsUp },
    { id: "downvoted", label: "Downvoted", icon: ThumbsDown },
  ];

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar
                src={profileData.avatar}
                fallback={profileData.username.charAt(0).toUpperCase()}
                className="w-24 h-24 text-2xl"
              />
              {isOwnProfile && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profileData.username}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {profileData.userId}
                  </p>
                </div>
                {isOwnProfile && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Profile Stats */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(profileData.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>{profileData.karma.toLocaleString()} karma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {profileData.posts + profileData.comments} contributions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl">
          {/* Profile Stats Section */}
          {activeTab === "overview" && <ProfileStats stats={profileData} />}

          {/* Overview: Show posts and comments as two sections */}
          {activeTab === "overview" && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Posts</h2>
                {userContent.posts.length === 0 ? (
                  <div className="text-muted-foreground">No posts yet.</div>
                ) : (
                  <div className="space-y-4">
                    {userContent.posts.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        {/* Content Header */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.subreddit}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {item.timeAgo}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              {item.title}
                            </h3>
                            {item.content && (
                              <p className="text-foreground text-sm mb-3">
                                {item.content}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Content Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium text-foreground">
                                {item.upvotes - item.downvotes}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Content Stats */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{item.views} views</span>
                          </div>
                          {item.insights && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-hover"
                            >
                              See More Insights
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                {userContent.comments.length === 0 ? (
                  <div className="text-muted-foreground">No comments yet.</div>
                ) : (
                  <div className="space-y-4">
                    {userContent.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {comment.subreddit}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {comment.timeAgo}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comment on: {comment.postTitle}
                          </p>
                          <p className="text-foreground">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-foreground">
                              {comment.upvotes - comment.downvotes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {userContent.posts.length === 0 ? (
                <div className="text-muted-foreground">No posts yet.</div>
              ) : (
                userContent.posts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    {/* Content Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.subreddit}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.timeAgo}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {item.title}
                        </h3>
                        {item.content && (
                          <p className="text-foreground text-sm mb-3">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Content Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium text-foreground">
                            {item.upvotes - item.downvotes}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-3">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Content Stats */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{item.views} views</span>
                      </div>
                      {item.insights && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary-hover"
                        >
                          See More Insights
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              {userContent.comments.length === 0 ? (
                <div className="text-muted-foreground">No comments yet.</div>
              ) : (
                userContent.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {comment.subreddit}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Comment on: {comment.postTitle}
                      </p>
                      <p className="text-foreground">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium text-foreground">
                          {comment.upvotes - comment.downvotes}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">🔖</div>
              <h3 className="text-xl font-semibold mb-2">No saved content</h3>
              <p className="text-muted-foreground">
                Save posts and comments to view them later.
              </p>
            </div>
          )}

          {/* Hidden Tab */}
          {activeTab === "hidden" && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold mb-2">No hidden content</h3>
              <p className="text-muted-foreground">
                Hidden posts and comments will appear here.
              </p>
            </div>
          )}

          {/* Upvoted Tab */}
          {activeTab === "upvoted" && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">👍</div>
              <h3 className="text-xl font-semibold mb-2">No upvoted content</h3>
              <p className="text-muted-foreground">
                Posts and comments you upvote will appear here.
              </p>
            </div>
          )}

          {/* Downvoted Tab */}
          {activeTab === "downvoted" && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">👎</div>
              <h3 className="text-xl font-semibold mb-2">
                No downvoted content
              </h3>
              <p className="text-muted-foreground">
                Posts and comments you downvote will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
