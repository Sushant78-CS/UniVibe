import { Routes, Route } from "react-router";

import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

import SignInPage from "./pages/auth/signin";
import SignUpPage from "./pages/auth/signup";
import ProfileSetupPage from "./pages/profile/profile-setup";
import HomePage from "./pages/home";
import ProfilePage from "./pages/profile/profile";
import SsoCallback from "./components/auth/SsoCallback";

import { useAuth } from "./hooks/useAuth";
import DiscoverPage from "./pages/discover";
import PersonProfilePage from "./components/discover/PersonProfilePage";
import ConnectionRequests from "./pages/connections/requests";
import Connections from "./pages/connections";
import ClubsPage from "./pages/clubs";
import ClubDetailsPage from "./pages/clubs/clubdetails";

function App() {
  // Initialize Firebase auth listener
  useAuth();

  return (
    <Routes>
      {/* ================================================= */}
      {/* APP LAYOUT */}
      {/* ================================================= */}

      <Route element={<AppLayout />}>
        {/* ================================================= */}
        {/* PUBLIC LAYOUT */}
        {/* ================================================= */}

        <Route element={<PublicLayout />}>
          <Route path="/" element={<SignInPage />} />

          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* ================================================= */}
        {/* PROTECTED LAYOUT */}
        {/* ================================================= */}

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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
