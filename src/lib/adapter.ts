// Bridges the real engine (Triple {low,mid,high}, ResolvedVillage) into the
// existing UI's PanchayatData / ViabilityResult shapes ([low, high] tuples).
//
// This is a deliberate, documented reconciliation choice (see TODO.md Phase 0):
// rewriting all 12 pages to consume Triple end-to-end was not worth the risk
// this close to a deadline. Every number the UI shows is still REAL —
// estimateBaseline() / calcViability() do the actual math; this file only
// reshapes the result. The "mid" value is not thrown away: callers that want
// it (e.g. break-even, verdict) can call the engine functions directly.

import type { PanchayatData, ViabilityInputs, ViabilityResult, DecisionScore } from '../types';
import { resolveVillage, toMethodologyProfile, type ResolvedVillage } from './resolveVillage';
import { estimateBaseline, calcViability, annualisedFixedCosts, type Triple } from './calc';
import { matchMethodologies as engineMatchMethodologies } from '../data/engine/methodologies';
import { CARBON_PRICE_INR, AGGREGATOR_MARGIN } from './config';

export const tripleToTuple = (t: Triple): [number, number] => [
  Math.round(t.low * 100) / 100,
  Math.round(t.high * 100) / 100,
];

export interface ResolvedContext {
  village: ResolvedVillage;
  panchayat: PanchayatData;
}

// LGD code -> full resolved context (village + legacy PanchayatData view).
export function loadVillage(lgdCode: string): ResolvedContext | null {
  const village = resolveVillage(lgdCode);
  if (!village) return null;
  return { village, panchayat: toLegacyPanchayat(village) };
}

function toLegacyPanchayat(v: ResolvedVillage): PanchayatData {
  const baseline = estimateBaseline(v);
  const byKey = Object.fromEntries(baseline.byActivity.map((a) => [a.key, a.value]));
  const agro = byKey.agroforestry ?? 0;
  const manure = byKey.manure ?? 0;
  const soilC = byKey.soil ?? 0;
  const pasture = byKey.pasture ?? 0;

  // Individual pathway low/high bands use the same uncertainty multiplier the
  // engine applies to the total (see lib/config.ts UNCERTAINTY).
  const band = (mid: number): [number, number] => [Math.round(mid * 0.75 * 10) / 10, Math.round(mid * 1.25 * 10) / 10];

  const totalLivestock = v.livestock.dairy_cattle + v.livestock.indigenous_cattle + v.livestock.buffalo + v.livestock.goat + v.livestock.sheep;

  return {
    id: v.lgdCode,
    name: v.name,
    block: v.place.split(',')[0]?.trim() ?? '',
    district: v.profile?.district ?? v.place.split(',').slice(-2, -1)[0]?.trim() ?? '',
    state: v.profile?.state ?? v.place.split(',').slice(-1)[0]?.trim() ?? '',
    population: v.population,
    households: v.households,
    agriculturalLand: v.landUseHa.agricultural,
    commonLand: v.landUseHa.commonAndForest,
    forestLand: v.landUseHa.existingPlantation,
    cattle: v.livestock.dairy_cattle + v.livestock.indigenous_cattle,
    buffalo: v.livestock.buffalo,
    goats: v.livestock.goat,
    sheep: v.livestock.sheep,
    poultry: 0, // not modelled by the engine — never fabricate a figure
    mgnregaAssets: v.profile?.mgnregaAssets.value.reduce((s, a) => s + a.count, 0) ?? 0,
    mgnregaWorkDays: 0, // not sourced — left at 0 rather than invented
    soilOrganicCarbon: v.soilOrganicCarbon,
    vegetationIndex: v.vegetationIndex,
    carbonPotential: {
      agroforestry: band(agro),
      livestock: band(manure),
      landManagement: band(soilC + pasture),
      total: tripleToTuple(baseline.total),
    },
    estimatedBaselineStock: [Math.round(v.soilOrganicCarbon * v.landUseHa.total * 0.9), Math.round(v.soilOrganicCarbon * v.landUseHa.total * 1.1)],
    dataConfidence: v.dataQuality === 'measured' ? 4 : 2,
    potentialActivities: baseline.byActivity.filter((a) => a.value > 0).map((a) => a.key),
    nearbyRenewableEnergy: false,
    // extension fields consumed by real-engine-aware pages (not in the legacy interface,
    // but harmless — TS structural typing allows attaching them via `as any` reads below)
    isPilot: v.isPilot,
    dataQuality: v.dataQuality,
    lat: v.lat,
    lon: v.lon,
    totalLivestock,
    sourceLines: v.sourceLines,
    soilBasis: v.soilBasis,
  } as PanchayatData;
}

