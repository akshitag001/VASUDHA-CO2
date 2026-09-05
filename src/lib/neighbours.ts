// Real geographic clustering — replaces the fabricated "Rampura / Khadki / Sonesar"
// neighbour list that appeared identically for every village regardless of
// which Panchayat was actually selected.
//
// Distances are haversine great-circle distances between real LGD lat/lon
// coordinates (src/data/engine/lgd.ts). Carbon/household figures for each
// neighbour come from the same estimateBaseline() engine used for the
// selected village — never fabricated.

import { states as lgdStates, type GP } from '../data/engine/lgd';
import { resolveVillage } from './resolveVillage';
import { estimateBaseline } from './calc';
import { CLUSTERING } from './config';
import type { NeighbouringPanchayat } from '../types';

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

interface FlatGP extends GP {
  district: string;
  state: string;
}

let cachedFlatList: FlatGP[] | null = null;

function allGramPanchayats(): FlatGP[] {
  if (cachedFlatList) return cachedFlatList;
  const out: FlatGP[] = [];
  for (const state of lgdStates) {
    for (const district of state.districts) {
      for (const block of district.blocks) {
        for (const gp of block.gramPanchayats) {
          if (gp.lat != null && gp.lon != null) {
            out.push({ ...gp, district: district.name, state: state.name });
          }
        }
      }
    }
  }
  cachedFlatList = out;
  return out;
}

export interface RealNeighbour extends NeighbouringPanchayat {
  lgdCode: string;
  lat: number;
  lon: number;
  hasProfile: boolean;
}

// Find real neighbouring GPs within `radiusKm` of (lat, lon), nearest first,
// excluding the village itself (matched by LGD code).
export function findRealNeighbours(
  lgdCode: string,
  lat: number,
  lon: number,
  radiusKm: number = CLUSTERING.maxSearchRadiusKm,
  limit: number = CLUSTERING.maxClusterSize,
): RealNeighbour[] {
  const candidates = allGramPanchayats().filter((gp) => gp.lgdCode !== lgdCode && gp.lat != null && gp.lon != null);

  const withDistance = candidates
    .map((gp) => ({ gp, distanceKm: haversineKm(lat, lon, gp.lat!, gp.lon!) }))
    .filter((c) => c.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return withDistance.map(({ gp, distanceKm }) => {
    const village = resolveVillage(gp.lgdCode);
    const baseline = village ? estimateBaseline(village) : null;
    const carbonLow = baseline ? Math.round(baseline.total.low * 10) / 10 : 0;
    const carbonHigh = baseline ? Math.round(baseline.total.high * 10) / 10 : 0;
    return {
      lgdCode: gp.lgdCode,
      name: `${gp.name} (${gp.district})`,
      distance: Math.round(distanceKm * 10) / 10,
      carbonPotential: [carbonLow, carbonHigh],
      methodologyOverlap: [], // real overlap is computed from matched methodologies at the page level
      households: village?.households ?? 0,
      agriculturalLand: village ? Math.round(village.landUseHa.agricultural) : 0,
      lat: gp.lat!,
      lon: gp.lon!,
      hasProfile: Boolean(gp.profileId),
    };
  });
}

export { CLUSTERING };
