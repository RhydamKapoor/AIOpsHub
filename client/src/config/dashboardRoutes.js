import {
  LayoutDashboard,
  Wrench,
  MessageCircle,
  PencilRuler,
  History,
  Puzzle,
  Settings,
} from "lucide-react";

export const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    access: ["Admin", "Editor", "Viewer"],
  },
  {
    path: "/dashboard/chatwithagent",
    name: "AI Chat",
    icon: MessageCircle,
    access: ["Admin", "Editor", "Viewer"],
  },
  {
    path: "/dashboard/editor/agentbuilder",
    name: "Agent Builder",
    icon: PencilRuler,
    access: ["Admin", "Editor"],
  },
  {
    path: "/dashboard/editor/toolmanager",
    name: "Tool Manager",
    icon: Wrench,
    access: ["Admin", "Editor"],
  },
  {
    path: "/dashboard/historyanalytics",
    name: "History & Analytics",
    icon: History,
    access: ["Admin", "Editor", "Viewer"],
  },
  {
    path: "/dashboard/admin/manageroles",
    name: "Manage Roles",
    icon: Puzzle,
    access: ["Admin"],
  },
  {
    path: "/dashboard/settings",
    name: "Settings",
    icon: Settings,
    access: ["Admin", "Editor", "Viewer"],
  },
];

export function getRouteForPath(pathname) {
  const current = pathname.replace(/\/$/, "") || "/";
  return dashboardRoutes.find((route) => route.path.replace(/\/$/, "") === current);
}

/** Exact match for /dashboard; exact match for all other dashboard leaf routes */
export function isDashboardRouteActive(pathname, routePath) {
  const current = pathname.replace(/\/$/, "") || "/";
  const target = routePath.replace(/\/$/, "") || "/";
  if (target === "/dashboard") {
    return current === "/dashboard";
  }
  return current === target;
}
