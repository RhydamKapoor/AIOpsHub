import Atropos from "atropos/react";
import "atropos/css";
import { StepBack } from "lucide-react";

export default function AtroposComp({ children, prevTab }) {
  return (
    <Atropos
      className="my-atropos w-full"
      activeOffset={40}
      shadow={false}
      highlight={false}
    >
      <div className="bg-[var(--color-base-100)]/50 rounded-lg border-[var(--color-base-content)]/20 border shadow-xl w-full relative">
        {prevTab && prevTab.text && (
          <span className="absolute top-2 left-2 text-sm text-base-content flex items-center gap-x-2 cursor-pointer z-50" onClick={prevTab.tab}>
            <StepBack size={18} /> {prevTab.text}
          </span>
        )}
        <div className="flex flex-col backdrop-blur-lg rounded-lg px-7 py-10 h-auto">
          {children}
        </div>
      </div>
    </Atropos>
  );
}
