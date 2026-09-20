import { Moon, Monitor, Sun } from "lucide-react";
import { strings } from "@/content/strings";
import { Button } from "@/design/ui/button";
import { useTheme, type Theme } from "./theme";

const ORDER: Theme[] = ["light", "dark", "system"];

/** 상단 바와 랜딩 헤더가 같이 쓴다. 누를 때마다 라이트 → 다크 → 시스템 설정 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={strings.theme[theme]}
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
    >
      <Icon className="size-4" />
    </Button>
  );
}
