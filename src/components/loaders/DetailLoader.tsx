import { ScrollView, View } from "react-native";
import { Shimmer, ShimmerGroup } from "@/components/Shimmer";
import { colors } from "@/constants/theme";

const CAST_PLACEHOLDER_COUNT = 6;

/**
 * Ports ui/Loaders/DetailLoader.jsx — shown on the Movie/TV details screens
 * while `useMovieDetails`/`useTvDetails` loads. Mirrors movie/[id]/index.tsx:
 * h-96 backdrop, title + tagline, genre chip row, rating/watch/trailer row,
 * a storyline paragraph, and a horizontal row of cast avatar chips.
 */
export function DetailLoader() {
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      scrollEnabled={false}
    >
      <ShimmerGroup duration={1300}>
        <Shimmer style={{ width: "100%", height: 384 }} />

        <View className="gap-3 px-4 pt-4">
          <Shimmer style={{ width: "75%", height: 26, borderRadius: 6 }} />
          <Shimmer style={{ width: "45%", height: 14, borderRadius: 5 }} />

          <View className="flex-row flex-wrap gap-2">
            <Shimmer style={{ width: 64, height: 24, borderRadius: 999 }} />
            <Shimmer style={{ width: 84, height: 24, borderRadius: 999 }} />
            <Shimmer style={{ width: 56, height: 24, borderRadius: 999 }} />
          </View>

          <View className="flex-row items-center justify-between">
            <Shimmer style={{ width: 100, height: 18, borderRadius: 5 }} />
            <View className="flex-row gap-4">
              <Shimmer style={{ width: 60, height: 20, borderRadius: 5 }} />
              <Shimmer style={{ width: 60, height: 20, borderRadius: 5 }} />
            </View>
          </View>

          <View className="mt-3 gap-2 border-t py-3" style={{ borderColor: colors.muted }}>
            <Shimmer style={{ width: 110, height: 20, borderRadius: 5 }} />
            <Shimmer style={{ width: "100%", height: 13, borderRadius: 5 }} />
            <Shimmer style={{ width: "95%", height: 13, borderRadius: 5 }} />
            <Shimmer style={{ width: "60%", height: 13, borderRadius: 5 }} />
          </View>

          <View className="mt-2 gap-2">
            <Shimmer style={{ width: 60, height: 18, borderRadius: 5 }} />
            <View className="flex-row gap-3">
              {Array.from({ length: CAST_PLACEHOLDER_COUNT }).map((_, i) => (
                <View key={i} className="w-24 items-center gap-2">
                  <Shimmer style={{ width: 96, height: 96, borderRadius: 48 }} />
                  <Shimmer style={{ width: 60, height: 10, borderRadius: 4 }} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ShimmerGroup>
    </ScrollView>
  );
}
