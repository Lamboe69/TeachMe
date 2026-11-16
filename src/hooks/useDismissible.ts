import { useCallback, useState } from 'react';

/**
 * Remembers, per browser, that a dismissible panel was closed.
 *
 * Used for first-run helpers so a returning learner is not nagged, while a
 * brand-new one still gets the guidance the first time.
 */
export function useDismissible(key: string) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(key, '1');
    } catch {
      /* Storage unavailable — the panel simply stays for this session. */
    }
    setDismissed(true);
  }, [key]);

  return { dismissed, dismiss };
}
