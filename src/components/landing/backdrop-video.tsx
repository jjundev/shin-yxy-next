import { useState } from "react";
import { useTheme } from "@/app/theme";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface BackdropVideoProps {
  /** public/landing-assets/<name>/<name>-{light,dark}.{webm,mp4,webp} */
  name: string;
  className?: string;
}

/** 장식 배경 영상. 내용이 없으므로 접근성 트리에서 통째로 뺀다.
 *  라이트·다크는 두 개를 깔지 않고 해결된 테마로 하나만 고른다 — 둘 다 깔면 2.2MB 를 받는다.
 *  감속 모션이면 포스터 한 장만 낸다. jsdom 에는 matchMedia 가 없어 false 로 떨어지므로
 *  단위 테스트는 <video> 를 본다 */
export function BackdropVideo({ name, className }: BackdropVideoProps) {
  const { resolved } = useTheme();
  const [still] = useState(prefersReducedMotion);
  const base = `/landing-assets/${name}/${name}-${resolved}`;

  if (still) {
    return (
      <img
        src={`${base}.webp`}
        alt=""
        aria-hidden="true"
        data-backdrop={name}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <video
      key={resolved}
      autoPlay
      muted
      loop
      playsInline
      poster={`${base}.webp`}
      aria-hidden="true"
      data-backdrop={name}
      className={cn("h-full w-full object-cover", className)}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
