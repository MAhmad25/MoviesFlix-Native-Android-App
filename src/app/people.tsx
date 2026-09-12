import { FlatList, Text, View } from "react-native";
import Card from "@/components/Card";
import { CastLoader } from "@/components/loaders/CastLoader";
import { PageLoader } from "@/components/loaders/PageLoader";
import { colors } from "@/constants/theme";
import { useTmdbInfiniteList } from "@/hooks/useTmdbInfiniteList";

/** Ports Components/pages/People/PeoplePage.jsx — the trending people grid. */
export default function PeopleScreen() {
  const { items, loading, initialLoading, loadMore } = useTmdbInfiniteList((page) => `trending/person/day?page=${page}`);

  if (initialLoading) return <PageLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }} className="px-4 py-4 text-2xl">
        Trending Celebrities
      </Text>
      <FlatList
        contentContainerStyle={{ padding: 8, paddingBottom: 100, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        numColumns={2}
        data={items}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <Card item={item} type="person" fluid />}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListFooterComponent={loading ? <CastLoader /> : null}
      />
    </View>
  );
}
