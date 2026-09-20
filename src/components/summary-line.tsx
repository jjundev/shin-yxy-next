import type { ReactNode } from "react";
import type { RunResult } from "@/demo/types";
import { cn } from "@/lib/utils";
import type { Piece } from "./summary-text";
import { pieces } from "./summary-text";

function render(p: Piece, i: number): ReactNode {
  if (typeof p === "string") return p;
  const tone = p.sign === null ? undefined : p.sign >= 0 ? "text-up" : "text-down";
  return <b key={i} className={cn("num font-medium", tone)}>{p.num}</b>;
}

export function SummaryLine({ result }: { result: RunResult }) {
  return <p className="text-base leading-relaxed break-keep">{pieces(result).map(render)}</p>;
}
