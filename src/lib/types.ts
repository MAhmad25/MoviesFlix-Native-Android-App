// Lightweight TMDB types — intentionally permissive rather than exhaustive,
// matching the "keep it simple" approach used across the rest of the app.

export interface MediaItem {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  [key: string]: any;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  cast_id?: number;
  name: string;
  original_name?: string;
  character?: string;
  job?: string;
  profile_path?: string | null;
}

export interface ReviewItem {
  id: string;
  author?: string;
  content: string;
  updated_at: string;
  author_details: { name?: string; rating?: number | null };
}

export interface VideoItem {
  key: string;
  type: string;
  site: string;
}

export interface SeasonItem {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
}

export interface EpisodeItem {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
  runtime?: number | null;
  vote_average?: number;
}

export interface MovieDetailBundle {
  detail: MediaItem & {
    genres: Genre[];
    runtime: number;
    tagline?: string;
    status?: string;
  };
  cast: { cast: CastMember[]; crew: CastMember[] };
  recommended: MediaItem[];
  trailer?: VideoItem;
  reviews: ReviewItem[];
}

export interface TvDetailBundle {
  detail: MediaItem & {
    genres: Genre[];
    tagline?: string;
    status?: string;
    seasons: SeasonItem[];
    number_of_seasons?: number;
  };
  cast: { cast: CastMember[]; crew: CastMember[] };
  recommended: MediaItem[];
  trailer?: VideoItem;
  reviews: ReviewItem[];
}

export interface PersonDetailBundle {
  detail: {
    id: number;
    name: string;
    biography?: string;
    birthday?: string;
    place_of_birth?: string;
    known_for_department?: string;
    popularity?: number;
    profile_path?: string | null;
  };
  credits: { cast: MediaItem[] };
}
