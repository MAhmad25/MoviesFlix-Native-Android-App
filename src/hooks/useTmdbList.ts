import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "expo-router";
import { tmdb } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

/** Fetches a single TMDB results list used by Home screen sections. */
export function useTmdbList(path: string) {
  const isFocused = useIsFocused();
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const dataPathRef = useRef(path);
  const loadedPathRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isFocused) return;

    if (dataPathRef.current !== path) {
      dataPathRef.current = path;
      loadedPathRef.current = null;
      setData([]);
    }

    // Keep successful results in memory; refetch only when a load was
    // interrupted or failed while this route was away.
    if (loadedPathRef.current === path) {
      setLoading(false);
      setError(false);
      return;
    }

    const generation = ++generationRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError(false);

    tmdb.get(path, { signal: controller.signal })
      .then((res) => {
        if (generation !== generationRef.current) return;
        const results = Array.isArray(res.data.results) ? res.data.results : [];
        loadedPathRef.current = path;
        setData(results);
      })
      .catch(() => {
        if (generation === generationRef.current && !controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (generation === generationRef.current) {
          if (requestRef.current === controller) requestRef.current = null;
          setLoading(false);
        }
      });

    return () => {
      generationRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      setLoading(false);
    };
  }, [isFocused, path]);

  return { data, loading, error };
}
