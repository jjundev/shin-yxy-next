import type { CSSProperties } from "react";
import { Toaster } from "@/design/ui/sonner";
import { useTheme } from "./theme";

/** sonner 의 기본 색 대신 디자인 토큰을 쓰게 다리를 놓는다 */
const TOKEN_BRIDGE = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
} as CSSProperties;

export function AppToaster() {
  const { resolved } = useTheme();
  return <Toaster theme={resolved} style={TOKEN_BRIDGE} />;
}
