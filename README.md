# MoviesFlix Native

Expo Go app for browsing TMDB-backed media on mobile: Home, Search, Movie/TV/People details, seasons, reviews, cast, and official YouTube trailers.

## What's ported vs. what's not

This app includes the normal browsing experience from the web app, but it intentionally does not include actual video streaming.

The original web app's `Stream.jsx` embedded a third-party piracy site to play copyrighted movies and episodes by TMDB ID. That pattern was not ported. Instead, the app uses a placeholder player screen (`src/components/StreamPlaceholder.tsx`) with matching UI chrome and a comment explaining legitimate integration options:

- a licensed backend via `react-native-webview` or `expo-video`
- a TMDB watch-provider deep link using `/movie/{id}/watch/providers` or `/tv/{id}/watch/providers`
- your own authorized streaming source

Trailers are fully implemented and play the official YouTube trailer for each movie or show via TMDB's `/videos` endpoint using `react-native-webview`, mirroring the web app's behavior.

The Redux store from the web app was replaced with lightweight custom hooks:

- `useMovieDetails`
- `useTvDetails`
- `usePersonDetails`
- `useTmdbList`
- `useTmdbInfiniteList`

This keeps the same data-fetching behavior without the boilerplate of a single-store app.

The web app's liquid search box and coverflow visuals are CSS/SVG-filter tricks with no direct React Native equivalent, so the mobile version uses a clean native search input and results list while preserving the same debounced `search/multi` behavior.

## Features

- TMDB home feed and category browsing
- Movie, TV, and person detail screens
- Cast, crew, reviews, and season/episode details
- Search across multi-type results
- Official trailer playback
- Native mobile UI tuned for Expo Go

## Setup

1. Install dependencies:

      ```bash
      npm install
      ```

2. Copy `.env.example` to `.env` and add your TMDB key:

      ```bash
      cp .env.example .env
      ```

      Get a free key at https://www.themoviedb.org/settings/api and use the API Read Access Token (v4 auth), not the v3 API key.

3. Start the Expo dev server:

      ```bash
      npx expo start
      ```

4. Scan the QR code with the Expo Go app on your phone while both devices are on the same Wi‑Fi network.

## Project structure

```text
src/
  app/                  Expo Router screens (file-based routing)
    index.tsx             Home
    movies.tsx            Trending movies grid
    tv.tsx                Trending TV grid
    people.tsx            Trending people grid
    search.tsx            Search
    movie/[id]/           Movie details, trailer, watch placeholder
    tv/[id]/              TV details, trailer, watch placeholder
    person/[id].tsx       Person details
  components/           Shared UI (Card, Slider, NavBar, SeasonModal, loaders, etc.)
  hooks/                Data-fetching hooks replacing the web app's Redux store
  lib/                  TMDB API client and shared types
  constants/            Theme colors and app styling tokens
```

## Notes

- Styling uses NativeWind (Tailwind for React Native); the color palette in `global.css` matches the original web app's CSS variables.
- Images use `expo-image` for caching and efficient loading.
- Gradients use `expo-linear-gradient`.
- The floating bottom navigation uses `expo-blur` to match the frosted-glass look of the web app.
- The app is built for Expo Go and is intended for browsing and local app development rather than direct media playback from unlicensed sources.
