export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  ENDPOINTS: {
    HEALTH: "/health",
    AUTH: {
      LOGIN: "/users/login",
      REGISTER: "/users/register",
      LOGOUT: "/users/logout",
      AUTO_LOGIN: "/users/auto-login",
      PROFILE: "/users/profile"
    },
    THREADS: {
      BASE: "/threads",
      CREATE: "/threads/create",
      LIKE: (id) => `/threads/${id}/like`
    },
    POSTS: {
      BASE: "/posts",
      CREATE: "/posts/create",
      LIKE: (id) => `/posts/${id}/like`
    },
    NOTIFICATIONS: {
      BASE: "/notifications",
      READ: (id) => `/notifications/${id}/read`,
      READ_ALL: "/notifications/read-all"
    }
  }
};

export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
export const getSocketUrl = () => API_CONFIG.SOCKET_URL;