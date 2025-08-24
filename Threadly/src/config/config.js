// Frontend Configuration
export const config = {
  // Backend Configuration
  backend: {
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
    socketURL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  },

  // File Upload Configuration
  upload: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/webm", "video/ogg"],
  },

  // UI Configuration
  ui: {
    maxTitleLength: 300,
    maxContentLength: 40000,
    maxPollOptions: 6,
    minPollOptions: 2,
    maxTags: 10,
    maxTagLength: 20,
  },

  // Pagination
  pagination: {
    threadsPerPage: 20,
    postsPerPage: 50,
  },

  // Real-time Configuration
  realtime: {
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
  },
};

// Helper functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFile = (file) => {
  const { maxImageSize, maxVideoSize, allowedImageTypes, allowedVideoTypes } =
    config.upload;

  if (allowedImageTypes.includes(file.type)) {
    return file.size <= maxImageSize;
  }

  if (allowedVideoTypes.includes(file.type)) {
    return file.size <= maxVideoSize;
  }

  return false;
};

export const getFileType = (file) => {
  const { allowedImageTypes, allowedVideoTypes } = config.upload;

  if (allowedImageTypes.includes(file.type)) {
    return "image";
  }

  if (allowedVideoTypes.includes(file.type)) {
    return "video";
  }

  return "unknown";
};

export default config;
