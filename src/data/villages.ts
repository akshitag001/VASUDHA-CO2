// Real village registry, replacing the fabricated `locations.ts`.
// Backed by src/data/engine/lgd.ts (real LGD-style hierarchy, pilot districts
// Mandla MP + Dahod GJ in full detail, other states at district level for search).
//
// Villages with a `profileId` (see engine/panchayatProfiles.ts) are MEASURED —
// sourced open-data snapshots. Everything else resolves to a REGIONAL ESTIMATE
// (see lib/resolveVillage.ts `fromRegionalDefault`) and must show the
// "Regional estimate — not measured" banner (Guardrail 5).

import { states as lgdStates, searchVillages as lgdSearch, findGP, type StateEntry } from './engine/lgd';

export const villageStates: StateEntry[] = lgdStates;

// Nested State -> District -> Block -> [panchayat names] view, for the existing
// dropdown UI in PanchayatSelection. Each panchayat name maps back to an LGD code.
export const allStates: Record<string, Record<string, Record<string, string[]>>> = (() => {
  const out: Record<string, Record<string, Record<string, string[]>>> = {};
  for (const state of lgdStates) {
    out[state.name] = {};
    for (const district of state.districts) {
      out[state.name][district.name] = {};
      for (const block of district.blocks) {
        out[state.name][district.name][block.name] = block.gramPanchayats.map((gp) => gp.name);
      }
    }
  }
  return out;
})();

// Look up the LGD code for a (state, district, block, panchayat-name) tuple picked via dropdowns.
export function lgdCodeForSelection(state: string, district: string, block: string, panchayatName: string): string | null {
  const s = lgdStates.find((x) => x.name === state);
  const d = s?.districts.find((x) => x.name === district);
  const b = d?.blocks.find((x) => x.name === block);
  const gp = b?.gramPanchayats.find((x) => x.name === panchayatName);
  return gp?.lgdCode ?? null;
}

export const searchVillages = lgdSearch;
export { findGP };

// Flagship demo village — a real, fully-sourced pilot panchayat.
export const FLAGSHIP_LGD_CODE = '143892'; // Jamgaon, Mandla, Madhya Pradesh
