import React from "react";

export default function RoleAssign({ tabs, setTabs, setValue, errors }) {
  const selectRole = (role) => {
    setTabs({
      roleSelection: false,
      personalInfo: true,
    });
    setValue("role", role);
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-y-7 w-full">
      <h1 className="text-4xl font-bold">Select your role</h1>
      <div className="flex *:w-1/2 *:cursor-pointer *:py-4 *:px-9 *:rounded-lg *:border *:border-base-content/20 w-full gap-x-7 *:text-lg">
        <button
          className="flex flex-col items-center justify-center bg-[var(--color-base-300)] text-[var(--color-base-content)]"
          onClick={() => selectRole("Viewer")}
        >
          <h1>Viewer</h1>
        </button>
        <button
          className="flex flex-col items-center justify-center bg-[var(--color-neutral)] text-[var(--color-neutral-content)]"
          onClick={() => selectRole("Editor")}
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
  );
}
