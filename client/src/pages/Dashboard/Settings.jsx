import ProfileComp from "@/components/dashboard/Settings/ProfileComp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosConfig";
import { LogOut } from "lucide-react";
import {useNavigate } from "react-router-dom";

export default function Settings() {
  const router = useNavigate();
  const {setUser} = useAuth()

  const logout = async() => {
    await axiosInstance.post('/auth/logout');
    setUser(null)
    router('/login')
  }
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex w-2/3 shadow-xl rounded-2xl h-5/6">
        <Tabs
          defaultValue="account"
          className="w-full flex flex-row h-full rounded-2xl bg-[var(--color-base-300)]/40 p-4"
        >
          <TabsList className="flex flex-col justify-between border-r h-full w-1/5">
            <div className="flex flex-col w-full *:h-auto *:w-full py-5 px-3 gap-y-2 *:py-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </div>

            <div className="flex text-sm *:h-auto *:w-full py-5 px-3 gap-y-2 *:py-2 w-full">
              <button className="bg-red-700 text-slate-200 rounded-lg flex justify-center items-center gap-x-0.5 cursor-pointer" onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </TabsList>
          <TabsContent value="account">
            <Card className={`border-none h-full`}>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="current">Current password</label>
                  <input id="current" type="password" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="new">New password</label>
                  <input id="new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <button>Save password</button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="profile">
            <ProfileComp />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
