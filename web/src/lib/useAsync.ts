import { useEffect, useState } from "react";

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): {
  data: T | null;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void fn().then((value) => {
      if (!alive) return;
      setData(value);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
