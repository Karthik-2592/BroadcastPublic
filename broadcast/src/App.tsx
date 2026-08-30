import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="communities" element={<CommunityExplorePage />} />
        <Route path="community/:communityId" element={<CommunitiesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="create-community" element={<CommunityCreationPage />} />
        <Route path="create" element={<PostSubmissionPage />} />
        <Route path="post/:postId" element={<PostViewPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="placeholder" element={<PlaceholderPage />} />

    </Routes>
  );
}

export default App;
