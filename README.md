# UniVibe

UniVibe is a student-focused social and networking platform designed to
bring college communities together in one place.

## 🌐 Live Project

- Frontend: https://uni-vibe-479c.vercel.app
- Backend: https://univibe-1-4ry0.onrender.com

## ✨ Features

### 🏠 Home & Discover

- Student-focused home experience
- Discover other students
- View student profiles
- Send and manage connections

### 👤 Profiles

- Profile setup
- Edit profile
- Profile pictures
- View other students' profiles

### 📝 Posts

- Create posts
- Share college events, news, updates and other content
- View all posts
- View your own posts
- Media uploads

### 💬 Messaging

- One-to-one conversations
- Real-time messaging
- Conversation history
- Read status

### 📡 Vibe

Vibe is UniVibe's anonymous real-time community space.

- Anonymous group messaging
- Real-time WebSocket communication
- Text, images, GIFs and PDFs
- GIPHY GIF picker
- Full-screen image/GIF viewer
- Mobile-friendly composer

### 🎉 Events

- Browse events
- Create and edit events
- Event registration
- Custom registration forms
- Admin response dashboard
- Registration data export

### 🏫 Clubs

- Browse clubs
- Club details
- Club applications
- Admin club management

### 🔔 Notifications

- Firebase Cloud Messaging
- Foreground notifications
- Background notifications
- Notification click navigation

### ⚙️ Other

- Settings
- About page
- Responsive light/dark UI

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- TanStack Query
- Clerk
- Firebase Cloud Messaging
- Cloudinary
- GIPHY API

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Web
- Spring WebSocket
- STOMP / SockJS
- OAuth 2.0 Resource Server
- JWT
- JPA / Hibernate
- Maven

### Deployment

- Frontend: Vercel
- Backend: Render
- Authentication: Clerk
- Media: Cloudinary
- Push notifications: Firebase Cloud Messaging
- GIFs: GIPHY

## 🏗️ Architecture

```text
React + TypeScript Frontend
          |
          +------ REST API ------> Spring Boot Backend
          |                              |
          |                              +--> Database
          |
          +------ WebSocket ----> STOMP / SockJS
          |
          +------ Upload -------> Cloudinary
          |
          +------ Auth ---------> Clerk
          |
          +------ Push ---------> Firebase
          |
          +------ GIF API ------> GIPHY
```

## 🔐 Authentication

UniVibe uses Clerk for authentication.

The frontend sends Clerk JWTs to protected Spring Boot REST endpoints
using:

```http
Authorization: Bearer <JWT>
```

The backend validates these JWTs through Spring Security's OAuth2
Resource Server.

WebSocket STOMP connections are also authenticated using the Clerk JWT
during the STOMP `CONNECT` request.

## 📡 Real-Time Vibe

Vibe uses WebSocket communication for real-time anonymous messaging.

```text
Client
  |
  | STOMP / SockJS
  v
/ws
  |
  v
Spring WebSocket
  |
  v
/topic/vibe
```

Vibe responses do not expose the sender's real identity.

## ☁️ Media

Images and GIFs are uploaded directly from the frontend to Cloudinary.
PDFs are also uploaded using the appropriate Cloudinary resource type.

The backend stores media URLs and media types rather than the actual
files.

Supported Vibe media types:

```text
IMAGE
GIF
PDF
```

## 🎞️ GIPHY

Vibe uses the GIPHY API for trending and searchable GIFs.

Frontend environment variable:

```env
VITE_GIPHY_API_KEY=your_giphy_api_key
```

The GIF picker includes GIPHY attribution.

## 🔔 Firebase Notifications

Firebase Cloud Messaging is used for browser push notifications.

The Firebase messaging service worker is located at:

```text
frontend/public/firebase-messaging-sw.js
```

It handles background notifications and notification-click navigation.

## 📁 Project Structure

```text
DSAProject/
├── backend/
│   └── src/
│
├── frontend/
│   ├── public/
│   │   ├── firebase-messaging-sw.js
│   │   └── favicon-package/
│   │
│   └── src/
│       ├── api/
│       ├── components/
│       ├── firebase/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── utils/
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install:

- Node.js
- npm
- Java
- Maven
- A database configured for the backend

You also need accounts/configuration for Clerk, Firebase, Cloudinary and
GIPHY.

### Clone

```bash
git clone <your-repository-url>
cd DSAProject
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔑 Environment Variables

Do not commit credentials to GitHub.

Example frontend variables:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

VITE_GIPHY_API_KEY=your_giphy_api_key
```

Configure production values through Vercel/Render environment variables.

## 🧪 Build

Frontend production build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Backend:

```bash
./mvnw clean package
```

## 🔒 Security

- Protected REST endpoints require authentication.
- Clerk JWTs are validated by the backend.
- WebSocket STOMP connections are authenticated.
- Anonymous Vibe responses do not expose sender identity.
- Credentials should never be committed to Git.
- CORS is configured for the UniVibe frontend and local development.

## 📱 Responsive Design

UniVibe supports desktop, tablet and mobile layouts.

The Vibe experience includes a responsive composer, touch-friendly
controls, media previews, a mobile-friendly GIF picker and full-screen
media viewing.

## 🗺️ Main Routes

```text
/
 /signup
 /home
 /discover
 /profile
 /connections
 /connections/requests
 /clubs
 /messages
 /messages/:conversationId
 /posts/mine
 /posts/create
 /notifications
 /settings
 /about

 /vibe
 /vibe/random
 /vibe/events
 /vibe/events/create
 /vibe/events/:eventId
 /vibe/events/:eventId/register
 /vibe/events/:eventId/edit
 /vibe/events/:eventId/responses
```

## 🤝 Contributing

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

After making and testing changes:

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 📌 Project Status

UniVibe is actively being developed as a complete student social and
networking platform.

Current major modules:

- Authentication
- Profiles
- Discover
- Connections
- Posts
- Messaging
- Clubs
- Events
- Notifications
- Anonymous Vibe

---

**UniVibe --- Connect. Share. Discover.**

Built with React, TypeScript, Spring Boot and modern web technologies.
