import { useCallback, useEffect, useRef, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

/**
 * Paginated TMDB list with "load more" support — powers MoviePage.jsx,
 * TVPage.jsx, and PeoplePage.jsx (react-infinite-scroll-component there,
 * FlatList onEndReached here).
 *
 * `pathForPage` receives the next page number and returns the endpoint
 * to call, e.g. (page) => `trending/movie/day?page=${page}`.
 */
export function useTmdbInfiniteList(pathForPage: (page: number) => string, resetKey?: string) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const errorRef = useRef(false);
  const hasMoreRef = useRef(true);
  const generationRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || errorRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const generation = generationRef.current;
    const requestedPage = pageRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const { data } = await tmdb.get(pathForPage(requestedPage), { signal: controller.signal });
      if (generation !== generationRef.current) return;
      const results = Array.isArray(data.results) ? data.results : [];
      setItems((prev) => [...prev, ...results]);
      pageRef.current = requestedPage + 1;
      const totalPages = typeof data.total_pages === "number" ? data.total_pages : null;
      const canLoadMore = results.length > 0 && (totalPages === null || requestedPage < totalPages);
      hasMoreRef.current = canLoadMore;
      setHasMore(canLoadMore);
      errorRef.current = false;
      setError(false);
    } catch {
      if (generation === generationRef.current) {
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
  }, [pathForPage]);

  const retry = useCallback(() => {
    if (loadingRef.current) return;
    errorRef.current = false;
    hasMoreRef.current = true;
    setError(false);
    setHasMore(true);
    void loadMore();
  }, [loadMore]);

  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    generationRef.current += 1;
    pageRef.current = 1;
    loadingRef.current = false;
    errorRef.current = false;
    hasMoreRef.current = true;
    setItems([]);
    setLoading(false);
    setInitialLoading(true);
    setError(false);
    setHasMore(true);
    loadMore();
    // resetKey lets a screen (e.g. TV category dropdown) restart pagination
    return () => {
      generationRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      loadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return { items, loading, initialLoading, loadMore, error, hasMore, retry };
}
