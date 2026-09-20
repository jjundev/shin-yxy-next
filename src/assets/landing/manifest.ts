import contrastApp from "./contrast-forecast-app.webp";

/** 랜딩 그림 자리의 목록. 무엇을 그려야 하는지는 docs/landing-assets.md 에 있다.
 *
 *  그림 파일이 이 폴더에 들어오면 import 하고 landingAssets 에 한 줄을 더한다:
 *    import labLight from "./lab-full-light.webp";
 *    import labDark from "./lab-full-dark.webp";
 *    export const landingAssets: Partial<Record<AssetId, AssetEntry>> = {
 *      "lab-full": { light: labLight, dark: labDark },
 *    };
 *  그러면 AssetSlot 이 점선 자리 대신 그 그림을 쓴다. 다른 코드는 손댈 것이 없다 */
export type AssetId =
  | "contrast-forecast-app"
  | "lab-full"
  | "lab-mobile";

export interface AssetEntry {
  light: string;
  /** 없으면 라이트 그림을 두 테마에 같이 쓴다 */
  dark?: string;
}

export const landingAssets: Partial<Record<AssetId, AssetEntry>> = {
  // 다크판이 없다. 불투명 흰 캔버스지만 S2 가 인용틀로 감싸 의도로 읽히게 한다
  "contrast-forecast-app": { light: contrastApp },
  // lab-full, lab-mobile 은 아직 없다 — Task 13 뒤에 Playwright 로 캡처한다
};
