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
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const generationRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const generation = generationRef.current;
    const requestedPage = pageRef.current;
    try {
      const { data } = await tmdb.get(pathForPage(requestedPage));
      if (generation !== generationRef.current) return;
      setItems((prev) => [...prev, ...(data.results ?? [])]);
      pageRef.current = requestedPage + 1;
    } catch (error: any) {
      if (generation === generationRef.current) console.log(error.message);
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [pathForPage]);

  useEffect(() => {
    generationRef.current += 1;
    pageRef.current = 1;
    loadingRef.current = false;
    setItems([]);
    setLoading(false);
    setInitialLoading(true);
    loadMore();
    // resetKey lets a screen (e.g. TV category dropdown) restart pagination
    return () => {
      generationRef.current += 1;
      loadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return { items, loading, initialLoading, loadMore };
}
