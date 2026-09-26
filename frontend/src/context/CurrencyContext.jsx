import { useEffect, useMemo, useState } from 'react';
import { CurrencyContext } from './currencyContextInstance';

// Approximate, fixed — this project has no live FX feed wired up. Update
// this constant if the real rate drifts noticeably.
const USD_TO_RWF = 1430;

const STORAGE_KEY = 'currency';

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'RWF' ? 'RWF' : 'USD';
    } catch {
      return 'USD';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // private browsing / storage disabled — currency just won't persist
    }
  }, [currency]);

  const value = useMemo(() => {
    const formatPrice = (amountUsd, suffix = '') => {
      if (amountUsd == null) return '—';
      if (currency === 'RWF') {
        return `RWF ${Math.round(amountUsd * USD_TO_RWF).toLocaleString()}${suffix}`;
      }
      return `$${amountUsd.toLocaleString()}${suffix}`;
    };

    return { currency, setCurrency, formatPrice };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
