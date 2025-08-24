import axios from "axios";
import { API_CONFIG, getApiUrl } from "../config/apiConfig";

const API_BASE = API_CONFIG.BASE_URL;

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
    const response = await api.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.AUTO_LOGIN);
    return response.data;
  } catch (err) {
    // Silently handle auth check failures (401 is expected when not logged in)
    if (err.response?.status === 401) {
      return { user: null };
    }
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch (err) {
    throw new Error("Logout failed");
  }
};

export const fetchProfile = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch profile");
  }
};

export const fetchUserProfile = async (username) => {
  try {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.AUTH.PROFILE}/${username}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch user profile"
    );
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Profile update failed");
  }
};

// Thread APIs
export const fetchThreads = async (params = {}) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.THREADS.BASE, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch threads");
  }
};

export const fetchThreadById = async (id) => {
  try {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.THREADS.BASE}/${id}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch thread");
  }
};

export const createThread = async (threadData) => {
  try {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.THREADS.CREATE,
      threadData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Create Thread Error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to create thread");
  }
};

export const updateThread = async (id, threadData) => {
  try {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.THREADS.BASE}/${id}`,
      threadData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update thread");
  }
};

export const likeThread = async (id) => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.THREADS.LIKE(id));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to like thread");
  }
};

export const voteOnPoll = async (threadId, optionIndex) => {
  try {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.THREADS.BASE}/${threadId}/poll-vote`,
      {
        optionIndex,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to vote on poll");
  }
};

// Post APIs
export const fetchPosts = async (threadId, params = {}) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.BASE, {
      params: {
        threadId,
        sortBy: "likes", // Add this
        order: "desc", // Add this
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch posts");
  }
};

export const fetchAllRecentPosts = async (params = {}) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.BASE, {
      params: { ...params, limit: 10 },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch recent posts"
    );
  }
};

export const fetchPostById = async (id) => {
  try {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.POSTS.BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch post");
  }
};

export const createPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append("content", postData.content);
    if (postData.threadId) formData.append("threadId", postData.threadId);
    if (postData.isAnonymous)
      formData.append("isAnonymous", postData.isAnonymous);

    if (postData.mediaFiles?.length > 0) {
      postData.mediaFiles.forEach((file) => {
        formData.append("media", file);
      });
    }

    const response = await api.post(
      API_CONFIG.ENDPOINTS.POSTS.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create post");
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.POSTS.BASE}/${id}`,
      postData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update post");
  }
};

export const likePost = async (id) => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.LIKE(id));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to like post");
  }
};

// Notification APIs
export const fetchNotifications = async (params = {}) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch notifications"
    );
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await api.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to mark notification as read"
    );
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to mark all notifications as read"
    );
  }
};

// Comment APIs
export const fetchThreadComments = async (threadId) => {
  try {
    const response = await api.get(`/comments/thread/${threadId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch comments");
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await api.post("/comments/create", commentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create comment");
  }
};

export const likeComment = async (id) => {
  try {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to like comment");
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete comment");
  }
};

// Admin APIs
export const fetchAdminUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch users");
  }
};

export const fetchAdminThreads = async () => {
  try {
    const response = await api.get("/admin/threads");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch threads");
  }
};

export const fetchAdminPosts = async () => {
  try {
    const response = await api.get("/admin/posts");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch posts");
  }
};

export const deleteAdminUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete user");
  }
};

export const deleteAdminThread = async (id) => {
  try {
    const response = await api.delete(`/admin/threads/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete thread");
  }
};

export const deleteAdminPost = async (id) => {
  try {
    const response = await api.delete(`/admin/posts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete post");
  }
};

export const toggleUserAdmin = async (id) => {
  try {
    const response = await api.put(`/admin/users/${id}/admin`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update admin status"
    );
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
