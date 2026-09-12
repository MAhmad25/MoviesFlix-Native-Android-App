import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import Card from "@/components/Card";
import CategoryToggle from "@/components/CategoryToggle";
import { CastLoader } from "@/components/loaders/CastLoader";
import { PageLoader } from "@/components/loaders/PageLoader";
import { colors } from "@/constants/theme";
import { useTmdbInfiniteList } from "@/hooks/useTmdbInfiniteList";

const CATEGORIES = [
  { label: "On the Air", value: "on_the_air" },
  { label: "Popular Today", value: "airing_today" },
  { label: "Popular", value: "popular" },
];

/** Ports Components/pages/TV/TVPage.jsx — the trending TV grid with a category dropdown. */
export default function TvScreen() {
  const [category, setCategory] = useState("airing_today");
  const { items, loading, initialLoading, loadMore } = useTmdbInfiniteList((page) => `tv/${category}?language=en-US&page=${page}`, category);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text style={{ color: colors.text }} className="text-2xl">
          Trending TV Shows
        </Text>
        <CategoryToggle options={CATEGORIES} value={category} onChange={setCategory} />
      </View>
      {initialLoading ? (
        <PageLoader />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 8, paddingBottom: 100, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          numColumns={2}
          data={items}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <Card item={item} type="tv" fluid />}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListFooterComponent={loading ? <CastLoader /> : null}
        />
      )}
    </View>
  );
}
