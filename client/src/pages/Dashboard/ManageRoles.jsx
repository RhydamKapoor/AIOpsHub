import AllInvitations from "@/components/dashboard/ManageRoles/AllInvitations";
import SendInvitation from "@/components/dashboard/ManageRoles/SendInvitation";
import axiosInstance from "@/utils/axiosConfig";
import { ArrowLeftRight} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// const allInvitations = [
//   {
//       id: 1,
//       email: `Demo@gmail.com`,
//       status: `Sent`,
//   },
//   {
//       id: 2,
//       email: `Demo@gmail.com`,
//       status: `Failed`,
//   },
//   {
//       id: 3,
//       email: `Demo@gmail.com`,
//       status: `Sent`,
//   },
//   {
//       id: 4,
//       email: `Demo@gmail.com`,
//       status: `Failed`,
//   },
// ]
export default function ManageRoles() {
  const [allUsers, setAllUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // useEffect(() => {
    
  // }, [invitations]);
  
  const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/allUsers');
        setAllUsers(response.data.users)
        
      } catch (error) {
        console.error(error);
        console.log(error.response.data.msg);
      }
  }

  const changeRoles = async(id, role) => {
    let newRole;
    role === "Viewer" ? newRole = "Editor" : newRole = "Viewer";
    
    const toastId = toast.loading('Changing role...');
    try {
      await axiosInstance.post(`/changeRole`, {id, newRole});
      toast.success("Role changed successfully", {id: toastId});
      fetchRoles()
    } catch (error) {
      toast.error(error.response.data.msg, {id: toastId});
      console.log(error)
    }
  }


  useEffect(() => {
    fetchRoles()
  }, []);
  return (
    <div className="flex p-3 h-full">
      <div className="flex flex-col gap-y-2 w-3/4 items-center *:w-11/12">
        <div className="flex justify-around font-semibold *:flex *:justify-center *:w-1/4 text-[var(--color-base-content)]/50">
          <h1>Name</h1>
          <h1>Email</h1>
          <h1>Role</h1>
          <h1>Change Role</h1>
        </div>

        <div className="flex flex-col gap-y-4">
          {
            allUsers && allUsers.filter((user) => user.role !== "Admin").map((user, i)=> (
              <div className="flex justify-around bg-[var(--color-base-300)]/40 py-3 rounded-lg *:flex *:justify-center *:w-1/4" key={i}>
                <h1 className="capitalize">{user.firstName + " " + user.lastName}</h1>
                <h1>{user.email.charAt(0).toUpperCase() + user.email.slice(1)}</h1>
                <h1>{user.role}</h1>
                <button><ArrowLeftRight strokeWidth={1.2} className="cursor-pointer" onClick={() => changeRoles(user._id, user.role)}/></button>
              </div>
            ))
          }
        </div>
      </div>

      <div className="flex flex-col gap-y-5 justify-between w-1/4 h-full">
        <SendInvitation invitations={invitations} setInvitations={setInvitations}/>
        <AllInvitations invitations={invitations} setInvitations={setInvitations}/>
      </div>
    </div>
  )
}
