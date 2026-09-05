import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import TrendingPage from "./pages/TrendingPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityExplorePage from "./pages/CommunityExplorePage";
import ProfilePage from "./pages/ProfilePage";
import PostSubmissionPage from "./pages/PostSubmissionPage";
import PostViewPage from "./pages/PostViewPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import CommunityCreationPage from "./pages/CommunityCreationPage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#0f0f1a' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#0f0f1a' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="feed" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="communities" element={<CommunityExplorePage />} />
        <Route path="community/:communityId" element={<CommunitiesPage />} />
        <Route path="profile/:userId?" element={<ProfilePage />} />
        <Route path="create-community" element={<ProtectedRoute><CommunityCreationPage /></ProtectedRoute>} />
        <Route path="create" element={<ProtectedRoute><PostSubmissionPage /></ProtectedRoute>} />
        <Route path="post/:postId" element={<PostViewPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="placeholder" element={<PlaceholderPage />} />

    </Routes>
  );
}

export default App;
