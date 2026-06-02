import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage       from "./pages/LoginPage.jsx";
import ProjectListPage from "./pages/ProjectListPage.jsx";
import GeneratePage    from "./pages/GeneratePage.jsx";
import ResultPage      from "./pages/ResultPage.jsx";
import HistoryPage     from "./pages/HistoryPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/projects"  element={<ProjectListPage />} />
      <Route path="/generate"  element={<GeneratePage />} />
      <Route path="/result"    element={<ResultPage />} />
      <Route path="/history"   element={<HistoryPage />} />
    </Routes>
  );
}
