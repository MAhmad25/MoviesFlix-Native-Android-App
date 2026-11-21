import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { fonts } from "@/constants/fonts";
import { colors } from "@/constants/theme";
import { useTmdbList } from "@/hooks/useTmdbList";
import CategoryToggle from "./CategoryToggle";
import Slider from "./Slider";
import { CastLoader } from "./loaders/CastLoader";

/** Ports ui/TrendingContainer.jsx — the Home screen's "Trending Now" row with a movie/TV toggle. */
export default function TrendingSection() {
  const [query, setQuery] = useState<"tv" | "movie">("tv");
  const { data, loading, error, retry } = useTmdbList(`trending/${query}/day`);

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
            Trending titles couldn’t load. Check your connection and try again.
          </Text>
          <Pressable accessibilityRole="button" onPress={retry} style={{ alignSelf: "flex-start", paddingVertical: 10 }}>
            <Text style={{ color: colors.accent, fontFamily: fonts.heading, fontSize: 14 }}>Try again</Text>
          </Pressable>
        </View>
      ) : <Slider data={data} type={query} />}
    </View>
  );
}
