import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

const EASE = [0.4, 0, 0.2, 1];

/**
 * Smooth accordion expand/collapse (300ms) using measured height + motion.
 * Pass `alwaysOpenFrom` (e.g. "lg") to keep open at that breakpoint and up.
 */
export function CollapsiblePanel({
  open,
  children,
  className,
  alwaysOpenFrom,
  duration = 0.3,
}) {
  const contentRef = useRef(null);
  const alwaysOpen = useMediaQuery(
    alwaysOpenFrom ? BREAKPOINTS[alwaysOpenFrom] : "(max-width: 0px)"
  );
  const isExpanded = open || alwaysOpen;
  const [height, setHeight] = useState(isExpanded ? "auto" : 0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isExpanded) {
      setHeight(el.scrollHeight);
      const id = window.setTimeout(() => setHeight("auto"), duration * 1000);
      return () => window.clearTimeout(id);
    }

    setHeight(el.scrollHeight);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setHeight(0));
    });
    return () => cancelAnimationFrame(frame);
  }, [isExpanded, duration, children]);

  return (
    <motion.div
      initial={false}
      animate={{ height }}
      transition={{ duration, ease: EASE }}
      className={cn("overflow-hidden", className)}
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}

export const accordionChevronClass = (open) =>
  cn(
    "h-5 w-5 shrink-0 transition-transform duration-300 ease-in-out motion-reduce:transition-none",
    open && "rotate-180"
  );
