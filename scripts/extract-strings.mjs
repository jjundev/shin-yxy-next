// 번들의 앱 구간(데모 어댑터 뒤)에서 한국어가 든 문자열 리터럴을 모아 참고용 JSON 으로 쓴다.
// 템플릿 문자열 안의 ${...} 는 {} 로 바꾼다. 화면 문구를 다시 쓸 때 원본을 찾아보는 용도다.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const bundle = resolve(here, "../../shin-yxy-mock/assets/index-DpGc5H-z.js");
const out = resolve(here, "../src/content/extracted.json");

const js = readFileSync(bundle, "utf8");
const appStart = js.indexOf("var wy={get:e=>Cy(");
if (appStart < 0) throw new Error("app region marker not found");
const app = js.slice(appStart);

const found = new Set();
for (const m of app.matchAll(/`([^`]*[가-힣][^`]*)`/g)) {
  const s = m[1].replace(/\$\{[^}]*\}/g, "{}").trim();
  if (s) found.add(s);
}
for (const m of app.matchAll(/"([^"\\]*[가-힣][^"\\]*)"/g)) {
  const s = m[1].trim();
  if (s) found.add(s);
}

const list = [...found].sort((a, b) => a.localeCompare(b, "ko"));
writeFileSync(out, JSON.stringify(list, null, 2) + "\n");
console.log(`wrote ${out} (${list.length} strings)`);
