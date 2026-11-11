import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Card from "@/components/Card";
import CategoryToggle from "@/components/CategoryToggle";
import { CastLoader } from "@/components/loaders/CastLoader";
import { PageLoader } from "@/components/loaders/PageLoader";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { useTmdbInfiniteList } from "@/hooks/useTmdbInfiniteList";
import { tmdb } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

type MovieGenre = { id: number; name: string };

/** Ports Components/pages/Movie/MoviePage.jsx — the trending movies grid. */
export default function MoviesScreen() {
  const listRef = useRef<FlatList<MediaItem>>(null);
  const [genres, setGenres] = useState<MovieGenre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresFailed, setGenresFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("trending");

  useEffect(() => {
    let isActive = true;
    tmdb
      .get("genre/movie/list?language=en-US")
      .then(({ data }) => {
        if (isActive) setGenres(Array.isArray(data.genres) ? data.genres : []);
      })
      .catch(() => {
        if (isActive) setGenresFailed(true);
      })
      .finally(() => {
        if (isActive) setGenresLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => [
      { label: "Trending", value: "trending" },
      ...genres.map(({ id, name }) => ({ label: name, value: String(id) })),
    ],
    [genres],
  );
  const selectedGenre = genres.find(({ id }) => String(id) === selectedCategory);
  const pathForPage = useCallback((page: number) => {
    if (selectedCategory === "trending") return `trending/movie/day?page=${page}`;
    return `discover/movie?language=en-US&include_adult=false&sort_by=popularity.desc&with_genres=${selectedCategory}&page=${page}`;
  }, [selectedCategory]);
  const { items, loading, initialLoading, loadMore } = useTmdbInfiniteList(pathForPage, selectedCategory);

  const selectedLabel = selectedGenre?.name ?? "Trending";

  return (
    <FlatList
      ref={listRef}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 8, paddingBottom: 100, gap: 12 }}
      columnWrapperStyle={{ gap: 12 }}
      numColumns={2}
      data={items}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => <Card item={item} type="movie" fluid />}
      onEndReachedThreshold={0.5}
      onEndReached={loadMore}
      ListHeaderComponent={(
        <View style={{ paddingHorizontal: 4, paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: fonts.heading, fontSize: 23 }}>Movies</Text>
              <Text style={{ marginTop: 2, color: colors.muted, fontFamily: fonts.body, fontSize: 12 }}>
                {selectedCategory === "trending" ? "Trending today" : `Popular ${selectedLabel} movies`}
              </Text>
            </View>
            {genresLoading ? (
              <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 12 }}>Loading genres…</Text>
            ) : (
              <CategoryToggle
                options={categoryOptions}
                value={selectedCategory}
                onChange={(value) => {
                  listRef.current?.scrollToOffset({ offset: 0, animated: false });
                  setSelectedCategory(value);
                }}
              />
            )}
          </View>
          {genresFailed && (
            <Text style={{ marginTop: 6, color: colors.muted, fontFamily: fonts.body, fontSize: 12 }}>
              Genres are unavailable right now. Trending movies are still showing.
            </Text>
          )}
        </View>
      )}
      ListEmptyComponent={initialLoading ? (
        <PageLoader />
      ) : (
        <View style={{ alignItems: "center", paddingTop: 36 }}>
          <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 14 }}>
            No movies found for {selectedLabel}.
          </Text>
        </View>
      )}
      ListFooterComponent={loading && items.length > 0 ? <CastLoader variant="footer" /> : null}
    />
  );
}
