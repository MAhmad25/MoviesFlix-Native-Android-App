import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import type { TvDetailBundle } from "@/lib/types";

/** Ports src/store/actions/tvAction.jsx's asyncTvLoader, without Redux. */
export function useTvDetails(id: string | undefined) {
  const [data, setData] = useState<TvDetailBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setData(null);
    setError(null);

    (async () => {
      try {
        const [details, castBy, recommendedTv, videoLink, reviews] = await Promise.all([
          tmdb.get(`/tv/${id}`),
          tmdb.get(`/tv/${id}/credits`),
          tmdb.get(`/tv/${id}/recommendations`),
          tmdb.get(`/tv/${id}/videos`),
          tmdb.get(`/tv/${id}/reviews`),
        ]);
        if (!active) return;
        setData({
          detail: details.data,
          cast: castBy.data,
          recommended: recommendedTv.data.results,
          trailer: videoLink.data.results?.find((link: any) => link.type === "Trailer" && link.site === "YouTube"),
          reviews: reviews.data.results,
        });
      } catch (err: any) {
        if (active) setError(err.message);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return { data, error, loading: !data && !error };
}
