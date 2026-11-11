import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, AppState, Dimensions, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { mediaTitle, mediaType, tmdb, tmdbImage } from "@/lib/tmdb";
import { useTmdbList } from "@/hooks/useTmdbList";
import type { MediaItem, SeasonItem } from "@/lib/types";
import { openDownloadPage } from "@/lib/downloads";
import { StarIcon } from "./icons/StarIcon";
import { Shimmer, ShimmerGroup } from "./Shimmer";
import { ParallaxCarousel } from "./ParallaxCarousel";
import type { ParallaxCarouselRef } from "./ParallaxCarousel/types";
import { MediaActionButton } from "./MediaActionButton";
import SeasonModal from "./SeasonModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = SCREEN_WIDTH - 56;
const ITEM_HEIGHT = 440;
const CARD_SPACING = 10;
const AUTOPLAY_MS = 4500;

type HeroItem = MediaItem & { image: ImageSourcePropType };

/**
 * Ports ui/Header.jsx — an autoplaying hero carousel. Now built on
 * <ParallaxCarousel /> for a peeking-card layout with a subtle image
 * parallax as you swipe, instead of a plain
 * paging FlatList. The data + rendered content (title, overview, rating,
 * details plus direct watch and download actions — still real TMDB trending data.
 */
export default function HeaderCarousel() {
  const { data, loading } = useTmdbList("trending/all/day");
  const router = useRouter();
  const carouselRef = useRef<ParallaxCarouselRef>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedRef = useRef(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonItem | null>(null);
  const [selectedTvId, setSelectedTvId] = useState<string | null>(null);
  const [openingTvId, setOpeningTvId] = useState<number | null>(null);

  const openFirstSeason = useCallback(async (id: number) => {
    setOpeningTvId(id);
    try {
      const { data: detail } = await tmdb.get(`/tv/${id}?language=en-US`);
      const season = detail.seasons?.find((entry: SeasonItem) => entry.season_number > 0 && entry.episode_count > 0);
      if (!season) {
        Alert.alert("Episodes unavailable", "This series does not have a season available to play yet.");
        return;
      }
      setSelectedTvId(String(id));
      setSelectedSeason(season);
    } catch {
      Alert.alert("Could not load series", "Check your connection and try the Watch or Download button again.");
    } finally {
      setOpeningTvId(null);
    }
  }, []);

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

  const pauseAutoplay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const resumeAutoplay = useCallback(() => {
    pauseAutoplay();
    if (!focusedRef.current || heroData.length < 2 || (AppState.currentState && AppState.currentState !== "active")) return;
    timerRef.current = setTimeout(function advance() {
      indexRef.current = (indexRef.current + 1) % heroData.length;
      carouselRef.current?.scrollToIndex(indexRef.current, true);
      // Also keep advancing on platforms that omit momentum events for scrollToIndex.
      timerRef.current = setTimeout(advance, AUTOPLAY_MS);
    }, AUTOPLAY_MS);
  }, [heroData.length, pauseAutoplay]);

  const handleIndexChange = useCallback((index: number) => {
    indexRef.current = index;
  }, []);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    indexRef.current = Math.min(indexRef.current, Math.max(heroData.length - 1, 0));
    resumeAutoplay();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") resumeAutoplay();
      else pauseAutoplay();
    });
    return () => {
      focusedRef.current = false;
      pauseAutoplay();
      subscription.remove();
    };
  }, [heroData.length, resumeAutoplay, pauseAutoplay]));

  if (loading && heroData.length === 0) {
    return (
      <View style={{ height: ITEM_HEIGHT, alignItems: "center" }}>
        <ShimmerGroup duration={1300}>
          <Shimmer
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT - CARD_SPACING * 2,
              marginTop: CARD_SPACING,
              borderRadius: 12,
            }}
          />
        </ShimmerGroup>
      </View>
    );
  }

  if (heroData.length === 0) return null;

  return (
    <View style={{ height: ITEM_HEIGHT }}>
      <SeasonModal season={selectedSeason} tvId={selectedTvId ?? ""} onClose={() => { setSelectedSeason(null); setSelectedTvId(null); }} />
      <ParallaxCarousel
        ref={carouselRef}
        data={heroData}
        itemWidth={ITEM_WIDTH}
        itemHeight={ITEM_HEIGHT}
        spacing={CARD_SPACING}
        parallaxIntensity={0.55}
        onIndexChange={handleIndexChange}
        onInteractionStart={pauseAutoplay}
        onInteractionEnd={resumeAutoplay}
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
                  <Pressable sound="navigate" onPress={() => router.push(`/${type}/${item.id}` as any)} className="rounded-full px-3 py-1" style={{ backgroundColor: colors.accent }}>
                    <Text style={{ color: colors.text, fontFamily: fonts.body }} className="text-xs font-semibold">
                      See details
                    </Text>
                  </Pressable>
                </View>
                {type !== "person" && (
                  <View className="flex-row gap-2">
                    <MediaActionButton
                      action="watch"
                      sound="open"
                      disabled={type === "tv" && openingTvId === item.id}
                      onPress={() => {
                        if (type === "tv") void openFirstSeason(item.id);
                        else router.push(`/movie/${item.id}/watch` as any);
                      }}
                    />
                    <MediaActionButton
                      action="download"
                      sound="open"
                      disabled={type === "tv" && openingTvId === item.id}
                      onPress={() => {
                        if (type === "tv") void openFirstSeason(item.id);
                        else void openDownloadPage({ type: "movie", id: String(item.id) });
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
