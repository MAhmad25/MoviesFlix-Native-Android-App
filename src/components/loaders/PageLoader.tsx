import { View } from "react-native";
import { Shimmer, ShimmerGroup } from "@/components/Shimmer";
import { colors } from "@/constants/theme";

const PLACEHOLDER_COUNT = 8;

/**
 * Ports ui/Loaders/PageLoader.jsx (PageSkeleton) — full-screen loading state
 * for the Movies/TV/People grid screens. Mirrors the real FlatList's layout
 * (padding 8, 12px gaps, 2 columns, Card's h-40 image + rating/title lines)
 * so the skeleton and the real grid don't visibly jump on swap.
 */
export function PageLoader() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ShimmerGroup duration={1200}>
        <View className="flex-1 flex-row flex-wrap gap-3 p-2">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <View key={i} style={{ flexBasis: "47%" }} className="gap-1.5 overflow-hidden rounded-xl">
              <Shimmer style={{ width: "100%", height: 160, borderRadius: 12 }} />
              <View className="gap-1.5 px-1 pb-1 pt-1">
                <Shimmer style={{ width: 56, height: 12, borderRadius: 5 }} />
                <Shimmer style={{ width: "85%", height: 13, borderRadius: 5 }} />
              </View>
            </View>
          ))}
        </View>
      </ShimmerGroup>
    </View>
  );
}
