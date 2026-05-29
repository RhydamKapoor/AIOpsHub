import { useEffect, useState } from "react";
import Atropos from "atropos/react";
import "atropos/css";
import { StepBack } from "lucide-react";

function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: coarse), (max-width: 1023px)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 1023px)");
    const update = () => setIsTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isTouch;
}

function AuthCard({ children, prevTab, update, atroposOffset }) {
  const backToLogin = () => {
    const confirmation = confirm("Are you sure you want to go back to login?");
    if (confirmation) {
      prevTab.tab();
    }
  };

  return (
    <div
      className="glass-surface--card pointer-events-auto relative z-30 w-full rounded-xl"
      {...(atroposOffset ? { "data-atropos-offset": "0" } : {})}
    >
      {prevTab?.text && (
        <span
          className="absolute top-2 left-2 z-50 flex cursor-pointer items-center gap-x-2 text-sm text-base-content"
          onClick={update?.newPassword ? backToLogin : prevTab.tab}
          {...(atroposOffset ? { "data-atropos-offset": "0" } : {})}
        >
          <StepBack size={18} /> {prevTab.text}
        </span>
      )}
      <div
        className="pointer-events-auto flex h-auto flex-col rounded-xl px-5 py-8 sm:px-7 sm:py-10"
        {...(atroposOffset ? { "data-atropos-offset": "0" } : {})}
      >
        {children}
      </div>
    </div>
  );
}

export default function AtroposComp({ children, prevTab, update }) {
  const isTouch = useTouchDevice();

  if (isTouch) {
    return (
      <AuthCard prevTab={prevTab} update={update}>
        {children}
      </AuthCard>
    );
  }

  return (
    <Atropos
      className="my-atropos w-full"
      activeOffset={40}
      shadow={false}
      highlight={false}
    >
      <AuthCard prevTab={prevTab} update={update} atroposOffset>
        {children}
      </AuthCard>
    </Atropos>
  );
}
