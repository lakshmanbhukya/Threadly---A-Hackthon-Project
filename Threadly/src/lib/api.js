import axios from "axios";
import { config } from "../config/config";

// API Configuration
const API_BASE = config.backend.baseURL;

// Create axios instance with session support
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to handle session
api.interceptors.request.use(
  (config) => {
    // Add any additional headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No global redirect here! Let AuthContext handle 401s.
    return Promise.reject(error);
  }
);

// Authentication APIs
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get("/users/auto-login");
    return response.data;
  } catch (err) {
    console.error("Authentication check failed:", err);
    throw new Error("Authentication check failed");
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/users/logout");
    return response.data;
  } catch (err) {
    console.error("Logout failed:", err);
    throw new Error("Logout failed");
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put("/users/profile", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Profile update failed");
  }
};

// Thread APIs
export const fetchThreads = async (params = {}) => {
  try {
    const response = await api.get("/threads", { params });
    return response.data;
  } catch (error) {
    // Return dummy data if backend is unavailable
    console.warn("Backend unavailable, using dummy data:", error.message);
    return {
      threads: [
        {
          _id: "1",
          title: "Welcome to Threadly!",
          description:
            "This is a sample thread to get you started. The backend is currently unavailable.",
          topic: "general",
          createdBy: { username: "ThreadlyBot" },
          likes: [],
          createdAt: new Date().toISOString(),
          replyCount: 0,
        },
        {
          _id: "2",
          title: "Getting Started with Threadly",
          description:
            "Learn how to create threads, post content, and engage with the community.",
          topic: "help",
          createdBy: { username: "ThreadlyBot" },
          likes: [],
          createdAt: new Date().toISOString(),
          replyCount: 0,
        },
      ],
    };
  }
};

export const fetchThreadById = async (id) => {
  try {
    const response = await api.get(`/threads/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch thread");
  }
};

export const createThread = async (threadData) => {
  try {
    // Handle different post types
    const formData = new FormData();

    if (threadData.postType === "media" && threadData.mediaFiles?.length > 0) {
      // Add media files
      threadData.mediaFiles.forEach((file) => {
        formData.append("media", file);
      });
    }

    // Add other fields
    formData.append("title", threadData.title);
    formData.append("description", threadData.content || "");
    formData.append("topic", threadData.topic);
    formData.append("postType", threadData.postType);

    if (threadData.tags?.length > 0) {
      formData.append("tags", JSON.stringify(threadData.tags));
    }

    if (threadData.postType === "link" && threadData.linkUrl) {
      formData.append("linkUrl", threadData.linkUrl);
    }

    if (threadData.postType === "poll" && threadData.pollOptions) {
      formData.append("pollOptions", JSON.stringify(threadData.pollOptions));
    }

    const response = await api.post("/threads/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create thread");
  }
};

export const updateThread = async (id, threadData) => {
  try {
    const response = await api.put(`/threads/${id}`, threadData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update thread");
  }
};

export const likeThread = async (id) => {
  try {
    const response = await api.post(`/threads/${id}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to like thread");
  }
};

export const voteOnPoll = async (threadId, optionIndex) => {
  try {
    const response = await api.post(`/threads/${threadId}/poll-vote`, {
      optionIndex,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to vote on poll");
  }
};

// Post APIs
export const fetchPosts = async (threadId, params = {}) => {
  try {
    const response = await api.get("/posts", {
      params: { threadId, ...params },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch posts");
  }
};

export const fetchPostById = async (id) => {
  try {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch post");
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts/create", postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create post");
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update post");
  }
};

export const likePost = async (id) => {
  try {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to like post");
  }
};

// Data transformation helpers
export const transformThread = (backendThread) => {
  return {
    id: backendThread._id,
    title: backendThread.title,
    content: backendThread.description,
    topicName: backendThread.topic,
    author: backendThread.createdBy?.username || "Anonymous",
    authorAvatar: null, // Add if you have avatar support
    upvotes: backendThread.likes?.length || 0,
    downvotes: 0, // Backend doesn't have downvotes yet
    replyCount: backendThread.replyCount || 0,
    createdAt: backendThread.createdAt,
    postType: backendThread.postType || "thread",
    tags: backendThread.tags || [],
    mediaFiles: backendThread.mediaFiles || [],
    linkUrl: backendThread.linkUrl || "",
    pollOptions: backendThread.pollOptions || [],
  };
};

export const transformPost = (backendPost) => {
  return {
    id: backendPost._id,
    content: backendPost.content,
    author: backendPost.createdBy?.username || "Anonymous",
    upvotes: backendPost.likes?.length || 0,
    downvotes: 0, // Backend doesn't have downvotes yet
    createdAt: backendPost.createdAt,
    media: backendPost.media || [],
    isAnonymous: backendPost.isAnonymous || false,
  };
};

export default api;
