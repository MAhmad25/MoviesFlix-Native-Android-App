import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { mediaTitle, mediaType, tmdbImage } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";

interface CardProps {
      item: MediaItem;
      type?: "movie" | "tv" | "person";
      /** Fixed width for slider use. Ignored when `fluid` is set. */
      width?: number;
      /** Grid use (e.g. a 2-column FlatList) — fills the available column width instead of a fixed one. */
      fluid?: boolean;
}

/** Ports Components/ui/Card.jsx — used in sliders and the grid pages. */
export default function Card({ item, type = "movie", width = 150, fluid = false }: CardProps) {
      const router = useRouter();
      const path = item.backdrop_path || item.poster_path || item.profile_path || null;
      const src = tmdbImage(path, "w500");
      const resolvedType = mediaType(item, type);

      return (
            <Pressable sound="navigate" onPress={() => router.push(`/${resolvedType}/${item.id}` as any)} style={fluid ? { flex: 1 } : { width }} className="shrink-0 overflow-hidden rounded-xl">
                  <View style={{ backgroundColor: colors.card }} className="overflow-hidden rounded-xl">
                        <View className="relative h-40 w-full sm:h-56">
                              <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
                              <LinearGradient colors={["transparent", colors.card]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 28 }} />
                        </View>

                        <View className="gap-1.5 px-3 pb-3 pt-1.5">
                              {item.vote_average !== 0 && (
                                    <View className="flex-row items-center justify-between gap-2">
                                          {!!item.vote_average && (
                                                <View className="flex-row items-center gap-1">
                                                      <StarIcon size={12} />
                                                      <Text style={{ color: colors.text, fontFamily: fonts.body }} className="text-xs font-medium">
                                                            {item.vote_average.toFixed(1)}
                                                      </Text>
                                                </View>
                                          )}
                                          {!!item.media_type && (
                                                <Text style={{ color: colors.rating, borderColor: colors.rating, fontFamily: fonts.body }} className="rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                                      {item.media_type.toUpperCase()}
                                                </Text>
                                          )}
                                    </View>
                              )}
                              <Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.body }} className="text-sm tracking-tight">
                                    {mediaTitle(item)}
                              </Text>
                        </View>
                  </View>
            </Pressable>
      );
}
