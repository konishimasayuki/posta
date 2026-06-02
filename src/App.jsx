import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage        from "./pages/LoginPage.jsx";
import ProjectListPage  from "./pages/ProjectListPage.jsx";
import GeneratePage     from "./pages/GeneratePage.jsx";
import ResultPage       from "./pages/ResultPage.jsx";
import HistoryPage      from "./pages/HistoryPage.jsx";
import MyPage           from "./pages/MyPage.jsx";
import AdminPage        from "./pages/AdminPage.jsx";
import ExplorePage      from "./pages/ExplorePage.jsx";
import BottomNav        from "./components/BottomNav.jsx";

function Layout() {
  const location = useLocation();
  const hideNav = ["/login"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/result"   element={<ResultPage />} />
        <Route path="/history"  element={<HistoryPage />} />
        <Route path="/mypage"   element={<MyPage />} />
        <Route path="/admin"    element={<AdminPage />} />
        <Route path="/explore"  element={<ExplorePage />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return <Layout />;
}
