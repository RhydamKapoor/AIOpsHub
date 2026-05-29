import { TypingAnimation } from "@/components/magicui/typing-animation";
import Snowfall from "@/components/Snowfall";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LayoutDashboard,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosConfig";
import { dashboardRoutes } from "@/config/dashboardRoutes";

const routeDescriptions = {
  Dashboard: "Monitor token usage, workflows, and platform activity at a glance.",
  "AI Chat": "Talk to Opal with memory and access to your agents and tools.",
  "Agent Builder": "Create, configure, and run custom AI agents with visual flows.",
  "Tool Manager": "Upload, test, and manage LangChain-compatible tools.",
  "History & Analytics": "Review past conversations, runs, and usage history.",
  "Manage Roles": "Invite users and control workspace roles and permissions.",
  Settings: "Update your profile, password, and account preferences.",
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const filteredRoutes = dashboardRoutes.filter((route) =>
    route.access.includes(user?.role)
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.log("Auth check failed", error);
        navigate("/login");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-base-content/55">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "there";

  return (
    <div className="relative min-h-full w-full overflow-x-hidden">
      <Snowfall count={90} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 pb-14 sm:gap-10 sm:px-6 sm:py-12 sm:pb-16">
        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-300/50 shadow-xl backdrop-blur-md">
          <div className="border-b border-base-content/10 bg-base-100/25 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AIOpsHub Workspace
                </div>

                <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  Welcome back,{" "}
                  <TypingAnimation
                    as="span"
                    duration={50}
                    className="block truncate text-primary sm:inline capitalize"
                  >
                    {displayName}
                  </TypingAnimation>
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-base-content/65 sm:text-base">
                  Build AI agents, connect custom tools, and run intelligent
                  workflows — all from one unified operations platform.
                </p>
              </div>

              <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-base-content/15 bg-base-100/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/70">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
            <p className="text-sm text-base-content/55">
              {filteredRoutes.length} modules available for your role
            </p>
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral px-5 py-2.5 text-sm font-medium text-neutral-content transition-opacity hover:opacity-90"
            >
              <LayoutDashboard className="h-4 w-4" />
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Quick access */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold sm:text-xl">Quick access</h2>
              <p className="text-sm text-base-content/55">
                Jump straight to the tools you use most.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
            {filteredRoutes.map((route) => (
              <li key={route.path}>
                <Link
                  to={route.path}
                  className="group flex h-full min-h-[88px] flex-col gap-3 rounded-xl border border-base-content/10 bg-base-300/40 p-4 transition-all hover:border-primary/30 hover:bg-base-100/40 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                      <route.icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold leading-snug">{route.name}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-base-content/55 sm:text-sm">
                      {routeDescriptions[route.name] ||
                        "Open this section of your workspace."}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-xs text-base-content/40">
          Secure session active · Manage your account in Settings
        </p>
      </div>
    </div>
  );
}
