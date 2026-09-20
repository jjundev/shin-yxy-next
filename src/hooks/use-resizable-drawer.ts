import { useCallback, useEffect, useRef, useState } from "react";

export interface UseResizableDrawerOptions {
  direction?: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  snapThreshold?: number;
  storageKeyWidth?: string;
  storageKeyCollapsed?: string;
  defaultCollapsed?: boolean | (() => boolean);
}

export const DEFAULT_DRAWER_WIDTH = 320;
export const MIN_DRAWER_WIDTH = 260;
export const MAX_DRAWER_WIDTH = 480;
export const SNAP_DRAWER_THRESHOLD = 180;

function readStorageNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const num = Number.parseInt(raw, 10);
    return Number.isFinite(num) ? num : fallback;
  } catch {
    return fallback;
  }
}

function readStorageBool(
  key: string,
  fallback: boolean | (() => boolean),
): boolean {
  if (typeof window === "undefined") {
    return typeof fallback === "function" ? fallback() : fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw === "true";
    return typeof fallback === "function" ? fallback() : fallback;
  } catch {
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

export function useResizableDrawer(options: UseResizableDrawerOptions = {}) {
  const {
    direction = "left",
    defaultWidth = DEFAULT_DRAWER_WIDTH,
    minWidth = MIN_DRAWER_WIDTH,
    maxWidth = MAX_DRAWER_WIDTH,
    snapThreshold = SNAP_DRAWER_THRESHOLD,
    storageKeyWidth = "shin.lab.rail-width",
    storageKeyCollapsed = "shin.lab.rail-collapsed",
    defaultCollapsed = false,
  } = options;

  const sign = direction === "right" ? -1 : 1;

  const [width, setWidthState] = useState(() => {
    const stored = readStorageNumber(storageKeyWidth, defaultWidth);
    return Math.max(minWidth, Math.min(maxWidth, stored));
  });

  const [isCollapsed, setIsCollapsedState] = useState(() =>
    readStorageBool(storageKeyCollapsed, defaultCollapsed),
  );

  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const setWidth = useCallback(
    (nextWidth: number) => {
      const clamped = Math.max(minWidth, Math.min(maxWidth, nextWidth));
      setWidthState(clamped);
      writeStorage(storageKeyWidth, String(clamped));
    },
    [minWidth, maxWidth, storageKeyWidth],
  );

  const setIsCollapsed = useCallback(
    (collapsed: boolean) => {
      setIsCollapsedState(collapsed);
      writeStorage(storageKeyCollapsed, String(collapsed));
    },
    [storageKeyCollapsed],
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      writeStorage(storageKeyCollapsed, String(next));
      return next;
    });
  }, [storageKeyCollapsed]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return; // Only primary button
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback if pointer capture fails
      }
      dragStartRef.current = {
        startX: e.clientX,
        startWidth: width,
      };
      setIsDragging(true);
    },
    [width],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const delta = e.clientX - dragStartRef.current.startX;
      const rawWidth = dragStartRef.current.startWidth + sign * delta;

      if (rawWidth < snapThreshold) {
        // Below snap threshold - allow UI to reflect collapsing soon
        setWidthState(minWidth);
      } else {
        const clamped = Math.max(minWidth, Math.min(maxWidth, rawWidth));
        setWidthState(clamped);
      }
    },
    [isDragging, sign, minWidth, maxWidth, snapThreshold],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const delta = e.clientX - dragStartRef.current.startX;
      const rawWidth = dragStartRef.current.startWidth + sign * delta;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      dragStartRef.current = null;
      setIsDragging(false);

      if (rawWidth < snapThreshold) {
        setIsCollapsed(true);
      } else {
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, rawWidth));
        setWidth(finalWidth);
        setIsCollapsed(false);
      }
    },
    [isDragging, sign, snapThreshold, minWidth, maxWidth, setIsCollapsed, setWidth],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const expandKey = direction === "right" ? "ArrowLeft" : "ArrowRight";
      const shrinkKey = direction === "right" ? "ArrowRight" : "ArrowLeft";

      if (e.key === shrinkKey) {
        e.preventDefault();
        if (isCollapsed) return;
        if (width <= minWidth) {
          setIsCollapsed(true);
        } else {
          setWidth(Math.max(minWidth, width - 10));
        }
      } else if (e.key === expandKey) {
        e.preventDefault();
        if (isCollapsed) {
          setIsCollapsed(false);
        } else {
          setWidth(Math.min(maxWidth, width + 10));
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        setIsCollapsed(false);
        setWidth(minWidth);
      } else if (e.key === "End") {
        e.preventDefault();
        setIsCollapsed(false);
        setWidth(maxWidth);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCollapse();
      }
    },
    [direction, isCollapsed, width, minWidth, maxWidth, setIsCollapsed, setWidth, toggleCollapse],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = e.clientX - dragStartRef.current.startX;
      const rawWidth = dragStartRef.current.startWidth + sign * delta;

      if (rawWidth < snapThreshold) {
        setWidthState(minWidth);
      } else {
        const clamped = Math.max(minWidth, Math.min(maxWidth, rawWidth));
        setWidthState(clamped);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = e.clientX - dragStartRef.current.startX;
      const rawWidth = dragStartRef.current.startWidth + sign * delta;

      dragStartRef.current = null;
      setIsDragging(false);

      if (rawWidth < snapThreshold) {
        setIsCollapsed(true);
      } else {
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, rawWidth));
        setWidth(finalWidth);
        setIsCollapsed(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, sign, snapThreshold, minWidth, maxWidth, setIsCollapsed, setWidth]);

  return {
    width,
    isCollapsed,
    isDragging,
    direction,
    minWidth,
    maxWidth,
    snapThreshold,
    setWidth,
    setIsCollapsed,
    toggleCollapse,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  };
}
