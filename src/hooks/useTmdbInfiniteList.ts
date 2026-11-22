import { useCallback, useEffect, useRef, useState } from "react";
import { useIsFocused } from "expo-router";
import { tmdb } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

/**
 * Paginated TMDB list with "load more" support.
 *
 * Requests are paused when their route loses focus. If a request was cancelled
 * or failed before the first page arrived, focusing the route starts it again.
 */
export function useTmdbInfiniteList(pathForPage: (page: number) => string, resetKey?: string) {
  const isFocused = useIsFocused();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const itemsRef = useRef<MediaItem[]>([]);
  const pathForPageRef = useRef(pathForPage);
  const isFocusedRef = useRef(isFocused);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const errorRef = useRef(false);
  const hasMoreRef = useRef(true);
  const generationRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);
  const resetKeyRef = useRef(resetKey);
  const interruptedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  pathForPageRef.current = pathForPage;
  isFocusedRef.current = isFocused;

  const loadMore = useCallback(async () => {
    if (!isFocusedRef.current || loadingRef.current || errorRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const generation = generationRef.current;
    const requestedPage = pageRef.current;
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const { data } = await tmdb.get(pathForPageRef.current(requestedPage), { signal: controller.signal });
      if (generation !== generationRef.current) return;

      const results = Array.isArray(data.results) ? data.results : [];
      const nextItems = [...itemsRef.current, ...results];
      itemsRef.current = nextItems;
      hasLoadedRef.current = true;
      setItems(nextItems);
      pageRef.current = requestedPage + 1;

      const totalPages = typeof data.total_pages === "number" ? data.total_pages : null;
      const canLoadMore = results.length > 0 && (totalPages === null || requestedPage < totalPages);
      hasMoreRef.current = canLoadMore;
      setHasMore(canLoadMore);
      errorRef.current = false;
      setError(false);
    } catch {
      if (generation === generationRef.current && !controller.signal.aborted) {
        errorRef.current = true;
        hasMoreRef.current = false;
        setError(true);
        setHasMore(false);
      }
    } finally {
      if (generation === generationRef.current) {
        if (requestRef.current === controller) requestRef.current = null;
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    const categoryChanged = !initializedRef.current || resetKeyRef.current !== resetKey;
    if (categoryChanged) {
      initializedRef.current = true;
      resetKeyRef.current = resetKey;
      generationRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      itemsRef.current = [];
      hasLoadedRef.current = false;
      pageRef.current = 1;
      loadingRef.current = false;
      errorRef.current = false;
      hasMoreRef.current = true;
      interruptedRef.current = false;
      setItems([]);
      setLoading(false);
      setInitialLoading(true);
      setError(false);
      setHasMore(true);
    }

    // Re-entering a route recovers interrupted/failed requests automatically.
    if (categoryChanged || !hasLoadedRef.current || errorRef.current || interruptedRef.current) {
      interruptedRef.current = false;
      errorRef.current = false;
      hasMoreRef.current = true;
      setError(false);
      setHasMore(true);
      if (!hasLoadedRef.current) setInitialLoading(true);
      void loadMore();
    }

    return () => {
      if (loadingRef.current) interruptedRef.current = true;
      generationRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      loadingRef.current = false;
      setLoading(false);
    };
  }, [isFocused, resetKey, loadMore]);

  return { items, loading, initialLoading, loadMore, error, hasMore };
}
