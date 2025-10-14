import { TypingAnimation } from "@/components/magicui/typing-animation";
import Snowfall from "@/components/Snowfall";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  MessageCircle,
  PencilRuler,
  History,
  Puzzle,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosConfig";

const routes = [
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
    path: "/dashboard/admin/manageroles",
    name: "Manage Roles",
    icon: Puzzle,
    access: ["Admin"],
  },
];
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const filteredRoutes = routes.filter((route) =>
    route.access.includes(user?.role)
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking auth...");
        const response = await axiosInstance.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.log("❌ Auth check failed", error);
        navigate("/login");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="w-full h-full flex justify-center items-center">Loading...</div>;
  }
  return (
    <>
      {
        user && (
          <div className="w-full h-full flex  gap-y-4">
            <Snowfall count={100} />
      <div className="flex *:w-1/2 w-full h-full">
        <div className="flex flex-col justify-center items-center h-full">
          <div className="flex flex-col w-full items-center gap-y-30">
            <h1 className="text-4xl font-bold capitalize flex flex-col items-center text-[var(--color-base-content)]/80">
              Welcome{" "}
              <TypingAnimation
                duration={60}
                className={`text-6xl font-bold text-[var(--color-base-content)]`}
              >
                {user ? user?.firstName + " " + user?.lastName : `to AIOpsHub`}
              </TypingAnimation>
            </h1>
            <div className="text-sm text-muted-foreground bg-[var(--color-base-300)]/40 rounded-xl flex flex-col items-center gap-y-2 shadow w-2/3">
                <p className="text-lg shadow w-full text-center p-3">
                  {user ? `Quick Access to your dashboard` : `Sign in to get access to your dashboard`}
              </p>
              {user ? <ul className="grid grid-cols-3 gap-x-5 p-5 gap-y-6 rounded-lg">
                {filteredRoutes.map((route, index) => {
                  return (
                    <li
                      key={route.path}
                      className={`flex text-lg text-[var(--color-primary)] animate-pulse ${filteredRoutes.length === 4 && index === 3 ? "col-span-3 justify-center" : ""}`}
                    >
                      <Link
                        to={route.path}
                        className="flex items-center gap-x-2"
                      >
                        <route.icon className="w-4 h-4" />
                        {route.name}
                      </Link>
                    </li>
                  );
                })}
              </ul> : 
              <div className="flex gap-x-5 *:w-1/2 w-full p-5 *:cursor-pointer"> 
                <Link to="/login" className="flex justify-center bg-[var(--color-neutral)] text-[var(--color-neutral-content)] px-6 py-3 rounded-md">Login</Link>
                <Link to="/role-selection" className="flex justify-center bg-[var(--color-neutral)] text-[var(--color-neutral-content)] px-6 py-3 rounded-md">Signup</Link>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
