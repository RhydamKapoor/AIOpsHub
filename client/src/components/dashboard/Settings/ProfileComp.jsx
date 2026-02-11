import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import axiosInstance from "@/utils/axiosConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { editSchema } from "@/utils/Validation";
import toast from "react-hot-toast";

export default function ProfileComp({user, setUser}) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: user?.email?.charAt(0).toUpperCase() + user?.email?.slice(1) || "",
    },
  });

  const onSubmit = async (data) => {
    if (data) {
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
    } else {
      toast.error("Please fill all the fields");
    }
  };
  const formatEmail = (e) => {
    const input = e.target.value;
    const formatted = input.charAt(0).toUpperCase() + input.slice(1);
    setValue("email", formatted, { shouldValidate: true });
  };
  return (
    <Card className={`border-none h-full`}>
      <CardHeader></CardHeader>
      <CardContent className={`h-full`}>
        <div className="flex flex-col gap-y-7 h-full">
          <div className="flex flex-col items-center justify-center gap-y-1">
            <span className="text-2xl font-bold w-24 h-24 bg-[var(--color-primary)] flex justify-center items-center rounded-full text-[var(--color-base-100)] uppercase">
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
            <p className="text-lg font-semibold capitalize">
              {user?.firstName + " " + user?.lastName}
            </p>
          </div>

          <form
            className="flex flex-col gap-y-8 h-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-y-2">
              {isEditing && (
                <>
                  <div className="flex gap-x-3">
                    <label htmlFor="firstName" className="font-bold w-28">
                      First Name:
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      defaultValue={user?.firstName || ""}
                      {...register("firstName")}
                      className="outline-none w-full capitalize"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex gap-x-3">
                    <label htmlFor="lastName" className="font-bold w-28">
                      Last Name:
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      defaultValue={user?.lastName || ""}
                      {...register("lastName")}
                      className="outline-none w-full capitalize"
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-x-3">
                <label
                  htmlFor="email"
                  className={`font-bold ${isEditing ? "w-28" : "w-24"}`}
                >
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={watch("email")}
                  {...register("email", {
                    onChange: formatEmail,
                  })}
                  className={`outline-none w-full ${
                    isEditing ? "cursor-text" : "cursor-default"
                  }`}
                  disabled={!isEditing}
                />
              </div>
              {!isEditing && (
                <>
                  <div className="flex gap-x-3">
                    <label
                      htmlFor="role"
                      className={`font-bold ${isEditing ? "w-28" : "w-24"}`}
                    >
                      Role:
                    </label>
                    <input
                      id="role"
                      value={user?.role}
                      className={`outline-none w-full ${
                        isEditing ? "cursor-text" : "cursor-default"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex gap-x-3">
                    <label
                      htmlFor="role"
                      className={`font-bold ${isEditing ? "w-28" : "w-24"}`}
                    >
                      Joined on:
                    </label>
                    <input
                      id="role"
                      value={format(new Date(user?.createdAt), "dd MMMM yyyy")}
                      className={`outline-none w-full ${
                        isEditing ? "cursor-text" : "cursor-default"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex *:w-1/2 w-1/2 gap-x-3">
              {!isEditing ? (
                <button
                  type="button"
                  className={`flex justify-center items-center gap-x-1 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg py-2 px-4 cursor-pointer text-sm`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true);
                  }}
                >
                  <Pencil size={16} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className={`flex justify-center items-center gap-x-1 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg py-2 px-4 cursor-pointer text-sm`}
                  >
                    <Save size={16} />
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="flex justify-center items-center gap-x-1 bg-red-700 text-slate-200 rounded-lg py-2 px-4 cursor-pointer text-sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <Trash size={15} />
                    Discard
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
