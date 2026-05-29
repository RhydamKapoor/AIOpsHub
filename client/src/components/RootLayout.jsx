import { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { ThemeContext } from "../context/ThemeContext";
import logo from "../assets/images/aiopshublogo.png";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Menu } from "lucide-react";
import { TypingAnimation } from "./magicui/typing-animation";
import { dashboardRoutes, getRouteForPath } from "@/config/dashboardRoutes";
import { cn } from "@/lib/utils";

export default function RootLayout() {
  const { theme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  const isDashboard = pathname.includes("/dashboard");
  const isAuth = ["/login", "/signup", "/role-selection", "/auth-success"].includes(
    pathname
  );
  const isHome = pathname === "/";
  const usesUnifiedGlass = isDashboard || isAuth || isHome;
  const titleData = getRouteForPath(pathname);

  return (
    <div
      className={`flex h-dvh overflow-hidden bg-base-300 text-base-content selection:bg-neutral-content ${
        theme === "dark"
          ? "bg-[url('./assets/images/nightRobo.png')]"
          : "bg-[url('./assets/images/robo.png')]"
      } bg-cover bg-center`}
    >
      {isDashboard && <Sidebar routes={dashboardRoutes} />}

      {isDashboard && (
        <MobileNav
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          routes={dashboardRoutes}
        />
      )}

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1">
        {isDashboard && (
          <div
            className="hidden w-[70px] shrink-0 lg:block"
            aria-hidden
          />
        )}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            usesUnifiedGlass && "glass-surface--subtle"
          )}
        >
          <header
            className={cn(
              "relative z-20 shrink-0 px-3 py-2.5 sm:px-6 sm:py-4",
              isDashboard && "border-b border-base-content/10"
            )}
          >
          <div className="flex items-center gap-2 sm:gap-3">
            {isDashboard && (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-base-content/10 bg-base-100/50 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="flex min-w-0 flex-1 items-center overflow-hidden">
              {!isDashboard ? (
                <h1 className="flex min-w-0 items-center truncate text-lg font-bold sm:text-3xl">
                  <img
                    src={logo}
                    alt="Logo"
                    className="mr-2 h-8 w-8 shrink-0 sm:h-12 sm:w-12"
                  />
                  <span className="truncate">AIOpsHub</span>
                </h1>
              ) : titleData ? (
                <h1 className="flex min-w-0 items-center gap-2 overflow-hidden text-base font-bold sm:text-2xl lg:text-3xl">
                  <titleData.icon
                    className="h-5 w-5 shrink-0 sm:h-7 sm:w-7"
                    strokeWidth={2.5}
                  />
                  <span className="min-w-0 truncate">
                    <TypingAnimation
                      as="span"
                      duration={40}
                      className="block truncate text-base font-bold sm:text-2xl lg:text-3xl"
                    >
                      {titleData.name}
                    </TypingAnimation>
                  </span>
                </h1>
              ) : (
                <h1 className="truncate text-base font-bold sm:text-2xl">
                  Dashboard
                </h1>
              )}
            </div>

            <ThemeSwitcher />
          </div>
          </header>

          <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
