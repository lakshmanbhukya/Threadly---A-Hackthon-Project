export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE || "http://3.110.124.251:3000",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://3.110.124.251:3000",
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
    },
    CHAT: {
      CONVERSATIONS: "/chat/conversations",
      MESSAGES: (id) => `/chat/conversations/${id}/messages`,
      SEND_MESSAGE: (id) => `/chat/conversations/${id}/messages`,
      MARK_READ: (id) => `/chat/conversations/${id}/read`,
      ONLINE_USERS: "/chat/users/online"
    }
  }
};

export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
export const getSocketUrl = () => API_CONFIG.SOCKET_URL;