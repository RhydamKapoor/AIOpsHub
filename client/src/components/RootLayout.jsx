import React, { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/aiopshublogo.png";
import Sidebar from "./Sidebar";
import { LayoutDashboard, Wrench, MessageCircle, PencilRuler, History, Puzzle, Settings, Search } from "lucide-react";
import { FlipText } from "./magicui/flip-text";
import { TypingAnimation } from "./magicui/typing-animation";


const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    access: ['Admin', 'Editor', 'Viewer'],
  },
  {
    path: '/dashboard/chatwithagent',
    name: 'AI Chat',
    icon: MessageCircle,
    access: ['Admin', 'Editor', 'Viewer'],
  },
  {
    path: '/dashboard/editor/agentbuilder',
    name: 'Agent Builder',
    icon: PencilRuler,
    access: ['Admin', 'Editor'],
  },
  {
    path: '/dashboard/editor/toolmanager',
    name: 'Tool Manager',
    icon: Wrench,
    access: ['Admin', 'Editor'],
  },
  {
    path: '/dashboard/historyanalytics',
    name: 'History & Analytics',
    icon: History,
    access: ['Admin', 'Editor', 'Viewer'],
  },
  {
    path: '/dashboard/admin/manageroles',
    name: 'Manage Roles',
    icon: Puzzle,
    access: ['Admin'],
  },
  {
    path: '/dashboard/settings',
    name: 'Settings',
    icon: Settings,
    access: ['Admin', 'Editor', 'Viewer'],
  },
];
export default function RootLayout() {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();

  const location = useLocation();
  const pathname = location.pathname;

  const titleData = routes.find(route => route.path === pathname);

  return (
    <div
      className={`flex bg-[var(--color-base-300)] text-[var(--color-base-content)] h-screen overflow-hidden selection:bg-[var(--color-neutral-content)] ${
        theme === "dark"
          ? "bg-[url('./assets/images/nightRobo.png')]"
          : "bg-[url('./assets/images/robo.png')]"
      } bg-cover bg-center`}
    >
    <div className="flex">
      <Sidebar routes={routes} />
    </div>
      <div className="flex flex-col w-full relative bg-[var(--color-base-300)]/10 backdrop-blur-sm">
        <nav className=" p-6 w-full ">
          <div className="flex justify-between items-center">
            <div className="flex">
            {
              !pathname.includes('/dashboard') ? 
              <h1 className={`text-3xl font-bold  items-center justify-center flex`}>
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-12 -translate-y-0.5"
                />
                AIOpsHub
              </h1> : <h1 className={`text-4xl font-bold  items-center justify-center flex gap-x-2 h-fit py-0.5`}>{<titleData.icon size={30} strokeWidth={2.5}/>} <TypingAnimation duration={40}>{titleData.name}</TypingAnimation></h1>
               
            }
              
            </div>
            <div className="flex items-center gap-x-5">
              {/* <div className="flex relative">
                <Search size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-base-content)]" />
                <input type="search" name="search" id="search" placeholder="Search..." className="bg-[var(--color-base-300)] rounded-full py-2 pl-8 pr-3 w-60 border border-[var(--color-base-content)] outline-none" />
              </div> */}
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="h-[calc(100vh-92px)] fixed bottom-0 w-full overflow-y-auto">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
