import { strings } from "@/content/strings";
import { TERM_GLOSSARY, label } from "@/content/labels";
import type { LabConfig, RunRequest, RunResult } from "@/demo/types";
import { GUIDE_STEPS, type GuideStep } from "./guide";
import { WhyCalc, WhySheet, WhyVerdict } from "./why-sheet";

interface GuideCardProps {
  step: GuideStep;
  config: LabConfig;
  request: RunRequest;
  result: RunResult | null;
}

/** 오른쪽 결과 영역의 안내 카드 한 장. "지금 할 일"과 이유, 처음 나온 용어, 같은 섹션의 "왜?" 시트 (상위 스펙 5.1, 3.3, 3.4) */
export function GuideCard({ step, config, request, result }: GuideCardProps) {
  const t = strings.lab.guide;
  const spec = GUIDE_STEPS[step - 1];
  const copy = t.steps[step - 1];
  const headingId = `guide-step-${step}`;
  const why = spec.why === "summary"
    ? { title: strings.lab.summary.title, description: strings.lab.whyDescription.summary, body: <WhyCalc config={config} request={request} result={result} /> }
    : { title: strings.lab.verdict.title, description: strings.lab.whyDescription.verdict, body: <WhyVerdict asOf={request.asOf} /> };
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-accent/40 p-4">
      <h2 id={headingId} className="text-base font-semibold break-keep">
        <span className="num text-muted-foreground">{t.progress(step)}</span> · {copy.head}
      </h2>
      <p className="text-sm leading-relaxed break-keep">{copy.body}</p>
      {spec.terms.length > 0 && (
        <dl aria-label={t.terms} className="flex flex-col gap-1 border-t pt-3 text-sm">
          {spec.terms.map((term) => (
            <div key={term}>
              <dt className="font-medium">{label(term)} <span className="font-normal text-muted-foreground">· {term}</span></dt>
              <dd className="text-muted-foreground break-keep">{TERM_GLOSSARY[term]}</dd>
            </div>
          ))}
        </dl>
      )}
      <div>
        <WhySheet title={why.title} description={why.description} triggerLabel={t.why}>
          {why.body}
        </WhySheet>
      </div>
    </section>
  );
}
