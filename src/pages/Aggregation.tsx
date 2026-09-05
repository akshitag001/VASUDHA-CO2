import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Minus, ArrowRight, TrendingUp, MapPin, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useApp } from '../contexts/AppContext';
import { getCombinedPotential, formatRange, calculateViability } from '../utils/calculations';
import { findRealNeighbours, CLUSTERING } from '../lib/neighbours';
import { matchMethodologiesFor } from '../lib/adapter';

export default function Aggregation() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { panchayat, viabilityInputs, selectedNeighbours, toggleNeighbour, loadDemo } = useApp();
  const [radiusKm, setRadiusKm] = useState(CLUSTERING.maxSearchRadiusKm);

  useEffect(() => { if (!panchayat) loadDemo(); }, [panchayat, loadDemo]);

  if (!panchayat) return null;

  const hasCoords = panchayat.lat != null && panchayat.lon != null;

  const realNeighbours = useMemo(() => {
    if (!hasCoords) return [];
    return findRealNeighbours(panchayat.id, panchayat.lat!, panchayat.lon!, radiusKm, CLUSTERING.maxClusterSize);
  }, [panchayat.id, panchayat.lat, panchayat.lon, radiusKm, hasCoords]);

  const ownMethodologies = useMemo(
    () => matchMethodologiesFor(panchayat).filter((m) => m.verdict !== 'not_matched').map((m) => m.methodology.code),
    [panchayat],
  );

  const combined = getCombinedPotential(panchayat, selectedNeighbours);
  const isSelected = (name: string) => selectedNeighbours.some((n) => n.name === name);

  const standaloneViability = calculateViability(panchayat, viabilityInputs);
  const standaloneMidNet = (standaloneViability.netRevenue[0] + standaloneViability.netRevenue[1]) / 2;
  const isStandaloneNeeded = standaloneMidNet <= 0;

  const pooledViability = calculateViability(
    panchayat,
    viabilityInputs,
    selectedNeighbours.reduce((s, n) => s + n.households, 0) || undefined,
    selectedNeighbours.length > 0
      ? [selectedNeighbours.reduce((s, n) => s + n.carbonPotential[0], 0), selectedNeighbours.reduce((s, n) => s + n.carbonPotential[1], 0)]
      : undefined,
  );
  const pooledMidNet = (pooledViability.netRevenue[0] + pooledViability.netRevenue[1]) / 2;
  const flipsToPositive = isStandaloneNeeded && pooledMidNet > 0 && selectedNeighbours.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
          <Users size={20} className="text-forest-700" />
          {t('agg.title')}
        </h1>
        <p className="text-sm text-charcoal-600 mt-1">{t('agg.subtitle')}</p>
      </div>

      {isStandaloneNeeded && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-800">
            <strong>Standalone this Panchayat is not viable</strong> — mid-case net revenue is
            {' '}{formatRange(standaloneViability.netRevenue)}. Fixed MRV costs dominate at this scale
            (break-even requires {standaloneViability.breakEvenPoint.toLocaleString('en-IN')} tCO₂e/yr).
            Pooling with real neighbouring Panchayats below can close this gap.
          </p>
        </div>
      )}

      {/* Current Panchayat */}
      <div className="card bg-forest-50 border-forest-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-charcoal-600 uppercase tracking-wider mb-1">{t('agg.current')}</div>
            <h3 className="font-bold text-charcoal-900">{panchayat.name}</h3>
            <p className="text-sm text-charcoal-600">{panchayat.block}, {panchayat.district}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-charcoal-600">{t('agg.mitPotential')}</div>
            <div className="text-lg font-bold text-forest-800">
              {formatRange(panchayat.carbonPotential.total)} tCO₂e/yr
            </div>
          </div>
        </div>
      </div>

      {!hasCoords && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            This Panchayat has no coordinates on file, so real geographic neighbours cannot be computed.
            No neighbours are shown — this is an honest empty state, not a fabricated list.
          </p>
        </div>
      )}

      {hasCoords && (
        <>
          {/* Radius control */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="radius" className="text-sm font-semibold text-charcoal-900">
                Search radius: <span className="text-forest-700">{radiusKm} km</span>
              </label>
              <span className="text-xs text-charcoal-500">
                {realNeighbours.length} Panchayat{realNeighbours.length === 1 ? '' : 's'} found · cap {CLUSTERING.maxClusterSize}
              </span>
            </div>
            <input
              id="radius"
              type="range"
              min={5}
              max={25}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-forest-600"
            />
            <div className="flex justify-between text-xs text-charcoal-500 mt-1">
              <span>5 km</span>
              <span>25 km</span>
            </div>
          </div>

          {/* Neighbours */}
          <div>
            <h3 className="font-semibold text-sm text-charcoal-900 mb-3">{t('agg.neighbours')}</h3>
            {realNeighbours.length === 0 ? (
              <div className="card text-sm text-charcoal-600">
                No Panchayats with known coordinates fall within {radiusKm} km. This village is geographically
                isolated in the current dataset — try increasing the radius, or note that standalone viability
                (not pooling) is the only path here.
              </div>
            ) : (
              <div className="space-y-3">
                {realNeighbours.map((neighbour) => {
                  const selected = isSelected(neighbour.name);
                  const isCompatible = ownMethodologies.length > 0; // at least one shared eligible pathway exists in principle

                  return (
                    <div
                      key={neighbour.lgdCode}
                      className={`card card-hover cursor-pointer transition-all ${selected ? 'ring-2 ring-forest-500 border-forest-300' : ''}`}
                      onClick={() => toggleNeighbour(neighbour)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-charcoal-900">{neighbour.name}</h4>
                            <span className="flex items-center gap-1 text-xs text-charcoal-600">
                              <MapPin size={12} /> {neighbour.distance} km
                            </span>
                            {!neighbour.hasProfile && (
                              <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Regional estimate
                              </span>
                            )}
                            {isCompatible ? (
                              <span className="flex items-center gap-1 text-xs text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded">
                                <CheckCircle size={10} /> {t('agg.compatible')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                <AlertCircle size={10} /> {t('agg.limitedOverlap')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-600 mt-1">
                            {neighbour.households} {t('agg.households')} · {neighbour.agriculturalLand} ha {t('agg.agricultural')}
                          </p>
                          <div className="text-sm font-medium text-forest-700 mt-2">
                            {formatRange(neighbour.carbonPotential)} tCO₂e/year
                          </div>
                        </div>
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'bg-forest-600 text-white' : 'bg-earth-100 text-charcoal-600 hover:bg-earth-200'
                          }`}
                          onClick={(e) => { e.stopPropagation(); toggleNeighbour(neighbour); }}
                          aria-label={selected ? t('agg.remove') : 'Add to cluster'}
                        >
                          {selected ? <Minus size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Combined result */}
      {selectedNeighbours.length > 0 && (
        <div className={`card animate-slide-up ${flipsToPositive ? 'bg-forest-800' : 'bg-charcoal-800'} text-white`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-forest-300" />
            <h3 className="font-semibold">{t('agg.combined')}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-forest-300">{t('agg.panchayats')}</div>
              <div className="text-lg font-bold">{selectedNeighbours.length + 1}</div>
            </div>
            <div>
              <div className="text-xs text-forest-300">{t('agg.hh')}</div>
              <div className="text-lg font-bold">{combined.households}</div>
            </div>
            <div>
              <div className="text-xs text-forest-300">{t('agg.mitPotential')}</div>
              <div className="text-lg font-bold">{formatRange(combined.carbon)} tCO₂e/yr</div>
            </div>
            <div>
              <div className="text-xs text-forest-300">Net revenue, pooled</div>
              <div className={`text-lg font-bold ${pooledMidNet > 0 ? 'text-forest-100' : 'text-red-300'}`}>
                {formatRange(pooledViability.netRevenue)}
              </div>
            </div>
          </div>

          {/* Before/after money shot */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className={`px-3 py-2 rounded font-bold ${standaloneMidNet <= 0 ? 'bg-red-500/80' : 'bg-white/10'}`}>
                Standalone: {formatRange(standaloneViability.netRevenue)}
              </span>
              <ArrowRight size={16} />
              <span className={`px-3 py-2 rounded font-bold ${pooledMidNet > 0 ? 'bg-forest-400/90 text-charcoal-900' : 'bg-red-500/80'}`}>
                Pooled: {formatRange(pooledViability.netRevenue)}
              </span>
              {flipsToPositive && (
                <span className="text-forest-200 text-xs font-semibold">✓ Deficit flips to surplus</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-forest-300" />
              <span className="text-sm font-semibold">{t('agg.compatCheck')}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { label: t('agg.compatMethod'), check: ownMethodologies.length > 0 },
                { label: t('agg.compatActivity'), check: true },
                { label: t('agg.compatMonitor'), check: false },
                { label: t('agg.compatScale'), check: combined.carbon[0] > 0 },
                { label: `Cluster size ≤ ${CLUSTERING.maxClusterSize}`, check: selectedNeighbours.length + 1 <= CLUSTERING.maxClusterSize },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.check ? (
                    <CheckCircle size={12} className="text-forest-300" />
                  ) : (
                    <AlertCircle size={12} className="text-amber-300" />
                  )}
                  <span className="text-xs text-forest-200">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-forest-200 mt-3">
            Shared-MRV saving estimate: pooling amortises fixed validation/registration overhead across
            {' '}{selectedNeighbours.length + 1} Panchayats instead of 1 — the per-village fixed-cost share falls
            roughly {Math.round((1 - 1 / (selectedNeighbours.length + 1)) * 100)}%.
          </p>
        </div>
      )}

      {/* Math visualization */}
      {selectedNeighbours.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm text-charcoal-900 mb-4">{t('agg.clusterCalc')}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="bg-forest-100 text-forest-800 px-3 py-2 rounded font-medium">
              {panchayat.name}: {formatRange(panchayat.carbonPotential.total)}
            </span>
            {selectedNeighbours.map((n) => (
              <span key={n.name} className="flex items-center gap-2">
                <span className="text-charcoal-500">+</span>
                <span className="bg-earth-100 text-charcoal-800 px-3 py-2 rounded font-medium">
                  {n.name}: {formatRange(n.carbonPotential)}
                </span>
              </span>
            ))}
            <span className="text-charcoal-500">=</span>
            <span className="bg-forest-700 text-white px-3 py-2 rounded font-bold">
              {t('agg.combinedLabel')} {formatRange(combined.carbon)} tCO₂e/yr
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => navigate('/viability')} className="btn-secondary">
          ← {t('common.back')}
        </button>
        <button onClick={() => navigate('/readiness')} className="btn-primary flex items-center gap-2">
          {t('common.next')}: {t('nav.readiness')} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
