import React, { useState } from "react";
import { Button } from "./ui/button";

// PostForm: for creating threads or replies
const PostForm = ({ onSubmit, loading, isReply = false }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReply && !title.trim()) {
      setError("Title is required");
      return;
    }
    if (!body.trim()) {
      setError("Body is required");
      return;
    }
    setError("");
    onSubmit && onSubmit({ title, body });
    setTitle("");
    setBody("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-lg shadow-card p-5 border border-gray-100 mb-4"
    >
      {!isReply && (
        <input
          className="w-full mb-3 px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
      )}
      <textarea
        className="w-full mb-3 px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={isReply ? "Write a reply..." : "Body"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={isReply ? 2 : 4}
        disabled={loading}
      />
      {error && <div className="text-danger text-sm mb-2">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : isReply ? "Reply" : "Post Thread"}
      </Button>
    </form>
  );
};

export default PostForm;
