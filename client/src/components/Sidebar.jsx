import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../assets/images/aiopshublogo.png";
import { useAuthStore } from "@/store/useAuthStore";
import { isDashboardRouteActive } from "@/config/dashboardRoutes";
import { cn } from "@/lib/utils";

const COLLAPSED_WIDTH = 70;
const EXPANDED_WIDTH = 250;
const SIDEBAR_TRANSITION = { duration: 0.3, ease: "easeInOut" };

const glassSidebar =
  "glass-surface glass-surface--edge border-r";

const labelClass = (expanded) =>
  cn(
    "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
    expanded ? "ml-3 max-w-[180px] opacity-100" : "ml-0 max-w-0 opacity-0"
  );

const navItemClass = (active) =>
  cn(
    "flex items-center rounded-xl p-2.5 transition-colors duration-300",
    active
      ? "bg-primary/90 text-primary-content shadow-md shadow-primary/20"
      : "text-base-content/80 hover:bg-base-100/25 hover:text-base-content"
  );

const Sidebar = ({ routes }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const pathname = location.pathname;
  const [expanded, setExpanded] = useState(false);

  if (!pathname.includes("/dashboard")) return null;

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen shrink-0 flex-col overflow-hidden px-2 lg:flex",
        glassSidebar
      )}
      initial={false}
      animate={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={SIDEBAR_TRANSITION}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <Link
        to="/"
        className="flex h-[72px] items-center justify-start overflow-hidden border-b border-base-content/8 px-2"
      >
        <img src={logo} alt="logo" className="h-11 w-11 shrink-0 drop-shadow-sm" />
        <span
          className={cn(
            labelClass(expanded),
            "text-xl font-bold tracking-tight text-base-content"
          )}
        >
          AIOpsHub
        </span>
      </Link>

      <nav className="flex flex-1 flex-col justify-between overflow-hidden py-3">
        <ul className="space-y-1 overflow-hidden px-1">
          {routes.map(
            (route) =>
              route.access.includes(user?.role) && (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end={route.path === "/dashboard"}
                    title={route.name}
                    className={() =>
                      navItemClass(
                        isDashboardRouteActive(pathname, route.path)
                      )
                    }
                  >
                    <route.icon
                      size={20}
                      className="min-h-[20px] min-w-[20px] shrink-0"
                    />
                    <span
                      className={cn(labelClass(expanded), "text-sm font-medium")}
                    >
                      {route.name}
                    </span>
                  </NavLink>
                </li>
              )
          )}
        </ul>

        <div className="overflow-hidden border-t border-base-content/8 px-1 pb-2 pt-2">
          <Link
            to="/dashboard/settings#profile"
            title={`${user?.firstName} ${user?.lastName}`}
            className="flex cursor-pointer items-center overflow-hidden rounded-xl p-1.5 transition-colors duration-300 hover:bg-base-100/25"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/90 text-sm font-bold uppercase text-primary-content shadow-sm ring-2 ring-base-100/20">
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`
              )}
            </span>
            <span
              className={cn(
                labelClass(expanded),
                "text-sm font-medium capitalize text-base-content/90"
              )}
            >
              {user?.firstName} {user?.lastName}
            </span>
          </Link>
        </div>
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
