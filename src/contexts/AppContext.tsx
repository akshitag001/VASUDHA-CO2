import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PanchayatData, ViabilityInputs, NeighbouringPanchayat } from '../types';
import { demoPanchayat, defaultViabilityInputs } from '../data/demo';
import { loadVillage } from '../lib/adapter';
import { FLAGSHIP_LGD_CODE } from '../data/villages';

const STORAGE_KEY = 'vasudha_co2_state_v1';

interface PersistedState {
  panchayat: PanchayatData | null;
  viabilityInputs: ViabilityInputs;
  selectedNeighbours: NeighbouringPanchayat[];
  lang?: 'en' | 'hi' | 'gu';
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode / quota) — silently degrade, never crash the demo
  }
}

interface AppState {
  panchayat: PanchayatData | null;
  viabilityInputs: ViabilityInputs;
  selectedNeighbours: NeighbouringPanchayat[];
  sidebarOpen: boolean;
  contractAnswers: Map<string, boolean>;
  setPanchayat: (p: PanchayatData) => void;
  setPanchayatByLgd: (lgdCode: string) => boolean;
  setViabilityInputs: (v: ViabilityInputs) => void;
  setSelectedNeighbours: (n: NeighbouringPanchayat[]) => void;
  toggleNeighbour: (n: NeighbouringPanchayat) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleContractAnswer: (id: string) => void;
  loadDemo: () => void;
  clearVillage: () => void;
}

const AppContext = createContext<AppState>({
  panchayat: null,
  viabilityInputs: defaultViabilityInputs,
  selectedNeighbours: [],
  sidebarOpen: true,
  contractAnswers: new Map(),
  setPanchayat: () => {},
  setPanchayatByLgd: () => false,
  setViabilityInputs: () => {},
  setSelectedNeighbours: () => {},
  toggleNeighbour: () => {},
  setSidebarOpen: () => {},
  toggleContractAnswer: () => {},
  loadDemo: () => {},
  clearVillage: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted();
  const [panchayat, setPanchayat] = useState<PanchayatData | null>(persisted?.panchayat ?? null);
  const [viabilityInputs, setViabilityInputs] = useState<ViabilityInputs>(persisted?.viabilityInputs ?? defaultViabilityInputs);
  const [selectedNeighbours, setSelectedNeighbours] = useState<NeighbouringPanchayat[]>(persisted?.selectedNeighbours ?? []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contractAnswers, setContractAnswers] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    savePersisted({ panchayat, viabilityInputs, selectedNeighbours });
  }, [panchayat, viabilityInputs, selectedNeighbours]);

  const toggleNeighbour = useCallback((n: NeighbouringPanchayat) => {
    setSelectedNeighbours(prev => {
      const exists = prev.find(p => p.name === n.name);
      if (exists) return prev.filter(p => p.name !== n.name);
      return [...prev, n];
    });
  }, []);

  const toggleContractAnswer = useCallback((id: string) => {
    setContractAnswers(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, true);
      return next;
    });
  }, []);

  const setPanchayatByLgd = useCallback((lgdCode: string): boolean => {
    const ctx = loadVillage(lgdCode);
    if (!ctx) return false;
    setPanchayat(ctx.panchayat);
    setSelectedNeighbours([]);
    setContractAnswers(new Map());
    return true;
  }, []);

  const loadDemo = useCallback(() => {
    const ctx = loadVillage(FLAGSHIP_LGD_CODE);
    setPanchayat(ctx?.panchayat ?? demoPanchayat);
    setViabilityInputs(defaultViabilityInputs);
    setSelectedNeighbours([]);
    setContractAnswers(new Map());
  }, []);

  const clearVillage = useCallback(() => {
    setPanchayat(null);
    setSelectedNeighbours([]);
    setContractAnswers(new Map());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AppContext.Provider value={{
      panchayat,
      viabilityInputs,
      selectedNeighbours,
      sidebarOpen,
      contractAnswers,
      setPanchayat,
      setPanchayatByLgd,
      setViabilityInputs,
      setSelectedNeighbours,
      toggleNeighbour,
      setSidebarOpen,
      toggleContractAnswer,
      loadDemo,
      clearVillage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
