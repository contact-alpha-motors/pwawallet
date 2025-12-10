
'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { defaultDomains } from '@/lib/types';

interface DomainsContextType {
  domains: string[];
  addDomain: (domain: string) => void;
  deleteDomain: (domain: string) => void;
}

const DomainsContext = createContext<DomainsContextType | undefined>(undefined);

export function DomainsProvider({ children }: { children: ReactNode }) {
  const [customDomains, setCustomDomains] = useState<string[]>([]);

  const addDomain = useCallback(
    (domain: string) => {
      if (
        domain &&
        !defaultDomains.includes(domain) &&
        !customDomains.includes(domain)
      ) {
        setCustomDomains((prev) => [...prev, domain]);
      }
    },
    [customDomains, setCustomDomains]
  );

  const deleteDomain = useCallback(
    (domain: string) => {
      setCustomDomains((prev) =>
        prev.filter((d) => d.toLowerCase() !== domain.toLowerCase())
      );
    },
    [setCustomDomains]
  );

  const domains = useMemo(() => {
    const allDomains = [...defaultDomains, ...customDomains].sort((a, b) =>
      a.localeCompare(b)
    );
    return Array.from(new Set(allDomains));
  }, [customDomains]);

  const value = useMemo(
    () => ({
      domains,
      addDomain,
      deleteDomain,
    }),
    [domains, addDomain, deleteDomain]
  );

  return (
    <DomainsContext.Provider value={value}>{children}</DomainsContext.Provider>
  );
}

export function useDomains() {
  const context = useContext(DomainsContext);
  if (!context) {
    throw new Error('useDomains must be used within a DomainsProvider');
  }
  return context;
}
