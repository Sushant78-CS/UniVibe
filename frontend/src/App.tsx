import { Routes, Route } from "react-router";
import { useEffect } from "react";

import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

import SignInPage from "./pages/auth/signin";
import SignUpPage from "./pages/auth/signup";
import ProfileSetupPage from "./pages/profile/profile-setup";

import HomePage from "./pages/home";
import ProfilePage from "./pages/profile/profile";
import SsoCallback from "./pages/SsoCallback";
import DiscoverPage from "./pages/discover";
import PersonProfilePage from "./pages/profile/PersonProfilePage";

import ConnectionRequests from "./pages/connections/requests";
import Connections from "./pages/connections";

import ClubsPage from "./pages/clubs";
import ClubDetailsPage from "./pages/clubs/clubdetails";

import AdminPage from "./pages/admin/admin";
import ClubApplicationsPage from "./pages/admin/clubapplications";

import NotificationsPage from "./pages/notifications";
import EditProfilePage from "./pages/profile/editprofile";

import Posts from "./pages/posts";
import MessagesPage from "./pages/messages";

import CreatePostPage from "./pages/posts/CreatePostPage";
import PostCameraPage from "./components/posts/create/PostCameraPage";

import PublishProgress from "./components/posts/PublishProgress";
import { initializeForegroundMessages } from "./firebase/messaging";
import { useAuth } from "@clerk/react";
import SettingsPage from "./pages/settings";
import AboutPage from "./pages/about";
import VibePage from "./pages/vibe";
import VibeHome from "./pages/vibe/home";
import EventsPage from "./pages/vibe/events";

function App() {
  const { getToken } = useAuth();
  useEffect(() => {
    initializeForegroundMessages().catch((error) => {
      console.error("FCM foreground initialization failed:", error);
    });
  }, [getToken]);
  return (
    <>
      <PublishProgress />

      <Routes>
        <Route element={<AppLayout />}>
          {/* =========================================
              PUBLIC ROUTES
              ========================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* =========================================
              PROTECTED ROUTES
              ========================================= */}
          <Route element={<ProtectedLayout />}>
            <Route path="/profile/setup" element={<ProfileSetupPage />} />

            <Route path="/sso-callback" element={<SsoCallback />} />

            <Route path="/home" element={<HomePage />} />

            <Route path="/discover" element={<DiscoverPage />} />

            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/profile/:id" element={<PersonProfilePage />} />

            <Route
              path="/connections/requests"
              element={<ConnectionRequests />}
            />

            <Route path="/connections" element={<Connections />} />

            <Route path="/clubs" element={<ClubsPage />} />

            <Route path="/clubs/:id" element={<ClubDetailsPage />} />

            <Route path="/admin" element={<AdminPage />} />

            <Route
              path="/admin/clubs/:id/applications"
              element={<ClubApplicationsPage />}
            />

            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/profile/edit" element={<EditProfilePage />} />

            <Route path="/posts/mine" element={<Posts />} />

            <Route path="/messages" element={<MessagesPage />} />

            <Route
              path="/messages/:conversationId"
              element={<MessagesPage />}
            />

            <Route path="/posts/create" element={<CreatePostPage />} />

            <Route path="/posts/create/camera" element={<PostCameraPage />} />

            <Route path="/vibe/random" element={<VibePage />} />
            <Route path="/vibe/events" element={<EventsPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/vibe" element={<VibeHome />} />

            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
