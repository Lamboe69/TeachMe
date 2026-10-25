import { useCallback, useEffect, useRef, useState } from 'react';
import { toAppError } from '@/utils/apiError';
import type { AppError } from '@/utils/apiError';

interface AsyncState<T> {
  data: T | null;
  error: AppError | null;
  loading: boolean;
}

/**
 * Runs an async loader whenever `deps` change and exposes loading / error /
 * empty states plus a `reload` helper.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    loaderRef
      .current()
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ data: null, error: toAppError(error), loading: false });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  const setData = useCallback((updater: T | ((current: T | null) => T)) => {
    setState((current) => ({
      ...current,
      data:
        typeof updater === 'function'
          ? (updater as (value: T | null) => T)(current.data)
          : updater,
    }));
  }, []);

  return { ...state, reload, setData };
}
