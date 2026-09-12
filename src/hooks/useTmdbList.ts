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

  useEffect(() => {
    let active = true;
    setLoading(true);
    tmdb
      .get(path)
      .then((res) => {
        if (active) setData(res.data.results ?? []);
      })
      .catch((error) => {
        console.log(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading };
}
