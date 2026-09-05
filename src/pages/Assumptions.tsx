import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import {
  CARBON_PRICE_INR, AGGREGATOR_MARGIN, MRV_COSTS, CONTRACT, BIOMASS, LIVESTOCK, SOIL, UNCERTAINTY, CLUSTERING, DISCLAIMER,
} from '../lib/config';
import { METHODOLOGY_LIST_UPDATED } from '../data/engine/methodologies';
import Disclaimer from '../components/shared/Disclaimer';

// Judge-facing transparency panel (Rule 9): every constant the engine uses,
// rendered live from lib/config.ts — never hardcoded here. If config.ts
// changes, this page changes automatically, so it cannot drift out of sync.

function RangeRow({ label, r }: { label: string; r: { low: number; mid: number; high: number; unit: string; source: string } }) {
  return (
    <div className="p-3 rounded-md bg-earth-50 border border-sage-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-medium text-charcoal-900">{label}</span>
        <span className="text-sm font-bold text-forest-800">
          {r.low.toLocaleString('en-IN')} – {r.mid.toLocaleString('en-IN')} – {r.high.toLocaleString('en-IN')} <span className="text-xs font-normal text-charcoal-600">{r.unit}</span>
        </span>
      </div>
      <p className="text-xs text-charcoal-600 mt-1">{r.source}</p>
    </div>
  );
}

export default function Assumptions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-forest-700" />
          Assumptions &amp; Constants
        </h1>
        <p className="text-sm text-charcoal-600 mt-1">
          Every financial and scientific constant the engine uses, with its source. Nothing on this page
          is hardcoded elsewhere — it is rendered live from <code className="text-xs bg-earth-100 px-1 rounded">src/lib/config.ts</code>.
        </p>
      </div>

      <Disclaimer message={DISCLAIMER} />

      <div className="card">
        <h3 className="font-semibold text-sm text-charcoal-900 mb-3">Carbon price &amp; aggregator economics</h3>
        <div className="space-y-2">
          <RangeRow label="Carbon price" r={CARBON_PRICE_INR} />
          <RangeRow label="Aggregator margin" r={{ ...AGGREGATOR_MARGIN, low: AGGREGATOR_MARGIN.low * 100, mid: AGGREGATOR_MARGIN.mid * 100, high: AGGREGATOR_MARGIN.high * 100, unit: '% of gross' }} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-charcoal-900 mb-3">MRV &amp; registration costs (annualised in the engine)</h3>
        <div className="space-y-2">
          <RangeRow label="Validation (one-time, amortised)" r={MRV_COSTS.validation} />
          <RangeRow label="Verification (per audit cycle)" r={MRV_COSTS.verificationPerCycle} />
          <RangeRow label="Annual monitoring" r={MRV_COSTS.annualMonitoring} />
          <RangeRow label="Registration (one-time, amortised)" r={MRV_COSTS.registration} />
        </div>
        <p className="text-xs text-charcoal-500 mt-2">
          Contract duration used for amortisation: {CONTRACT.defaultDurationYears} years (range {CONTRACT.minDurationYears}–{CONTRACT.maxDurationYears}).
          Verification cycle: every {CONTRACT.verificationCycleYears} years.
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-charcoal-900 mb-3">Scientific constants (IPCC Tier 1)</h3>
        <div className="space-y-2">
          <RangeRow label="Biomass growth rate" r={BIOMASS.growthRate} />
          <div className="p-3 rounded-md bg-earth-50 border border-sage-200 text-xs text-charcoal-700">
            Carbon fraction of dry biomass: <strong>{BIOMASS.carbonFraction}</strong> · CO₂:C conversion: <strong>{BIOMASS.co2ToC.toFixed(3)}</strong> (44/12, molecular weight ratio)
          </div>
          <RangeRow label="Livestock manure-management mitigation efficiency" r={LIVESTOCK.mitigationEfficiency} />
          <div className="p-3 rounded-md bg-earth-50 border border-sage-200 text-xs text-charcoal-700">
            CH₄ global warming potential (GWP): <strong>{LIVESTOCK.gwpCh4}×</strong> CO₂e (IPCC AR5, 100-yr)
            <div className="mt-1">
              Manure CH₄ emission factors (kg/head/yr, IPCC 2006 Vol.4 Ch.10, Indian subcontinent warm climate):{' '}
              {Object.entries(LIVESTOCK.manureCh4).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' · ')}
            </div>
          </div>
          <RangeRow label="Annual soil organic carbon delta" r={SOIL.annualSocDelta} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-charcoal-900 mb-3">Uncertainty band &amp; clustering rules</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-charcoal-700">
          <div className="p-3 rounded-md bg-earth-50 border border-sage-200">
            Default uncertainty: ±{Math.round(UNCERTAINTY.defaultPct * 100)}% around the mid estimate
            (low = mid × {UNCERTAINTY.lowMult}, high = mid × {UNCERTAINTY.highMult})
          </div>
          <div className="p-3 rounded-md bg-earth-50 border border-sage-200">
            Aggregation: search radius up to {CLUSTERING.maxSearchRadiusKm} km, cluster capped at {CLUSTERING.maxClusterSize} panchayats,
            requires ≥{CLUSTERING.minOverlapMethodologies} shared eligible methodology
          </div>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-sm text-charcoal-900 mb-1">Methodology rule set</h3>
        <p className="text-xs text-charcoal-700">
          Last updated: <strong>{METHODOLOGY_LIST_UPDATED}</strong>. BEE methodology codes and status shown throughout this
          tool are illustrative and must be verified against beeindia.gov.in / carbonmarket.gov.in before any
          decision is made.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    </div>
  );
}
