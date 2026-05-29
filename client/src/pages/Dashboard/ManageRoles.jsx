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
    <div className="flex h-full flex-col gap-4 p-2 sm:p-4 lg:flex-row lg:gap-6">
      <div className="flex min-h-0 flex-1 flex-col gap-y-3 overflow-hidden lg:w-2/3">
        <div className="hidden font-semibold text-base-content/50 sm:grid sm:grid-cols-4 sm:gap-2 sm:px-2">
          <h1>Name</h1>
          <h1>Email</h1>
          <h1>Role</h1>
          <h1 className="text-center">Change Role</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {allUsers &&
            allUsers
              .filter((u) => u.role !== "Admin")
              .map((u, i) => (
                <div
                  className="grid grid-cols-1 gap-2 rounded-lg bg-base-300/40 p-3 sm:grid-cols-4 sm:items-center sm:gap-2"
                  key={i}
                >
                  <h1 className="capitalize text-sm sm:text-base">
                    <span className="font-semibold text-base-content/50 sm:hidden">Name: </span>
                    {u.firstName} {u.lastName}
                  </h1>
                  <h1 className="truncate text-sm sm:text-base">
                    <span className="font-semibold text-base-content/50 sm:hidden">Email: </span>
                    {u.email}
                  </h1>
                  <h1 className="text-sm sm:text-base">
                    <span className="font-semibold text-base-content/50 sm:hidden">Role: </span>
                    {u.role}
                  </h1>
                  <div className="flex sm:justify-center">
                    <button type="button" aria-label="Change role">
                      <ArrowLeftRight
                        strokeWidth={1.2}
                        className="cursor-pointer"
                        onClick={() => changeRoles(u._id, u.role)}
                      />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/3 lg:max-w-sm lg:shrink-0">
        <SendInvitation invitations={invitations} setInvitations={setInvitations} />
        <AllInvitations invitations={invitations} setInvitations={setInvitations} />
      </div>
    </div>
  )
}
