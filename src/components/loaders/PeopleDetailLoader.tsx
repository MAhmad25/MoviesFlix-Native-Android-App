import { ScrollView, View } from "react-native";
import { Shimmer, ShimmerGroup } from "@/components/Shimmer";
import { colors } from "@/constants/theme";

const PROJECT_PLACEHOLDER_COUNT = 5;

/**
 * Ports ui/Loaders/PeopleDetailLoader.jsx — shown on the Person details
 * screen while `usePersonDetails` loads. Mirrors person/[id].tsx: profile
 * photo, name + popularity, notable-role chips, personal info lines,
 * biography paragraph, and a horizontal row of filmography (ViewCard) tiles.
 */
export function PeopleDetailLoader() {
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 56 }}
      scrollEnabled={false}
    >
      <ShimmerGroup duration={1300}>
        <View className="items-center gap-3 px-4">
          <Shimmer style={{ width: 128, height: 160, borderRadius: 16 }} />
          <Shimmer style={{ width: 160, height: 22, borderRadius: 6 }} />
          <Shimmer style={{ width: 70, height: 14, borderRadius: 5 }} />
          <View className="flex-row flex-wrap justify-center gap-2">
            <Shimmer style={{ width: 70, height: 22, borderRadius: 999 }} />
            <Shimmer style={{ width: 90, height: 22, borderRadius: 999 }} />
            <Shimmer style={{ width: 60, height: 22, borderRadius: 999 }} />
          </View>
        </View>

        <View className="mt-6 gap-2 px-4">
          <Shimmer style={{ width: 130, height: 20, borderRadius: 5 }} />
          <Shimmer style={{ width: "50%", height: 13, borderRadius: 5 }} />
          <Shimmer style={{ width: "60%", height: 13, borderRadius: 5 }} />
          <Shimmer style={{ width: "40%", height: 13, borderRadius: 5 }} />
        </View>

        <View className="mt-4 gap-2 px-4">
          <Shimmer style={{ width: 110, height: 20, borderRadius: 5 }} />
          <Shimmer style={{ width: "100%", height: 13, borderRadius: 5 }} />
          <Shimmer style={{ width: "100%", height: 13, borderRadius: 5 }} />
          <Shimmer style={{ width: "80%", height: 13, borderRadius: 5 }} />
        </View>

        <View className="mt-4 gap-2 px-4">
          <Shimmer style={{ width: 150, height: 20, borderRadius: 5 }} />
          <View className="flex-row gap-3">
            {Array.from({ length: PROJECT_PLACEHOLDER_COUNT }).map((_, i) => (
              <View key={i} style={{ width: 160 }} className="gap-1.5">
                <Shimmer style={{ width: "100%", height: 168, borderRadius: 8 }} />
                <Shimmer style={{ width: "80%", height: 12, borderRadius: 5 }} />
                <Shimmer style={{ width: "50%", height: 10, borderRadius: 4 }} />
              </View>
            ))}
          </View>
        </View>
      </ShimmerGroup>
    </ScrollView>
  );
}
