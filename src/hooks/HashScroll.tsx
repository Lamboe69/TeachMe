import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the element referenced by the URL hash (e.g. `/#how-it-works`). */
export function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pathname, hash]);

  return null;
}
