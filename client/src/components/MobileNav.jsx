import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import logo from "../assets/images/aiopshublogo.png";
import axiosInstance from "@/utils/axiosConfig";
import { isDashboardRouteActive } from "@/config/dashboardRoutes";

export default function MobileNav({ open, onClose, routes }) {
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    setUser(null);
    onClose();
    navigate("/login");
  };

  const visibleRoutes = routes.filter((route) =>
    route.access.includes(user?.role)
  );

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="glass-surface glass-surface--edge absolute inset-y-0 left-0 z-20 flex h-full max-h-dvh w-[min(100vw,20rem)] flex-col border-r"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-base-content/10 px-3 py-3 sm:px-4 sm:py-4">
              <Link
                to="/"
                className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
                onClick={onClose}
              >
                <img
                  src={logo}
                  alt="AIOpsHub"
                  className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
                />
                <span className="truncate text-lg font-bold sm:text-xl">
                  AIOpsHub
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-base-100/25"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
              {visibleRoutes.map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end={route.path === "/dashboard"}
                    onClick={onClose}
                    className={() =>
                      cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors sm:px-4 sm:text-base",
                        isDashboardRouteActive(location.pathname, route.path)
                          ? "bg-primary/90 text-primary-content shadow-md"
                          : "text-base-content/80 hover:bg-base-100/25"
                      )
                    }
                  >
                    <route.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{route.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="shrink-0 space-y-3 border-t border-base-content/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
              <Link
                to="/dashboard/settings#profile"
                onClick={onClose}
                className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-base-100/25 sm:px-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold uppercase text-primary-content">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate capitalize">
                  {user?.firstName} {user?.lastName}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-error/90 py-3 text-sm font-medium text-white"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </div>
          </motion.nav>

          {/* Dim only the page behind the drawer — not under the menu panel */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-scrim absolute inset-y-0 right-0 left-[min(100vw,20rem)] z-10"
            aria-label="Close menu"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
