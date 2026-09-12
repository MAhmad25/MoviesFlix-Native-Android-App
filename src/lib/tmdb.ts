import axios from "axios";

/**
 * Ported from the web app's src/utils/axios.js.
 * Expo only exposes env vars prefixed with EXPO_PUBLIC_ to app code,
 * so set EXPO_PUBLIC_TMDB_BASE_URL / EXPO_PUBLIC_TMDB_KEY in your .env
 * (see .env.example).
 */
export const tmdb = axios.create({
  baseURL: process.env.EXPO_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_KEY ?? ""}`,
  },
});

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type ImageSize = "w92" | "w200" | "w300" | "w500" | "w780" | "original";

/** Builds a TMDB image URL, or null when no path is available. */
export function tmdbImage(path?: string | null, size: ImageSize = "w500"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** Title fallback chain used across the web app's cards. */
export function mediaTitle(item: any): string {
  return item?.title || item?.original_title || item?.name || item?.original_name || "Untitled";
}

/** Media type fallback — trending/search results carry media_type, category endpoints don't. */
export function mediaType(item: any, fallback: "movie" | "tv" | "person" = "movie"): "movie" | "tv" | "person" {
  return item?.media_type || fallback;
}
