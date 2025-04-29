import AtroposComp from "@/components/auth/Atropos";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleAssign() {
  const router = useNavigate()

  const selectedRole = (name) => {
    router(`/signup?role=${name}`)
  }
  return (
    <div className="flex flex-col justify-center items-center h-full *:w-fit overflow-hidden">
      <AtroposComp>
        <div className="flex flex-col items-center justify-center h-full gap-y-7 w-full">
          <h1 className="text-4xl font-bold">Select your role</h1>
          <div className="flex *:w-1/2 *:cursor-pointer *:py-4 *:px-9 *:rounded-lg *:border *:border-base-content/20 w-full gap-x-7 *:text-lg">
            <button
              className="flex flex-col items-center justify-center bg-[var(--color-base-300)] text-[var(--color-base-content)]"
              onClick={() => selectedRole("Viewer")}
            >
              <h1>Viewer</h1>
            </button>
            <button
              className="flex flex-col items-center justify-center bg-[var(--color-neutral)] text-[var(--color-neutral-content)]"
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
  );
}
