import { useEffect, useMemo, useRef } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { mediaTitle, mediaType, tmdbImage } from "@/lib/tmdb";
import { useTmdbList } from "@/hooks/useTmdbList";
import type { MediaItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";
import { ParallaxCarousel } from "./ParallaxCarousel";
import type { ParallaxCarouselRef } from "./ParallaxCarousel/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH - 56;
const ITEM_HEIGHT = 440;
const CARD_SPACING = 10;
const AUTOPLAY_MS = 4500;

type HeroItem = MediaItem & { image: ImageSourcePropType };

/**
 * Ports ui/Header.jsx — an autoplaying hero carousel. Now built on
 * <ParallaxCarousel /> for a peeking-card layout with a subtle image
 * parallax as you swipe and a haptic tap on release, instead of a plain
 * paging FlatList. The data + rendered content (title, overview, rating,
 * "See details") are unchanged — still real TMDB trending data.
 */
export default function HeaderCarousel() {
      const { data } = useTmdbList("trending/all/day");
      const router = useRouter();
      const carouselRef = useRef<ParallaxCarouselRef>(null);
      const indexRef = useRef(0);

      const heroData = useMemo<HeroItem[]>(
            () =>
                  data.map((item) => {
                        const uri = tmdbImage(item.backdrop_path || item.poster_path, "w780");
                        return {
                              ...item,
                              image: uri ? { uri } : require("@/assets/images/no-image.jpg"),
                        };
                  }),
            [data],
      );

      useEffect(() => {
            if (heroData.length < 2) return;
            const timer = setInterval(() => {
                  indexRef.current = (indexRef.current + 1) % heroData.length;
                  carouselRef.current?.scrollToIndex(indexRef.current, true);
            }, AUTOPLAY_MS);
            return () => clearInterval(timer);
      }, [heroData.length]);

      if (heroData.length === 0) return null;

      return (
            <View style={{ height: ITEM_HEIGHT }}>
                  <ParallaxCarousel
                        ref={carouselRef}
                        data={heroData}
                        itemWidth={ITEM_WIDTH}
                        itemHeight={ITEM_HEIGHT}
                        spacing={CARD_SPACING}
                        parallaxIntensity={0.55}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => {
                              const type = mediaType(item, "movie");
                              return (
                                    <View
                                          pointerEvents="box-none"
                                          style={{
                                                position: "absolute",
                                                top: CARD_SPACING,
                                                left: CARD_SPACING,
                                                right: CARD_SPACING,
                                                bottom: CARD_SPACING,
                                                borderRadius: 12,
                                                overflow: "hidden",
                                          }}
                                    >
                                          <LinearGradient
                                                colors={["transparent", colors.background]}
                                                style={{
                                                      position: "absolute",
                                                      left: 0,
                                                      right: 0,
                                                      bottom: 0,
                                                      height: "70%",
                                                }}
                                          />
                                          <View className="absolute bottom-0 left-0 right-0 gap-2 p-4">
                                                <Text numberOfLines={2} style={{ color: colors.text, fontFamily: fonts.heading }} className="text-2xl font-semibold">
                                                      {mediaTitle(item)}
                                                </Text>
                                                {!!item.overview && (
                                                      <Text numberOfLines={2} style={{ color: colors.muted, fontFamily: fonts.body }} className="text-sm">
                                                            {item.overview}
                                                      </Text>
                                                )}
                                                <View className="flex-row items-center gap-2">
                                                      {!!item.vote_average && (
                                                            <View className="flex-row items-center gap-1 rounded-full border px-2.5 py-1" style={{ borderColor: colors.rating }}>
                                                                  <StarIcon size={12} />
                                                                  <Text style={{ color: colors.rating, fontFamily: fonts.body }} className="text-xs font-bold">
                                                                        {item.vote_average.toFixed(1)}
                                                                  </Text>
                                                            </View>
                                                      )}
                                                      <Pressable onPress={() => router.push(`/${type}/${item.id}` as any)} className="rounded-full px-3 py-1" style={{ backgroundColor: colors.accent }}>
                                                            <Text style={{ color: colors.text, fontFamily: fonts.body }} className="text-xs font-semibold">
                                                                  See details
                                                            </Text>
                                                      </Pressable>
                                                </View>
                                          </View>
                                    </View>
                              );
                        }}
                  />
            </View>
      );
}
