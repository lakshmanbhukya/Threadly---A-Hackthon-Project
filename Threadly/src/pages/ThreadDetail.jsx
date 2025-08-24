import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchThreadById,
  fetchPosts,
  createPost,
  transformThread,
  transformPost,
} from "../lib/api";
import ReplyCard from "../components/ReplyCard";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/Textarea";
import {
  ArrowLeft,
  Send,
  Image,
  Link,
  Hash,
  MessageSquare,
} from "lucide-react";

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadThreadAndPosts();
  }, [id, loadThreadAndPosts]);

  const loadThreadAndPosts = useCallback(async () => {
    setLoading(true);
    try {
      // Load thread details
      const backendThread = await fetchThreadById(id);
      const transformedThread = transformThread(backendThread);

      // Load posts for this thread
      const postsData = await fetchPosts(id);
      const transformedPosts = postsData.posts.map(transformPost);

      // Update reply count
      transformedThread.replyCount = transformedPosts.length;

      setThread(transformedThread);
      setPosts(transformedPosts);
      setError(null);
    } catch (err) {
      console.error("Failed to load thread:", err);
      setError("Failed to load thread");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleThreadVote = (voteType) => {
    if (!thread) return;

    const newThread = { ...thread };
    if (voteType === "up") {
      if (thread.isUpvoted) {
        newThread.upvotes--;
        newThread.isUpvoted = false;
      } else {
        newThread.upvotes++;
        newThread.isUpvoted = true;
        if (thread.isDownvoted) {
          newThread.downvotes--;
          newThread.isDownvoted = false;
        }
      }
    } else {
      if (thread.isDownvoted) {
        newThread.downvotes--;
        newThread.isDownvoted = false;
      } else {
        newThread.downvotes++;
        newThread.isDownvoted = true;
        if (thread.isUpvoted) {
          newThread.upvotes--;
          newThread.isUpvoted = false;
        }
      }
    }
    setThread(newThread);
  };

  const handleCommentVote = (commentId, voteType) => {
    if (!thread) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === commentId) {
          const newPost = { ...post };
          if (voteType === "up") {
            if (post.isUpvoted) {
              newPost.upvotes--;
              newPost.isUpvoted = false;
            } else {
              newPost.upvotes++;
              newPost.isUpvoted = true;
              if (post.isDownvoted) {
                newPost.downvotes--;
                newPost.isDownvoted = false;
              }
            }
          } else {
            if (post.isDownvoted) {
              newPost.downvotes--;
              newPost.isDownvoted = false;
            } else {
              newPost.downvotes++;
              newPost.isDownvoted = true;
              if (post.isUpvoted) {
                newPost.upvotes--;
                newPost.isUpvoted = false;
              }
            }
          }
          return newPost;
        }
        return post;
      })
    );
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
          <div className="mt-4">
            {thread.mediaFiles && thread.mediaFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {thread.mediaFiles.map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Video</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {thread.content && (
              <p className="mt-4 text-foreground text-lg leading-relaxed">
                {thread.content}
              </p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mt-4">
            {thread.content && (
              <p className="text-foreground text-lg leading-relaxed mb-4">
                {thread.content}
              </p>
            )}
            {thread.linkUrl && (
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Link className="h-4 w-4" />
                  <span>Link</span>
                </div>
                <a
                  href={thread.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover break-all text-lg"
                >
                  {thread.linkUrl}
                </a>
              </div>
            )}
          </div>
        );

      case "poll":
        return (
          <div className="mt-4">
            {thread.content && (
              <p className="text-foreground text-lg leading-relaxed mb-4">
                {thread.content}
              </p>
            )}
            {thread.pollOptions && thread.pollOptions.length > 0 && (
              <div className="space-y-3">
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
                      <div className="w-full p-4 border border-border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-foreground font-medium">
                            {option.text}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {optionVotes} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-sm text-muted-foreground mt-3">
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
          <div className="mt-4">
            {thread.content && (
              <p className="text-foreground text-lg leading-relaxed">
                {thread.content}
              </p>
            )}
          </div>
        );
    }
  };

  const handleReply = async (content) => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newPostData = {
        content: content.trim(),
        threadId: id,
        isAnonymous: false,
      };

      const response = await createPost(newPostData);
      const newPost = transformPost(response.post);

      // Add the new post to the beginning of the list
      setPosts((prev) => [newPost, ...prev]);

      // Update thread reply count
      setThread((prev) => ({
        ...prev,
        replyCount: (prev.replyCount || 0) + 1,
      }));

      setReplyContent("");
    } catch (err) {
      console.error("Failed to create reply:", err);
      setError("Failed to create reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold mb-2">Thread not found</h2>
        <p className="text-muted-foreground mb-4">
          The thread you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold mb-2">Thread not found</h2>
        <p className="text-muted-foreground mb-4">
          The thread you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Threads
        </Button>
      </div>

      {/* Thread content */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleThreadVote("up")}
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                thread.isUpvoted ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-lg font-semibold text-foreground">
              {thread.upvotes - thread.downvotes}
            </span>
            <button
              onClick={() => handleThreadVote("down")}
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                thread.isDownvoted ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Thread Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">
                by u/{thread.author}
              </span>
              <span className="text-sm text-muted-foreground">
                • {new Date(thread.createdAt).toLocaleDateString()}
              </span>
              <span className="text-sm text-muted-foreground">
                • {getPostTypeLabel(thread.postType)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {thread.title}
            </h1>
            {renderPostContent(thread)}

            {/* Thread actions */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
              <span>Score: {thread.upvotes - thread.downvotes}</span>
              <span>•</span>
              <span>{thread.replyCount} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Add a comment</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReply(replyContent);
          }}
        >
          <Textarea
            className="mb-3"
            rows="3"
            placeholder="What are your thoughts?"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Comments ({posts.length})
        </h2>

        {posts.length > 0 ? (
          posts.map((post) => (
            <ReplyCard
              key={post.id}
              {...post}
              onUpvote={() => handleCommentVote(post.id, "up")}
              onDownvote={() => handleCommentVote(post.id, "down")}
              onReply={(content) => handleReply(content)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-4xl mb-2">💬</div>
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
