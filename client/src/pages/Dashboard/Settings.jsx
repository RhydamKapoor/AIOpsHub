import PassChange from "@/components/dashboard/Settings/PassChange";
import ProfileComp from "@/components/dashboard/Settings/ProfileComp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/utils/axiosConfig";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Update the hash when tab changes
  const handleTabChange = (value) => {
    setTab(value);
    window.location.hash = value;
  };
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex w-2/3 shadow-xl rounded-2xl h-5/6">
        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="w-full flex flex-row h-full rounded-2xl bg-[var(--color-base-300)]/40 p-4"
        >
          <TabsList className="flex flex-col justify-between border-r h-full w-1/5">
            <div className="flex flex-col w-full *:h-auto *:w-full py-5 px-3 gap-y-2 *:py-2">
              <TabsTrigger value="changepassword">Change Password</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </div>

            <div className="flex text-sm *:h-auto *:w-full py-5 px-3 gap-y-2 *:py-2 w-full">
              <button
                className="bg-red-700 text-slate-200 rounded-lg flex justify-center items-center gap-x-0.5 cursor-pointer"
                onClick={logout}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </TabsList>
          <TabsContent value="changepassword" id="changepassword">
            <PassChange setUser={setUser} />
          </TabsContent>
          <TabsContent value="profile" id="profile">
            <ProfileComp user={user} setUser={setUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
