import AtroposComp from "@/components/auth/Atropos";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleAssign() {
  const router = useNavigate()

  const selectedRole = (name) => {
    router(`/signup?role=${name}`)
  }
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden px-4 py-6">
      <div className="w-full max-w-lg">
      <AtroposComp>
        <div className="flex w-full flex-col items-center justify-center gap-y-7">
          <h1 className="text-2xl font-bold text-center sm:text-4xl">Select your role</h1>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-7 *:cursor-pointer *:rounded-lg *:border *:border-base-content/20 *:py-4 *:px-6 *:text-lg sm:*:flex-1">
            <button
              className="flex flex-col items-center justify-center bg-base-300 text-base-content"
              onClick={() => selectedRole("Viewer")}
            >
              <h1>Viewer</h1>
            </button>
            <button
              className="flex flex-col items-center justify-center bg-neutral text-neutral-content"
              onClick={() => selectedRole("Editor")}
            >
              <h1>Editor</h1>
            </button>
          </div>
          {/* <div className="flex justify-center items-center">
        <p
          className={`${
            errors?.role ? `visible` : `invisible`
          } pl-2 text-red-500 text-sm`}
        >
          {errors?.role?.message || `Error`}
        </p>
      </div> */}
        </div>
      </AtroposComp>
      </div>
    </div>
  );
}
