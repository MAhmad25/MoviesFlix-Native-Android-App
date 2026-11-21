import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

/**
 * Fetches a single TMDB "results" list — used for the Home screen sections
 * (Header trending strip, Upcoming Movies, Top Rated, Animated, etc.).
 * Ported from HomeSections.jsx / TrendingContainer.jsx.
 */
export function useTmdbList(path: string) {
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData([]);
    tmdb.get(path, { signal: controller.signal })
      .then((res) => {
        if (active) setData(res.data.results ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [path, requestVersion]);

  const retry = () => setRequestVersion((version) => version + 1);

  return { data, loading, error, retry };
}
