import { landingAssets, type AssetId } from "@/assets/landing/manifest";
import { cn } from "@/lib/utils";

interface AssetSlotProps {
  id: AssetId;
  /** 실제 그림이 와도 그대로 alt 가 된다. 무엇을 그릴지 설명하는 문장이기도 하다 */
  alt: string;
  /** "16/9" 처럼. CSS aspect-ratio 에 그대로 들어간다 */
  ratio: string;
  /** 배경처럼 내용이 없는 그림. 접근성 트리에서 통째로 뺀다 */
  decorative?: boolean;
  className?: string;
}

/** 그림 자리. 파일이 아직 없으면 점선 상자에 id 와 설명을 적어 둔다.
 *  둘 다 alt/aria-label 이 같아서 스크린리더와 테스트는 같은 것으로 본다.
 *  다크는 prefers-color-scheme 이 아니라 .dark 클래스로 바꾼다 —
 *  이 앱의 테마는 ThemeProvider 가 html 에 붙이는 클래스다 (src/app/theme.tsx) */
export function AssetSlot({ id, alt, ratio, decorative, className }: AssetSlotProps) {
  const entry = landingAssets[id];
  const box = { aspectRatio: ratio };
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": alt } as const);

  if (!entry) {
    return (
      <div
        {...a11y}
        data-asset={id}
        style={box}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted p-6 text-center",
          className,
        )}
      >
        <span className="num text-xs text-muted-foreground">{id}</span>
        <span className="max-w-80 text-sm break-keep text-muted-foreground">{alt}</span>
        <span className="num text-[10px] text-muted-foreground">{ratio}</span>
      </div>
    );
  }

  return (
    <span data-asset={id} className={cn("block", className)}>
      <img
        src={entry.light}
        alt={decorative ? "" : alt}
        aria-hidden={decorative || undefined}
        loading="lazy"
        decoding="async"
        style={box}
        className={cn("w-full rounded-lg", entry.dark && "dark:hidden")}
      />
      {entry.dark && (
        <img
          src={entry.dark}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          style={box}
          className="hidden w-full rounded-lg dark:block"
        />
      )}
    </span>
  );
}
