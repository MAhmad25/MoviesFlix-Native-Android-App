import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/constants/theme";
import { tmdbImage } from "@/lib/tmdb";
import type { SeasonItem } from "@/lib/types";

/** Ports ui/SeasonCard.jsx — a poster card in the horizontal season row (replaces the web app's Coverflow, which has no RN equivalent). */
export default function SeasonCard({ season, onPress }: { season: SeasonItem; onPress: () => void }) {
      const src = tmdbImage(season.poster_path, "w500");

      return (
            <Pressable sound="open" onPress={onPress} className="h-64 w-40 shrink-0 gap-1.5">
                  <View className="h-[85%] w-full overflow-hidden rounded-md" style={{ backgroundColor: colors.card }}>
                        <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
                  </View>
                  <Text numberOfLines={1} style={{ color: colors.text }} className="text-sm">
                        {season.name}
                  </Text>
            </Pressable>
      );
}
