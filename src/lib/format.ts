const MINUS = "−";
const NONE = "—";

function signed(v: number, suffix: string): string {
  return (v >= 0 ? "+" : MINUS) + Math.abs(v * 100).toFixed(1) + suffix;
}

export function formatPct(v: number | null | undefined): string {
  return v == null ? NONE : signed(v, "%");
}

export function formatPp(v: number | null | undefined): string {
  return v == null ? NONE : signed(v, "%p");
}
