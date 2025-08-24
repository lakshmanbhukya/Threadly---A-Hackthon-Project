import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { createThread } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";
import {
  MessageSquare,
  FileImage,
  Globe,
  Hash,
  Upload,
  X,
  Calendar,
  Tag,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Eye,
  EyeOff,
} from "lucide-react";

export default function CreateThread() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState("Threadly");
  const [postType, setPostType] = useState("thread");
  const [showSubredditDropdown, setShowSubredditDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subreddit: "",
    tags: [],
    mediaFiles: [],
    linkUrl: "",
    pollOptions: ["", ""],
  });

  const postTypes = [
    {
      id: "thread",
      label: "Thread",
      icon: MessageSquare,
      description: "Start a discussion",
    },
    {
      id: "media",
      label: "Images & Video",
      icon: FileImage,
      description: "Share photos and videos",
    },
    {
      id: "link",
      label: "Link",
      icon: Globe,
      description: "Share a link",
    },
    {
      id: "poll",
      label: "Poll",
      icon: Hash,
      description: "Create a poll",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    const newTag = formData.tags[formData.tags.length - 1] || "";
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const selectCommunity = (community) => {
    setSelectedCommunity(community);
    setShowDropdown(false);
  };

  const addPollOption = () => {
    if (formData.pollOptions.length < 6) {
      setFormData((prev) => ({
        ...prev,
        pollOptions: [...prev.pollOptions, ""],
      }));
    }
  };

  const removePollOption = (index) => {
    if (formData.pollOptions.length > 2) {
      setFormData((prev) => ({
        ...prev,
        pollOptions: prev.pollOptions.filter((_, i) => i !== index),
      }));
    }
  };

  const updatePollOption = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      pollOptions: prev.pollOptions.map((opt, i) =>
        i === index ? value : opt
      ),
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize =
        file.size <=
        (file.type.startsWith("image/") ? 5 * 1024 * 1024 : 50 * 1024 * 1024);

      if (!isValidType) {
        setError("Only image and video files are allowed");
        return false;
      }

      if (!isValidSize) {
        setError(
          `File size must be under ${
            file.type.startsWith("image/") ? "5MB" : "50MB"
          }`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...validFiles],
      }));
      setError("");
    }
  };

  const removeMediaFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      if (!formData.subreddit.trim()) {
        throw new Error("Subreddit is required");
      }

      if (postType === "media" && formData.mediaFiles.length === 0) {
        throw new Error("Please select at least one media file");
      }

      if (postType === "link" && !formData.linkUrl.trim()) {
        throw new Error("Link URL is required");
      }

      if (postType === "poll") {
        const validOptions = formData.pollOptions.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          throw new Error("At least 2 poll options are required");
        }
      }

      const threadData = {
        title: formData.title,
        description: formData.content,
        topic: formData.subreddit,
        postType: postType,
        tags: formData.tags,
        ...(postType === "link" && { linkUrl: formData.linkUrl }),
        ...(postType === "poll" && {
          pollOptions: formData.pollOptions.filter((opt) => opt.trim()),
        }),
        ...(postType === "media" && { mediaFiles: formData.mediaFiles }),
      };

      await createThread(threadData);

      setSuccess(true);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create thread");
    } finally {
      setLoading(false);
    }
  };

  const renderPostTypeContent = () => {
    switch (postType) {
      case "thread":
        return (
          <div className="space-y-4">
            <div className="border border-border rounded-lg">
              <div className="border-b border-border p-3 bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bold className="h-4 w-4" />
                  <Italic className="h-4 w-4" />
                  <List className="h-4 w-4" />
                  <ListOrdered className="h-4 w-4" />
                  <Link className="h-4 w-4" />
                  <Code className="h-4 w-4" />
                  <Quote className="h-4 w-4" />
                  <div className="ml-auto">
                    <button
                      type="button"
                      className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary-hover"
                    >
                      Markdown
                    </button>
                  </div>
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full p-4 border-0 focus:ring-0 resize-none min-h-[200px] bg-transparent text-foreground placeholder:text-muted-foreground"
                maxLength={40000}
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {formData.content.length}/40,000
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Upload Images & Videos
                </h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop files here, or click to browse
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-hover cursor-pointer"
                >
                  Choose Files
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Images up to 5MB, Videos up to 50MB
                </p>
              </div>
            </div>

            {formData.mediaFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Selected Files:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-accent rounded-lg flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <FileImage className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">
                              {file.name}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMediaFile(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive-hover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "link":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL
              </label>
              <Input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => handleInputChange("linkUrl", e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Add a description..."
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none min-h-[100px] bg-transparent text-foreground placeholder:text-muted-foreground"
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {formData.content.length}/1,000
              </div>
            </div>
          </div>
        );

      case "poll":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Question
              </label>
              <Input
                type="text"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Ask a question..."
                className="w-full"
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {formData.content.length}/300
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Options
              </label>
              <div className="space-y-2">
                {formData.pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="text-destructive hover:text-destructive-hover"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={addPollOption}
                  className="text-primary hover:text-primary-hover text-sm mt-2"
                >
                  + Add option
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {formData.pollOptions.length}/6 options
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Please log in to create a thread
          </h2>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create post
            </h1>
            <a
              href="#"
              className="text-primary hover:text-primary-hover text-sm"
            >
              Drafts
            </a>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              Community
            </label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">
                    T
                  </span>
                </div>
                <span className="text-foreground font-medium">
                  {selectedCommunity}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-lg bg-card shadow-lg z-10">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => selectCommunity("Threadly")}
                    className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        T
                      </span>
                    </div>
                    <span>Threadly</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Post Type Tabs */}
          <div className="border-b border-border">
            <div className="flex space-x-1">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`flex-1 flex flex-col items-center p-4 rounded-t-lg transition-colors ${
                    postType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <type.icon className="h-5 w-5 mb-1" />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs opacity-75">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Title"
              className="w-full text-lg"
              maxLength={300}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {formData.title.length}/300
            </div>
          </div>

          {/* Subreddit Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              Subreddit
            </label>
            <button
              type="button"
              onClick={() => setShowSubredditDropdown(!showSubredditDropdown)}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {formData.subreddit || "Choose a subreddit"}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  showSubredditDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showSubredditDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-lg bg-card shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {[
                    "Technology",
                    "Gaming",
                    "News",
                    "Sports",
                    "Entertainment",
                  ].map((subreddit) => (
                    <button
                      key={subreddit}
                      type="button"
                      onClick={() => {
                        handleInputChange("subreddit", subreddit);
                        setShowSubredditDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-3"
                    >
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>r/{subreddit}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags (optional)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={formData.tags[formData.tags.length - 1] || ""}
                onChange={(e) => {
                  const newTags = [...formData.tags];
                  newTags[newTags.length - 1] = e.target.value;
                  setFormData((prev) => ({ ...prev, tags: newTags }));
                }}
                placeholder="Add a tag"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="px-4"
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary hover:text-primary-hover"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Type Specific Content */}
          {renderPostTypeContent()}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-600 text-sm">
                Thread created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="px-6"
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-primary hover:bg-primary-hover"
            >
              {loading ? "Creating..." : "Post"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Please be mindful of Threadly's{" "}
              <a href="#" className="text-primary hover:underline">
                content policy
              </a>{" "}
              and remember the human.
            </p>
            <p>© 2024 Threadly. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
