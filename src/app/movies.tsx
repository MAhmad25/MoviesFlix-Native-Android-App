import { FlatList } from "react-native";
import Card from "@/components/Card";
import { CastLoader } from "@/components/loaders/CastLoader";
import { PageLoader } from "@/components/loaders/PageLoader";
import { colors } from "@/constants/theme";
import { useTmdbInfiniteList } from "@/hooks/useTmdbInfiniteList";

/** Ports Components/pages/Movie/MoviePage.jsx — the trending movies grid. */
export default function MoviesScreen() {
  const { items, loading, initialLoading, loadMore } = useTmdbInfiniteList((page) => `trending/movie/day?page=${page}`);

  if (initialLoading) return <PageLoader />;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 8, paddingBottom: 100, gap: 12 }}
      columnWrapperStyle={{ gap: 12 }}
      numColumns={2}
      data={items}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => <Card item={item} type="movie" fluid />}
      onEndReachedThreshold={0.5}
      onEndReached={loadMore}
      ListFooterComponent={loading ? <CastLoader /> : null}
    />
  );
}
