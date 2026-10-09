// Builds engine parameter objects from the assumptions config.

import { ASSUMPTIONS as A, type Assumption } from '../config/assumptions'
import type { CostRanges, ModelParams, Range } from './types'

export const toRange = (x: Assumption): Range => ({ low: x.low, mid: x.value, high: x.high })

export function defaultModelParams(): ModelParams {
  return {
    biomassGrowth: toRange(A.biomassGrowth),
    carbonFraction: A.carbonFraction.value,
    gwpCh4: A.gwpCh4.value,
    manureEfficiency: toRange(A.manureEfficiency),
    manureEf: {
      dairyCattle: A.efDairyCattle.value,
      indigenousCattle: A.efIndigenousCattle.value,
      buffalo: A.efBuffalo.value,
      goats: A.efGoat.value,
      sheep: A.efSheep.value,
    },
    socGain: toRange(A.socGain),
    agroCommonShare: A.agroCommonShare.value,
    croplandAdoption: A.croplandAdoption.value,
    pastureShare: A.pastureShare.value,
    pastureFactor: A.pastureFactor.value,
  }
}

export function defaultCosts(): CostRanges {
  return {
    validation: toRange(A.validationCost),
    verificationPerCycle: toRange(A.verificationCost),
    verificationCycleYears: A.verificationCycleYears.value,
    monitoringPerYear: toRange(A.monitoringCost),
    registration: toRange(A.registrationCost),
  }
}
