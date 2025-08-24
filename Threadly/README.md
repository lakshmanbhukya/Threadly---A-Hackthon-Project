# Threadly - Reddit-like Discussion Platform

A modern, responsive discussion platform built with React, featuring a Reddit-like UI and full backend integration.

## 🚀 Features

- **Reddit-like UI**: Clean, modern interface with voting, comments, and topics
- **Real-time Backend**: Full integration with Express.js backend
- **Session Authentication**: Secure user authentication with session management
- **Responsive Design**: Mobile-first design that works on all devices
- **Topic Management**: Organize discussions by categories
- **Voting System**: Upvote/downvote threads and comments
- **Real-time Updates**: Live notifications and updates

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client for API calls

### Backend Integration

- **Express.js** - RESTful API endpoints
- **Session-based Auth** - Secure user authentication
- **MongoDB** - Database storage
- **Socket.IO** - Real-time features

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── ThreadCard.jsx  # Thread display component
│   └── ReplyCard.jsx   # Comment/reply component
├── pages/               # Page components
│   ├── Home.jsx        # Main feed page
│   ├── ThreadDetail.jsx # Single thread view
│   ├── CreateThread.jsx # Thread creation form
│   ├── Login.jsx       # User authentication
│   └── Register.jsx    # User registration
├── contexts/            # React contexts
│   └── AuthContext.jsx # Authentication state
├── lib/                 # Utility functions
│   └── api.js          # API wrapper and data transformation
└── App.jsx             # Main application component
```

## 🔧 Backend Integration

The frontend is fully integrated with your Express.js backend:

### API Endpoints

- **`/users`** - User authentication and management
- **`/threads`** - Thread CRUD operations
- **`/posts`** - Post/reply management
- **`/notifications`** - User notifications

### Data Mapping

The frontend automatically transforms backend data to match the UI expectations:

- Backend `description` → Frontend `content`
- Backend `topic` → Frontend `topicName`
- Backend `createdBy.username` → Frontend `author`

### Authentication

- Session-based authentication using cookies
- Automatic session validation on app start
- Protected routes for authenticated users

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Your Express.js backend running on port 3000

### Installation

1. **Clone and install dependencies:**

   ```bash
   cd Threadly
   npm install
   ```

2. **Configure API endpoint:**
   Create a `.env` file in the Threadly directory:

   ```env
   VITE_API_BASE=http://localhost:3000
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Backend Setup

Ensure your Express.js backend is running:

```bash
cd Server
npm install
npm start
```

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with username, email, and password
2. **Login**: Users authenticate with username/email + password
3. **Session Management**: Backend maintains user sessions
4. **Protected Routes**: Create threads and post comments require authentication
5. **Auto-login**: App checks session status on startup

## 📱 Features

### Thread Management

- Create new discussion threads
- Organize by topics (Technology, Gaming, Science, etc.)
- Rich text content with markdown support
- Topic-based filtering and sorting

### Interaction System

- Upvote/downvote threads and comments
- Reply to threads and comments
- Real-time comment updates
- User reputation tracking

### User Experience

- Responsive design for all devices
- Dark/light theme support
- Search functionality
- Topic-based navigation
- User profile management

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:

- **Button** - Multiple variants and sizes
- **Input** - Form inputs with validation
- **Textarea** - Multi-line text input
- **Badge** - Topic and status indicators
- **Card** - Content containers
- **Modal** - Overlay dialogs

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for code quality
- Prettier for consistent formatting
- Component-based architecture
- Custom hooks for reusable logic

## 🌐 Deployment

### Frontend

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend

Ensure your Express.js backend is deployed and accessible, then update the `VITE_API_BASE` environment variable.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include backend logs if applicable

---

**Threadly** - Building meaningful discussions, one thread at a time. 🧵✨
