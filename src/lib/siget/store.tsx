import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { createSeedData } from "./seed";
import type { RoleId, SigetData } from "./types";

const DATA_KEY = "siget.data.v1";
const ROLE_KEY = "siget.role.v1";

interface StoreValue {
  hydrated: boolean;
  data: SigetData;
  role: RoleId | null;
  lastSaved: Date | null;
  setData: (updater: (d: SigetData) => SigetData) => void;
  setRole: (role: RoleId | null) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function SigetProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setDataState] = useState<SigetData>(() => createSeedData());
  const [role, setRoleState] = useState<RoleId | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) setDataState(JSON.parse(raw) as SigetData);
      const r = localStorage.getItem(ROLE_KEY) as RoleId | null;
      if (r) setRoleState(r);
    } catch {
      // datos corruptos: se usan los de demostración
    }
    setLastSaved(new Date());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    setLastSaved(new Date());
  }, [data, hydrated]);

  const setData = useCallback((updater: (d: SigetData) => SigetData) => {
    setDataState((d) => updater(d));
  }, []);

  const setRole = useCallback((r: RoleId | null) => {
    setRoleState(r);
    if (r) localStorage.setItem(ROLE_KEY, r);
    else localStorage.removeItem(ROLE_KEY);
  }, []);

  const resetDemo = useCallback(() => {
    setDataState(createSeedData());
  }, []);

  const value = useMemo(
    () => ({ hydrated, data, role, lastSaved, setData, setRole, resetDemo }),
    [hydrated, data, role, lastSaved, setData, setRole, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSiget(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSiget debe usarse dentro de SigetProvider");
  return ctx;
}
