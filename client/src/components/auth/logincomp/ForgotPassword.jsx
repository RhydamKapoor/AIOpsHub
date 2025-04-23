import React from "react";
import { emailVerificationSchema } from "../../../utils/Validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ForgotPassword({ tabs, setTabs }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailVerificationSchema),
  });
  return (
    <div className="flex flex-col justify-center items-center h-full gap-y-5">
      <h1 className="text-4xl font-bold uppercase p-3">Forgot Password</h1>

      <div className="flex flex-col w-full">
        <div className="flex flex-col relative">
          <label htmlFor="email" className={`capitalize translate-x-4`}>
            Enter your email
          </label>
          <input
            type="text"
            id="email"
            className="w-full border rounded-full outline-none px-5 py-2.5 peer lowercase"
            {...register("email")}
          />
        </div>
        <p
          className={`${
            errors?.email ? `visible` : `invisible`
          } pl-2 text-red-500 text-sm`}
        >
          {errors?.email?.message || `Error`}
        </p>
      </div>
      <button type="submit" className="bg-[var(--color-neutral)] text-[var(--color-neutral-content)] py-3 w-full rounded-full font-bold cursor-pointer">
        Send OTP
      </button>
    </div>
  );
}
