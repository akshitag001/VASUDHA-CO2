import type {
  PanchayatData, ViabilityInputs, ViabilityResult, DecisionScore,
  NeighbouringPanchayat, ContractQuestion, ContractTransparencyResult,
  DataConfidenceBreakdown,
} from '../types';
import { computeViability, computeDecisionScore } from '../lib/adapter';

// Real engine, unclamped (Guardrail 1 / thesis-critical: a village going
// standalone-negative must render as negative, never floored at zero).
// See src/lib/adapter.ts computeViability() for the actual math.
export function calculateViability(
  panchayat: PanchayatData,
  inputs: ViabilityInputs,
  additionalHouseholds?: number,
  additionalCarbon?: [number, number],
): ViabilityResult {
  const extraCarbonMid = additionalCarbon ? (additionalCarbon[0] + additionalCarbon[1]) / 2 : 0;
  return computeViability(panchayat, inputs, additionalHouseholds ?? 0, extraCarbonMid);
}

export function calculateDecisionScore(
  panchayat: PanchayatData,
  viability: ViabilityResult,
  methodologyMatches: number,
): DecisionScore {
  return computeDecisionScore(panchayat, viability, methodologyMatches);
}

export function calculateContractTransparency(
  questions: ContractQuestion[],
  answers: Map<string, boolean>,
): ContractTransparencyResult {
  let score = 0;
  let maxScore = 0;
  let answeredCount = 0;
  const warnings: string[] = [];

  for (const q of questions) {
    maxScore += q.weight;
    const answered = answers.get(q.id);
    if (answered) {
      score += q.weight;
      answeredCount++;
    } else {
      if (q.weight === 3) {
        warnings.push(`Critical: "${q.question}" not addressed`);
      }
    }
  }

  return {
    score,
    maxScore,
    answeredCount,
    totalQuestions: questions.length,
    warnings,
  };
}

// Honestly derived from the village's actual data provenance (Guardrail: never a
// hardcoded confidence label). `isPilot`/`dataQuality` come from resolveVillage() —
// 'measured' means a sourced open-data snapshot exists; 'regional-estimate' means
// figures were scaled from state-level defaults, not ground-truthed.
export function getDataConfidenceBreakdown(panchayat: PanchayatData): DataConfidenceBreakdown {
  const measured = panchayat.dataQuality === 'measured';
  return {
    overall: measured ? 'high' : panchayat.dataConfidence >= 3 ? 'medium' : 'low',
    landUseData: measured ? 'high' : 'low',
    livestockData: measured ? 'medium' : 'low',
    projectActivityData: measured ? 'medium' : 'low',
    methodologyMatch: measured ? 'medium' : 'low',
    spatialAccuracy: panchayat.lat && panchayat.lon ? (measured ? 'high' : 'medium') : 'low',
  };
}

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)} lakh`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatRange(range: [number, number]): string {
  return `${formatCurrency(range[0])} – ${formatCurrency(range[1])}`;
}

export function getCombinedPotential(
  panchayat: PanchayatData,
  selected: NeighbouringPanchayat[],
): { carbon: [number, number]; households: number } {
  const carbon: [number, number] = [
    panchayat.carbonPotential.total[0] + selected.reduce((s, p) => s + p.carbonPotential[0], 0),
    panchayat.carbonPotential.total[1] + selected.reduce((s, p) => s + p.carbonPotential[1], 0),
  ];
  const households = panchayat.households + selected.reduce((s, p) => s + p.households, 0);
  return { carbon, households };
}
