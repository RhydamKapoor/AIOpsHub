import PassChange from "@/components/dashboard/Settings/PassChange";
import ProfileComp from "@/components/dashboard/Settings/ProfileComp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/utils/axiosConfig";
import { cn } from "@/lib/utils";
import { KeyRound, LogOut, Settings2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const tabTriggerClass = cn(
  "h-auto min-h-11 rounded-xl border border-transparent text-sm font-medium transition-colors",
  "flex flex-1 items-center justify-center gap-2 px-3 py-3 lg:w-full lg:flex-none lg:justify-start lg:gap-3 lg:px-4",
  "text-base-content/70",
  "data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10",
  "data-[state=active]:text-primary data-[state=active]:shadow-none"
);

export default function Settings() {
  const router = useNavigate();
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState("changepassword");

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    setUser(null);
    router("/login");
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "profile" || hash === "changepassword") {
      setTab(hash);
    }
  }, []);

  const handleTabChange = (value) => {
    setTab(value);
    window.location.hash = value;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-12 sm:gap-6 sm:p-5 sm:pb-14 lg:p-6 lg:pb-16">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        </div>
        <p className="text-sm text-base-content/55 sm:text-base">
          Manage your profile, password, and account preferences.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-base-content/8 bg-base-300/40 shadow-xl">
        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="flex w-full flex-col lg:min-h-[min(640px,calc(100dvh-10rem))] lg:flex-row"
        >
          <aside className="shrink-0 border-b border-base-content/10 p-3 sm:p-4 lg:flex lg:w-60 lg:flex-col lg:self-stretch lg:border-b-0 lg:border-r">
            <div className="mb-4 hidden items-center gap-3 rounded-xl bg-base-100/40 p-3 lg:flex">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold uppercase text-primary-content">
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
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold capitalize">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-base-content/55">
                  {user?.email}
                </p>
              </div>
            </div>

            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:flex lg:flex-col lg:gap-1.5">
              <TabsTrigger value="profile" className={tabTriggerClass}>
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="changepassword" className={tabTriggerClass}>
                <KeyRound className="h-4 w-4 shrink-0" />
                <span className="truncate">Password</span>
              </TabsTrigger>
            </TabsList>

            <button
              type="button"
              className="mt-auto hidden w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-error/25 bg-error/10 px-4 py-2.5 text-sm font-medium text-error-content transition-colors hover:bg-error/20 lg:mt-auto lg:flex"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </aside>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <TabsContent value="profile" id="profile" className="mt-0 outline-none">
              <ProfileComp user={user} setUser={setUser} />
            </TabsContent>
            <TabsContent
              value="changepassword"
              id="changepassword"
              className="mt-0 outline-none"
            >
              <PassChange setUser={setUser} />
            </TabsContent>
          </div>

          <div className="border-t border-base-content/10 p-3 sm:p-4 lg:hidden">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm font-medium text-error-content transition-colors hover:bg-error/20"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
