# Threadly

**Threadly** is a minimal Reddit-like web application built with **MERN stack** (MongoDB, Express, React, Node.js). It allows users to browse threads, create posts, interact with other users, and includes an **admin dashboard** for content and user management.  

---

## Features

### User Features
- User registration and login (JWT-based authentication)  
- Create, edit, and delete posts  
- View posts and threads  
- Comment on posts and threads  
- Responsive UI with reusable components  

### Admin Features
- Admin dashboard (`AdminDashboard.jsx`)  
- Manage users: view, update roles/status, delete  
- Manage posts: view, delete, flag/unflag  
- Manage comments: view, delete  

### Frontend
- Built with React and TailwindCSS  
- Component-based architecture for scalability  
- `Home.jsx`, `Profile.jsx`, `CreateThread.jsx`, `ThreadDetail.jsx`, `NotFound.jsx`  
- `AuthContext.jsx` for global authentication state  

### Backend
- Node.js with Express for API routes  
- MongoDB with Mongoose models for User, Post, and Comment  
- Routes organized under `routes/` and controllers under `controllers/`  
- `api.js` for API calls, `config.js` for Cloudinary uploads, `util.js` for helpers  

---

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI components  
- **Backend:** Node.js, Express  
- **Database:** MongoDB (Mongoose)  
- **File Storage:** Cloudinary (images/videos)  
- **Authentication:** JWT-based auth with React Context API  

---

## Project Structure
Threadly/
│
├── Server/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ └── server.js
│
├── Client/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Home.jsx
│ │ │ ├── Profile.jsx
│ │ │ ├── CreateThread.jsx
│ │ │ ├── ThreadDetail.jsx
│ │ │ ├── NotFound.jsx
│ │ │ └── AdminDashboard.jsx
│ │ ├── context/
│ │ │ └── AuthContext.jsx
│ │ ├── utils/
│ │ │ ├── api.js
│ │ │ └── util.js
│ │ ├── config/
│ │ │ └── config.js
│ │ ├── main.jsx
│ │ ├── App.jsx
│ │ └── index.css, app.css
│ └── package.json
│
└── README.md

---

## Usage
  Navigate to the Home Page to browse threads
  Login or register to create posts and comments
  Admin users can access the Admin Dashboard to manage content and users


## Project Structure

