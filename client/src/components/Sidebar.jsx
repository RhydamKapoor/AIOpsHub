import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/images/aiopshublogo.png";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = ({ routes }) => {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;

  if (!pathname.includes("/dashboard")) return null;

  return (
    <motion.div
      className={`h-full bg-[var(--color-base-300)] border-r border-[var(--color-base-content)] flex flex-col px-2`}
      initial={{ width: 70 }}
      whileHover={{ width: 250 }}
      onHoverStart={() => setIsCollapsed(false)}
      onHoverEnd={() => setIsCollapsed(true)}
      transition={{ duration: 0.3 }}
    >
      <Link to="/" className="flex items-center justify-start h-[92px]">
        <img src={logo} alt="logo" className="w-12 h-12" />
        <motion.span
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="text-2xl font-bold"
        >
          AIOpsHub
        </motion.span>
      </Link>

      <nav className="flex-1 px-2 py-4 flex flex-col justify-between">
        <ul className="space-y-2 overflow-hidden">
          {routes.map(
            (route, i) =>
              route.access.includes(user?.role) && ( // Only check includes, no ===
                <motion.li key={route.path}>
                  <NavLink
                    to={route.path}
                    className={`flex items-center p-2 rounded-lg transition-colors ${
                      location.pathname === route.path
                        ? "bg-[var(--color-primary)] text-[var(--color-base-100)]"
                        : "hover:bg-[var(--color-base-100)]"
                    }`}
                  >
                    <route.icon size={20} className="min-w-[20px]" />
                    <motion.span
                      className="ml-3 flex whitespace-nowrap"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isCollapsed ? 0 : 1 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                    >
                      {route.name}
                    </motion.span>
                  </NavLink>
                </motion.li>
              )
          )}
        </ul>
        <div className="flex items-center overflow-hidden">
          <Link to="/dashboard/settings#profile" className="flex justify-center items-center cursor-pointer uppercase">
            <span className="text-lg font-bold w-[36px] h-[36px] bg-[var(--color-primary)] flex justify-center items-center rounded-full text-[var(--color-base-100)] select-none">
              {user?.image ? (
                <img
                  src={user?.image}
                  alt={`${user?.firstName.charAt(0)} ${user?.lastName.charAt(
                    0
                  )}`}
                  className="w-full h-full object-cover rounded-full "
                />
              ) : (
                `${user?.firstName.charAt(0)}${user?.lastName.charAt(0)}`
              )}
            </span>
            <motion.span
              className="ml-3 flex whitespace-nowrap capitalize"
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
            >
              {user?.firstName + " " + user?.lastName}
            </motion.span>
          </Link>
        </div>
      </nav>
    </motion.div>
  );
};

export default Sidebar;
