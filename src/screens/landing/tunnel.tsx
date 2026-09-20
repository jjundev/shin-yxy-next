import { useEffect, useRef, useState } from "react";
import { landing } from "@/content/landing";
import { prefersReducedMotion } from "@/lib/motion";
import { LandingSection } from "./section";

const t = landing.tunnel;
const FRAMES = 36;

/** 프레임 번호를 URL 로. public/ 에 있으므로 모듈 그래프에 들어가지 않는다 */
function srcOf(n: number): string {
  return `/landing-assets/time-tunnel/tunnel-${String(n).padStart(3, "0")}.webp`;
}

/** S2.5. S2 대조와 S3 두 시점 사이의 전환.
 *  자동 재생이 아니라 스크럽이다 — 내리면 과거로 가고 올리면 돌아온다.
 *  영상 대신 번호 매긴 이미지를 쓰는 이유: video.currentTime 시킹은 브라우저마다 튄다.
 *  좁은 화면과 감속 모션에서는 마지막 프레임 한 장만 내고 나머지를 받지 않는다 */
export function Tunnel() {
  const img = useRef<HTMLImageElement>(null);
  const [scrub] = useState(
    () =>
      !prefersReducedMotion()
      && typeof window.matchMedia === "function"
      && window.matchMedia("(min-width: 768px)").matches,
  );

  /** 섹션이 가까워지면 36장을 한 번에 받아 둔다. 스크럽 중에 받으면 끊긴다 */
  useEffect(() => {
    if (!scrub) return;
    const el = img.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (let n = 1; n <= FRAMES; n += 1) new Image().src = srcOf(n);
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrub]);

  return (
    <LandingSection
      id="tunnel"
      title={t.title}
      lead={t.lead}
      scrub
      onFrame={(p) => {
        const el = img.current;
        if (!el || !scrub) return;
        const next = srcOf(Math.round(p * (FRAMES - 1)) + 1);
        if (el.getAttribute("src") !== next) el.setAttribute("src", next);
      }}
    >
      <img
        ref={img}
        src={srcOf(FRAMES)}
        alt={t.label}
        decoding="async"
        className="mx-auto h-auto w-full max-w-wide"
      />
    </LandingSection>
  );
}
