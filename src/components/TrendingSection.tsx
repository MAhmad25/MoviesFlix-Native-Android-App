import { useState } from "react";
import { Text, View } from "react-native";
import { fonts } from "@/constants/fonts";
import { colors } from "@/constants/theme";
import { useTmdbList } from "@/hooks/useTmdbList";
import CategoryToggle from "./CategoryToggle";
import Slider from "./Slider";
import { CastLoader } from "./loaders/CastLoader";

/** Ports ui/TrendingContainer.jsx — the Home screen's "Trending Now" row with a movie/TV toggle. */
export default function TrendingSection() {
  const [query, setQuery] = useState<"tv" | "movie">("tv");
  const { data, loading, error } = useTmdbList(`trending/${query}/day`);

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
      {loading ? <CastLoader /> : error ? (
        <View className="px-4 py-5">
          <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 14 }}>
            Trending titles couldn’t load. They’ll retry when Home is opened again.
          </Text>
        </View>
      ) : <Slider data={data} type={query} />}
    </View>
  );
}
