/**
 * Lead scoring utility
 *
 * Budget-based scoring for Pakistani real-estate market:
 *   > 20M PKR  → High priority, score 90-100
 *   10M–20M    → Medium priority, score 50-80
 *   < 10M      → Low priority, score 10-40
 *
 * Score is further refined by source quality and completeness.
 */

interface ScoreInput {
  budget: number;
  source?: string;
  phone?: string;
  notes?: string;
  propertyInterest?: string;
}

interface ScoreResult {
  score: number;
  priority: "High" | "Medium" | "Low";
}

const SOURCE_BONUS: Record<string, number> = {
  Referral: 10,
  "Walk-in": 8,
  Website: 5,
  Facebook: 3,
  Other: 0,
};

export function calculateLeadScore(input: ScoreInput): ScoreResult {
  let score = 0;

  // Budget tier (primary factor)
  if (input.budget > 20_000_000) {
    score = 85;
  } else if (input.budget >= 10_000_000) {
    score = 55;
  } else if (input.budget >= 5_000_000) {
    score = 35;
  } else {
    score = 15;
  }

  // Source bonus
  score += SOURCE_BONUS[input.source || "Other"] || 0;

  // Completeness bonus
  if (input.phone && input.phone.length > 5) score += 2;
  if (input.notes && input.notes.length > 10) score += 2;
  if (input.propertyInterest && input.propertyInterest.length > 5) score += 1;

  // Cap at 100
  score = Math.min(100, score);

  // Derive priority
  let priority: "High" | "Medium" | "Low";
  if (score >= 70) {
    priority = "High";
  } else if (score >= 40) {
    priority = "Medium";
  } else {
    priority = "Low";
  }

  return { score, priority };
}

export function formatScore(score: number): string {
  if (score >= 70) return `🔥 ${score}`;
  if (score >= 40) return `⚡ ${score}`;
  return `${score}`;
}
