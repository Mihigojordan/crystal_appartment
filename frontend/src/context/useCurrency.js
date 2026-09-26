import { useContext } from 'react';
import { CurrencyContext } from './currencyContextInstance';

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
