import * as React from "react";
import { GripVertical, PanelLeftOpen } from "lucide-react";
import { Button } from "@/design/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  isDragging: boolean;
  isCollapsed?: boolean;
  side?: "left" | "right";
  ariaLabel?: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function ResizeHandle({
  isDragging,
  isCollapsed = false,
  side = "right",
  ariaLabel,
  width,
  minWidth,
  maxWidth,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  className,
  ...props
}: ResizeHandleProps) {
  const defaultLabel = side === "left" ? "분석 패널 너비 조절" : "설정 패널 너비 조절";

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={ariaLabel ?? defaultLabel}
      aria-valuenow={isCollapsed ? 0 : width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative hidden md:flex items-center justify-center w-3 -mx-1.5 cursor-col-resize select-none touch-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-xs",
        "transition-colors duration-150 z-20 self-stretch",
        isDragging && "pointer-events-auto",
        className,
      )}
      {...props}
    >
      {/* Visual divider line */}
      <div
        className={cn(
          "h-full w-[2px] rounded-full bg-border transition-colors duration-150",
          "group-hover:bg-primary/80 group-hover:w-[3px]",
          "group-focus-visible:bg-primary group-focus-visible:w-[3px]",
          isDragging && "bg-primary w-[3px]",
        )}
      />
      {/* Central handle grip pill */}
      <div
        className={cn(
          "absolute top-24 -translate-y-1/2 flex items-center justify-center size-5 rounded-full border bg-background shadow-xs text-muted-foreground transition-all duration-150",
          "group-hover:text-primary group-hover:scale-110 group-hover:border-primary/50",
          "group-focus-visible:text-primary group-focus-visible:scale-110",
          isDragging && "text-primary scale-110 border-primary shadow-sm",
        )}
      >
        <GripVertical className="size-3" />
      </div>
    </div>
  );
}

export interface DrawerTriggerProps {
  onClick: () => void;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  side?: "left" | "right";
  className?: string;
}

export function DrawerTrigger({
  onClick,
  label = "설정 패널 열기",
  icon: Icon = PanelLeftOpen,
  side = "left",
  className,
}: DrawerTriggerProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClick}
          aria-label={label}
          className={cn(
            "hidden md:inline-flex items-center gap-1.5 shadow-xs bg-background/95 backdrop-blur-xs hover:bg-accent",
            className,
          )}
        >
          <Icon className="size-4" />
          <span className="text-xs font-medium">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side === "left" ? "right" : "left"}>{label}</TooltipContent>
    </Tooltip>
  );
}