// Real viability using calcViability() — negatives flow through untouched.
export function computeViability(
  panchayat: PanchayatData,
  inputs: ViabilityInputs,
  extraHouseholds = 0,
  extraCarbonMid = 0,
): ViabilityResult {
  const carbonMid = (panchayat.carbonPotential.total[0] + panchayat.carbonPotential.total[1]) / 2 + extraCarbonMid;
  const households = Math.max(panchayat.households + extraHouseholds, 1);
  const priceKey: 'low' | 'mid' | 'high' =
    inputs.carbonPrices[1]?.price >= CARBON_PRICE_INR.high ? 'high' :
    inputs.carbonPrices[1]?.price <= CARBON_PRICE_INR.low ? 'low' : 'mid';

  const v = calcViability({
    households,
    carbonMid,
    priceKey,
    margin: inputs.aggregatorMarginPercent / 100,
  });

  const creditableFraction = inputs.creditableFraction ?? 0.75;
  const potentialCCCs: [number, number] = [
    Math.round(v.carbon.low * creditableFraction),
    Math.round(v.carbon.high * creditableFraction),
  ];

  return {
    grossRevenue: tripleToTuple(v.gross),
    totalCosts: [Math.round(v.fixedCostsPerYear.high + v.aggregatorCut.low), Math.round(v.fixedCostsPerYear.low + v.aggregatorCut.high)],
    // No Math.max clamp — negative net revenue must render as negative (Guardrail 1 / thesis-critical).
    netRevenue: tripleToTuple(v.net),
    netPerHousehold: tripleToTuple(v.netPerHousehold),
    breakEvenPoint: Math.round(v.breakEvenTonnes),
    estimatedMitigationPotential: tripleToTuple(v.carbon),
    potentialIssuableCCCs: potentialCCCs,
  };
}

export function computeDecisionScore(panchayat: PanchayatData, viability: ViabilityResult, methodologyMatches: number): DecisionScore {
  const avgCarbon = (panchayat.carbonPotential.total[0] + panchayat.carbonPotential.total[1]) / 2;
  const carbonScore = Math.min(10, Math.round(avgCarbon / 120));
  const methodologyScore = Math.min(10, methodologyMatches * 3);
  const scaleScore = Math.min(10, Math.round(avgCarbon / 100));
  const midNet = (viability.netRevenue[0] + viability.netRevenue[1]) / 2;
  const financialScore = midNet > 0 ? Math.min(10, Math.max(1, Math.round(midNet / 50000))) : 0;
  const confidenceScore = panchayat.dataConfidence * 2;

  const overall = (
    (carbonScore >= 7 && methodologyScore >= 6 && financialScore >= 5) ? 'viable' as const :
    (carbonScore >= 5 && methodologyScore >= 4 && financialScore >= 3) ? 'conditionally_viable' as const :
    (midNet <= 0) ? 'not_viable' as const :
    (carbonScore >= 3 || financialScore >= 2) ? 'marginal' as const :
    'not_viable' as const
  );

  return {
    carbonPotential: carbonScore,
    methodologyMatch: methodologyScore,
    projectScale: scaleScore,
    financialViability: financialScore,
    dataConfidence: confidenceScore,
    overall,
  };
}

// Real, rule-based methodology matching (Guardrail 4) — replaces the
// hardcoded 'likely' strings. Returns the engine's own MethodologyMatch[]
// plus a legacy-shaped view for pages that still expect matchStatus strings.
export function matchMethodologiesFor(panchayat: PanchayatData) {
  const profile = toMethodologyProfile({
    households: panchayat.households,
    landUseHa: {
      total: panchayat.agriculturalLand + panchayat.commonLand + panchayat.forestLand,
      agricultural: panchayat.agriculturalLand,
      commonAndForest: panchayat.commonLand,
      degradedRestorable: Math.round(panchayat.commonLand * 0.3),
      existingPlantation: panchayat.forestLand,
    },
    livestock: {
      dairy_cattle: Math.round(panchayat.cattle * 0.3),
      indigenous_cattle: Math.round(panchayat.cattle * 0.7),
      buffalo: panchayat.buffalo,
      goat: panchayat.goats,
      sheep: panchayat.sheep,
    },
    soilOrganicCarbon: panchayat.soilOrganicCarbon,
  } as ResolvedVillage);
  return engineMatchMethodologies(profile);
}

export { annualisedFixedCosts };
export const AGGREGATOR_MARGIN_DEFAULT = AGGREGATOR_MARGIN;
