import type { Maturity } from "@/lib/types";

export const MATURITY_LABELS: Record<Maturity, string> = {
  0: "G",
  7: "PG",
  13: "PG-13",
  16: "R",
  18: "NC-17",
};

export const KIDS_MAX_RATINGS: Maturity[] = [0, 7, 13];
export const ALL_MAX_RATINGS: Maturity[] = [0, 7, 13, 16, 18];

export function maturityLabel(value: number): string {
  return MATURITY_LABELS[value as Maturity] ?? "NR";
}

export function isAllowed(maxRating: number, maturity: number): boolean {
  return maturity <= maxRating;
}
