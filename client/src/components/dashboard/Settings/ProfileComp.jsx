import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Pencil } from "lucide-react";

export default function ProfileComp() {
  const {user} = useAuth();
  return (
    
    <Card className={`border-none h-full`}>
    <CardHeader>
    </CardHeader>
    <CardContent className={`h-full`}>
      <div className="flex flex-col gap-y-7 h-full">
        <div className="flex flex-col items-center justify-center gap-y-1">
          <span className="text-2xl font-bold w-24 h-24 bg-[var(--color-primary)] flex justify-center items-center rounded-full text-[var(--color-base-100)]">{user?.firstName.charAt(0) + user?.lastName.charAt(0)}</span>
          <p className="text-lg font-semibold">{user?.firstName + " " + user?.lastName}</p>
        </div>
        
        <form className="flex flex-col gap-y-4 h-full">
          <div className="flex flex-col">
            <div className="flex gap-x-3">
              <label htmlFor="email" className="font-bold w-12">Email:</label>
              <input id="email" type="email" value={user?.email.charAt(0).toUpperCase() + user?.email.slice(1)} className="outline-none w-full cursor-default" readOnly />
            </div>
            <div className="flex gap-x-3">
              <label htmlFor="role" className="font-bold w-12">Role:</label>
              <input id="role" value={user?.role} className="outline-none w-full cursor-default" readOnly />
            </div>
          </div>
          <div className="flex">
            <button className="flex items-center gap-x-0.5 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg py-2 px-4 cursor-pointer text-sm"><Pencil size={16}/> Edit Profile</button>
          </div>
        </form>
      </div>
    </CardContent>
    <CardFooter>
    </CardFooter>
  </Card>
  )
}
