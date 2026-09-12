import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import type { MovieDetailBundle } from "@/lib/types";

/** Ports src/store/actions/movieAction.jsx's asyncMovieLoader, without Redux. */
export function useMovieDetails(id: string | undefined) {
  const [data, setData] = useState<MovieDetailBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setData(null);
    setError(null);

    (async () => {
      try {
        const [details, castBy, recommendedMovies, videoLink, reviews] = await Promise.all([
          tmdb.get(`/movie/${id}`),
          tmdb.get(`/movie/${id}/credits`),
          tmdb.get(`/movie/${id}/recommendations`),
          tmdb.get(`/movie/${id}/videos`),
          tmdb.get(`/movie/${id}/reviews`),
        ]);
        if (!active) return;
        setData({
          detail: details.data,
          cast: castBy.data,
          recommended: recommendedMovies.data.results,
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
