import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
import RootLayout from "./components/RootLayout";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Home from "./pages/Home";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import ChatWithAgent from "./pages/Dashboard/ChatWithAgent";
import Dashboard from "./pages/Dashboard/Dashboard";
import PublicRoutes from "./components/PublicRoutes";
import ProtectedRoute from "./components/ProtectedRoutes";
import AgentBuilder from "./pages/Dashboard/AgentBuilder";
import ToolManager from "./pages/Dashboard/ToolManager";
import HistoryAnalytics from "./pages/Dashboard/HistoryAnalytics";
import Settings from "./pages/Dashboard/Settings";
import ManageRoles from "./pages/Dashboard/ManageRoles";
import RoleAssign from "./pages/Auth/RoleAssign";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<PublicRoutes><Login /></PublicRoutes>} />
        <Route path="role-selection" element={<PublicRoutes><RoleAssign /></PublicRoutes>} />
        <Route path="signup" element={<PublicRoutes><Signup /></PublicRoutes>} />

        <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="chatwithagent" element={<ChatWithAgent />} />
          <Route path="editor/agentbuilder" element={<AgentBuilder />} />
          <Route path="editor/toolmanager" element={<ToolManager />} />
          <Route path="historyanalytics" element={<HistoryAnalytics />} />
          <Route path="admin/manageroles" element={<ManageRoles />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
}

export default App;
