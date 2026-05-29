import { Pencil, Save, Trash, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import axiosInstance from "@/utils/axiosConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { editSchema } from "@/utils/Validation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-base-content/15 bg-base-100/50 px-3 py-2.5 text-base outline-none transition-colors focus:border-primary/40 disabled:cursor-default disabled:opacity-80";

export default function ProfileComp({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: user?.email?.charAt(0).toUpperCase() + user?.email?.slice(1) || "",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Updating profile...");
    try {
      const response = await axiosInstance.post(`/auth/updateuser`, data);
      if (response.status === 200) {
        toast.success("Profile updated successfully", { id: toastId });
        setIsEditing(false);
        setUser(response.data.user);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: toastId });
    }
  };

  const formatEmail = (e) => {
    const input = e.target.value;
    const formatted = input.charAt(0).toUpperCase() + input.slice(1);
    setValue("email", formatted, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold sm:text-xl">Profile</h2>
        <p className="mt-1 text-sm text-base-content/55">
          View and update your personal information.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-base-content/10 bg-base-100/30 p-5 sm:flex-row sm:items-center sm:gap-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-bold uppercase text-primary-content">
          {user?.image ? (
            <img
              src={user?.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`
          )}
        </span>
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-lg font-semibold capitalize">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-sm text-base-content/55">
            {user?.email}
          </p>
          <span className="mt-2 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            {user?.role}
          </span>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEditing && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  defaultValue={user?.firstName || ""}
                  {...register("firstName")}
                  className={cn(fieldClass, "capitalize")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  defaultValue={user?.lastName || ""}
                  {...register("lastName")}
                  className={cn(fieldClass, "capitalize")}
                />
              </div>
            </>
          )}

          <div className={cn("flex flex-col gap-1.5", !isEditing && "sm:col-span-2")}>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={watch("email")}
              {...register("email", { onChange: formatEmail })}
              className={fieldClass}
              disabled={!isEditing}
            />
          </div>

          {!isEditing && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <input
                  id="role"
                  value={user?.role}
                  className={fieldClass}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="joined" className="text-sm font-medium">
                  Joined on
                </label>
                <input
                  id="joined"
                  value={format(new Date(user?.createdAt), "dd MMMM yyyy")}
                  className={fieldClass}
                  disabled
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!isEditing ? (
            <button
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-neutral px-5 py-2.5 text-sm font-medium text-neutral-content sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-neutral px-5 py-2.5 text-sm font-medium text-neutral-content sm:w-auto"
              >
                <Save className="h-4 w-4" />
                Save changes
              </button>
              <button
                type="button"
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-base-content/15 bg-base-100/50 px-5 py-2.5 text-sm font-medium"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
