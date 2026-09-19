import { strings } from "@/content/strings";

export function LabScreen() {
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="md:sticky md:top-20 md:self-start" aria-label={strings.lab.settingsLabel} />
      <section className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        {strings.lab.emptyResult}
      </section>
    </div>
  );
}
