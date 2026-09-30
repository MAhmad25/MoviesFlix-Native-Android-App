import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { mediaTitle, tmdbImage } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";

/** Ports ui/ViewCard.jsx — a horizontal filmography card on the Person details screen. */
export default function ViewCard({ item, type = "movie" }: { item: MediaItem; type?: "movie" | "tv" }) {
      const router = useRouter();
      const resolvedType = item.media_type || type;
      const src = tmdbImage(item.backdrop_path || item.poster_path, "w500");

      return (
            <Pressable sound="navigate" onPress={() => router.push(`/${resolvedType}/${item.id}` as any)} className="h-56 w-40 shrink-0">
                  <View className="h-3/4 w-full overflow-hidden rounded-lg" style={{ backgroundColor: colors.card }}>
                        <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
                  </View>
                  <View className="mt-2 gap-0.5">
                        <Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.body }} className="text-sm">
                              {mediaTitle(item)}
                        </Text>
                        <View className="flex-row items-center gap-2">
                              {!!item.release_date && (
                                    <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-xs">
                                          {item.release_date.split("-")[0]}
                                    </Text>
                              )}
                              {!!item.vote_average && (
                                    <View className="flex-row items-center gap-1">
                                          <StarIcon size={10} />
                                          <Text style={{ color: colors.rating, fontFamily: fonts.body }} className="text-xs">
                                                {item.vote_average.toFixed(1)}
                                          </Text>
                                    </View>
                              )}
                        </View>
                  </View>
            </Pressable>
      );
}
