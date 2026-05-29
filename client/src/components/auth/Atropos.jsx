import Atropos from "atropos/react";
import "atropos/css";
import { StepBack } from "lucide-react";

export default function AtroposComp({ children, prevTab, update }) { 

  const backToLogin = () => {
    const confirmation = confirm("Are you sure you want to go back to login?");
    if (confirmation) {
      prevTab.tab();
    }
  };

  return (
    <Atropos
      className="my-atropos w-full"
      activeOffset={40}
      shadow={false}
      highlight={false}
    >
      <div
        className="relative z-10 w-full rounded-xl border border-base-content/15 bg-base-100 shadow-xl"
        data-atropos-offset="0"
      >
        {prevTab && prevTab.text && (
          <span
            className="absolute top-2 left-2 z-50 flex cursor-pointer items-center gap-x-2 text-sm text-base-content"
            onClick={update?.newPassword ? backToLogin : prevTab.tab}
            data-atropos-offset="0"
          >
            <StepBack size={18} /> {prevTab.text}
          </span>
        )}
        <div
          className="flex h-auto flex-col rounded-xl px-5 py-8 sm:px-7 sm:py-10"
          data-atropos-offset="0"
        >
          {children}
        </div>
      </div>
    </Atropos>
  );
}
