import { useState } from "react";
import { Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { useTmdbList } from "@/hooks/useTmdbList";
import CategoryToggle from "./CategoryToggle";
import Slider from "./Slider";
import { CastLoader } from "./loaders/CastLoader";

/** Ports ui/TrendingContainer.jsx — the Home screen's "Trending Now" row with a movie/TV toggle. */
export default function TrendingSection() {
  const [query, setQuery] = useState<"tv" | "movie">("tv");
  const { data, loading } = useTmdbList(`trending/${query}/day`);

  return (
    <View className="w-full px-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text style={{ color: colors.text }} className="text-xl">
          Trending Now
        </Text>
        <CategoryToggle
          options={[
            { label: "TV", value: "tv" },
            { label: "Movies", value: "movie" },
          ]}
          value={query}
          onChange={(v) => setQuery(v as "tv" | "movie")}
        />
      </View>
      {loading ? <CastLoader /> : <Slider data={data} type={query} />}
    </View>
  );
}
