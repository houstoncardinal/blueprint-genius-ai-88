import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Wrap any control to add a hover/focus tooltip.
 * <HelpTip label="Saves this section to your blueprint."><Button>Save</Button></HelpTip>
 */
export function HelpTip({
  label,
  children,
  side = "top",
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{children}</span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-[11px] leading-snug">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Small "?" icon that reveals an explanation on hover/focus. Use next to a section title. */
export function InfoDot({ label, side = "top" }: { label: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What is this?"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-[11px] leading-snug">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { TooltipProvider };
