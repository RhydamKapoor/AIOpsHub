import { useForm } from "react-hook-form";
import { useBoolToggle } from "react-haiku";
import { Eye, EyeClosed } from "lucide-react";
import {
  emailVerificationSchema,
  passwordVerificationSchema,
} from "../../../utils/Validation";
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosConfig";

export default function ForgotPassword({ update, setUpdate, setTabs }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [show, setShow] = useBoolToggle();
  const [error, setError] = useState({});

  const sendOTP = async (data) => {
    const result = emailVerificationSchema.safeParse(data.email);

    if (result.success) {
      setError({});
      const toastId = toast.loading("Sending OTP...");
      try {
        const response = await axiosInstance.post("/auth/sendOtp", {
          email: data.email,
        });
        if (response.status === 200) {
          setUpdate({
            verifyOTP: true,
            newPassword: false,
          });
          toast.success("OTP sent successfully", { id: toastId });
        } else {
          toast.error("Failed to send OTP", { id: toastId });
        }
      } catch (error) {
        toast.error(error.response?.data?.msg, { id: toastId });
      }
    } else {
      const errorMessage = result.error.errors?.[0]?.message || "Invalid input";
      setError({ email: [errorMessage] });
      return;
    }
  };

  const verifyOTP = async (data) => {
    const toastId = toast.loading("Verifying OTP...");
    try {
      const response = await axiosInstance.post("/auth/verifyOtp", {
        otp: data.otp,
        email: data.email,
      });

      setUpdate({
        verifyOTP: false,
        newPassword: true,
      });
      toast.success("OTP verified successfully", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.msg, { id: toastId });
    }
  };

  const createNewPassword = async (data) => {
    const result = passwordVerificationSchema.safeParse(data.password);

    if (result.success) {
      const toastId = toast.loading("Creating new password...");
      try {
        const response = await axiosInstance.post("/auth/newPassword", {
          email: data.email,
          password: data.password,
        });
        if (response.status === 200) {
          toast.success("Password updated successfully", { id: toastId });
          setUpdate({
            verifyOTP: false,
            newPassword: false,
          });
          setTabs({
            loginInfo: true,
            forgotPassword: false,
          });
        } else {
          toast.error("Failed to update password", { id: toastId });
        }
      } catch (error) {
        toast.error(error.response?.data?.msg || "Password update failed", {
          id: toastId,
        });
      }
    } else {
      const errorMessage = result.error.errors?.[0]?.message || "Invalid input";
      setError({ password: [errorMessage] });
      return;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full gap-y-5">
      <h1 className="text-4xl font-bold uppercase p-3">Forgot Password</h1>
      {!update.newPassword ? (
        <form
          className="flex flex-col w-full gap-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (update.verifyOTP) {
              handleSubmit(verifyOTP)(e);
            } else {
              handleSubmit(sendOTP)(e);
            }
          }}
        >
          <div className="flex flex-col">
            {/* Email */}
            <div className="flex flex-col w-full">
              <div className="flex flex-col relative">
                <label htmlFor="email" className={`capitalize translate-x-4`}>
                  Enter your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border rounded-full outline-none px-5 py-2.5 lowercase"
                  {...register("email")}
                  disabled={update.verifyOTP}
                />
              </div>
              <p
                className={`${
                  error?.email ? `visible` : `invisible`
                } pl-2 text-red-500 text-sm`}
              >
                {error?.email || `Error`}
              </p>
            </div>

            {/* OTP */}
            {update.verifyOTP && (
              <div className="flex flex-col">
                <label htmlFor="otp" className={`capitalize translate-x-4`}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  {...register("otp")}
                  className="w-full border rounded-full outline-none px-5 py-2.5 lowercase"
                  minLength={6}
                  maxLength={6}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(sendOTP)(e);
                    }}
                  >
                    Resend OTP?
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] py-3 w-full rounded-full font-bold cursor-pointer"
          >
            {update.verifyOTP ? "Verify OTP" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col w-full gap-y-5"
          onSubmit={handleSubmit(createNewPassword)}
        >
          <div className="flex flex-col">
            <label htmlFor="password" className={`capitalize translate-x-4`}>
              Create New Password
            </label>
            <div className="flex flex-col relative">
              <input
                type={!show ? "password" : "text"}
                id="password"
                className="w-full border rounded-full outline-none px-5 py-2.5 pr-14"
                {...register("password")}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer">
                {show ? (
                  <Eye size={20} onClick={() => setShow()} />
                ) : (
                  <EyeClosed size={20} onClick={() => setShow()} />
                )}
              </span>
            </div>
              <p
                className={`${
                  error?.password ? `visible` : `invisible`
                } pl-2 text-red-500 text-sm`}
              >
                {error?.password || `Error`}
              </p>
          </div>

          <button
            type="submit"
            className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] py-3 w-full rounded-full font-bold cursor-pointer"
            onClick={createNewPassword}
          >
            Save Password
          </button>
        </form>
      )}
    </div>
  );
}
