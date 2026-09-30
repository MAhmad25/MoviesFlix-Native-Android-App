import { View } from "react-native";
import { Shimmer, ShimmerGroup } from "@/components/Shimmer";

interface CastLoaderProps {
  /**
   * "row" (default) mirrors a `Slider` of `Card`s — used the first time a
   * Home section (HomeSection/TrendingSection) fetches its list.
   * "footer" is a compact inline bar shown under a grid while
   * `useTmdbInfiniteList` is loading another page.
   */
  variant?: "row" | "footer";
}

const ROW_PLACEHOLDER_COUNT = 4;

/** Ports ui/Loaders/CastLoader.jsx — inline loading state for sliders and infinite-scroll footers. */
export function CastLoader({ variant = "row" }: CastLoaderProps) {
  if (variant === "footer") {
    return (
      <View className="w-full items-center justify-center py-6">
        <Shimmer style={{ width: 120, height: 10, borderRadius: 5 }} />
      </View>
    );
  }

  return (
    <View className="w-full flex-row gap-3 px-4">
      <ShimmerGroup duration={1200}>
        {Array.from({ length: ROW_PLACEHOLDER_COUNT }).map((_, i) => (
          <View key={i} style={{ width: 150 }} className="gap-1.5 overflow-hidden rounded-xl">
            <Shimmer style={{ width: "100%", height: 160, borderRadius: 12 }} />
            <Shimmer style={{ width: 56, height: 12, borderRadius: 5 }} />
            <Shimmer style={{ width: "85%", height: 13, borderRadius: 5 }} />
          </View>
        ))}
      </ShimmerGroup>
    </View>
  );
}
