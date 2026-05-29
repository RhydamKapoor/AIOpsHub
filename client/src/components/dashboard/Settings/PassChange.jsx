import axiosInstance from "@/utils/axiosConfig";
import { passChangeSchema } from "@/utils/Validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Repeat } from "lucide-react";
import { useBoolToggle } from "react-haiku";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-base-content/15 bg-base-100/50 px-3 py-2.5 pr-10 text-base outline-none transition-colors focus:border-primary/40";

function PasswordField({
  id,
  label,
  show,
  onToggle,
  register,
  error,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          {...register}
          className={fieldClass}
          autoComplete={id === "current" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-error">{error.message}</p>
      )}
    </div>
  );
}

export default function PassChange({ setUser }) {
  const [currentShow, setCurrentShow] = useBoolToggle();
  const [newShow, setNewShow] = useBoolToggle();
  const {
    register,
    handleSubmit,
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold sm:text-xl">Password</h2>
        <p className="mt-1 text-sm text-base-content/55">
          Change your password here. You&apos;ll be logged out after saving.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-base-content/10 bg-base-100/30 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-base-content/70">
          Use a strong password with at least 8 characters. After updating, you
          will need to sign in again with your new password.
        </p>
      </div>

      <form
        className="flex max-w-lg flex-col gap-5"
        onSubmit={handleSubmit(changePass)}
      >
        <PasswordField
          id="current"
          label="Current password"
          show={currentShow}
          onToggle={setCurrentShow}
          register={register("currentPassword")}
          error={errors?.currentPassword}
        />
        <PasswordField
          id="new"
          label="New password"
          show={newShow}
          onToggle={setNewShow}
          register={register("newPassword")}
          error={errors?.newPassword}
        />

        <button
          type="submit"
          className={cn(
            "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg sm:w-auto sm:px-6",
            "bg-neutral text-sm font-medium text-neutral-content"
          )}
        >
          <Repeat className="h-4 w-4" />
          Update password
        </button>
      </form>
    </div>
  );
}
