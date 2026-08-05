import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import ExplorePage from "./pages/ExplorePage";
import TrendingPage from "./pages/TrendingPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="communities" element={<CommunitiesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
