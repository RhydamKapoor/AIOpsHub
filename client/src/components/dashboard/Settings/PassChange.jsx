import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/utils/axiosConfig";
import { passChangeSchema } from "@/utils/Validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed, Repeat } from "lucide-react";
import { useBoolToggle } from "react-haiku";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function PassChange({ setUser }) {
  const [currentShow, setCurrentShow] = useBoolToggle();
  const [newShow, setNewShow] = useBoolToggle();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passChangeSchema),
  });
  const router = useNavigate();

  const changePass = async (data) => {
    const toastId = toast.loading("Changing password...");
    try {
      const res = await axiosInstance.post("/auth/changepassword", data);
      if (res.status === 200) {
        toast.success("Password changed successfully", { id: toastId });
        setUser(null);
        router("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, { id: toastId });
    }
  };
  return (
    <Card className={`border-none h-full`}>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password here. After saving, you'll be logged out.
        </CardDescription>
      </CardHeader>
      <form
        className="flex flex-col space-y-6"
        onSubmit={handleSubmit(changePass)}
      >
        <CardContent className="space-y-2">
          <div className="flex gap-x-3 w-full ">
            <label htmlFor="current" className={`font-bold w-40`}>
              Current password:
            </label>
            <div className="flex flex-col w-1/2 relative">
              <div className="flex relative">
                <input
                  id="current"
                  type={!currentShow ? "password" : "text"}
                  {...register("currentPassword")}
                  className={`outline-none border-b border-dashed w-full px-1`}
                />

                <span className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                  {currentShow ? (
                    <Eye size={16} onClick={() => setCurrentShow()} />
                  ) : (
                    <EyeClosed size={16} onClick={() => setCurrentShow()} />
                  )}
                </span>
              </div>

              <p
                className={`text-red-700 text-sm ${
                  errors?.currentPassword ? "visible" : "invisible"
                }`}
              >
                {errors?.currentPassword?.message || `Error`}
              </p>
            </div>
          </div>
          <div className="flex gap-x-3 w-full ">
            <label htmlFor="new" className={`font-bold w-40`}>
              New password:
            </label>
            <div className="flex flex-col w-1/2 relative">
            <div className="flex relative">
                <input
                  id="new"
                  type={!newShow ? "password" : "text"}
                  {...register("newPassword")}
                  className={`outline-none border-b border-dashed w-full px-1`}
                />

                <span className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                  {newShow ? (
                    <Eye size={16} onClick={() => setNewShow()} />
                  ) : (
                    <EyeClosed size={16} onClick={() => setNewShow()} />
                  )}
                </span>
              </div>
              <p
                className={`text-red-700 text-sm ${
                  errors?.newPassword ? "visible" : "invisible"
                }`}
              >
                {errors?.newPassword?.message || `Error`}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={`flex justify-center items-center gap-x-1 bg-[var(--color-neutral)] text-[var(--color-neutral-content)] rounded-lg py-2 px-4 cursor-pointer text-sm`}
          >
            <Repeat size={16} />
            Change password
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
