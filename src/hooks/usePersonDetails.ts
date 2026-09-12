import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import type { PersonDetailBundle } from "@/lib/types";

/** Ports src/store/actions/peopleAction.jsx's asyncPeopleLoader, without Redux. */
export function usePersonDetails(id: string | undefined) {
  const [data, setData] = useState<PersonDetailBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setData(null);
    setError(null);

    (async () => {
      try {
        const [details, castedMovies] = await Promise.all([tmdb.get(`/person/${id}`), tmdb.get(`/person/${id}/credits`)]);
        if (!active) return;
        setData({ detail: details.data, credits: castedMovies.data });
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
