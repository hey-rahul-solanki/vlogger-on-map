import type { Confidence } from "../types";

export function confidenceLabel(confidence: Confidence): string {
  return {
    confirmed: "Confirmed",
    likely: "Likely",
    needs_review: "Needs review",
  }[confidence];
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 55) return "Good";
  return "Emerging";
}

