import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { MediaActionButton } from "@/components/MediaActionButton";
import Card from "@/components/Card";
import CastChip from "@/components/CastChip";
import { StarIcon } from "@/components/icons/StarIcon";
import { DetailLoader } from "@/components/loaders/DetailLoader";
import Review from "@/components/Review";
import SeasonCard from "@/components/SeasonCard";
import SeasonModal from "@/components/SeasonModal";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { useTvDetails } from "@/hooks/useTvDetails";
import { tmdbImage } from "@/lib/tmdb";
import type { SeasonItem } from "@/lib/types";

/** Ports Components/pages/TV/TvDetails.jsx. */
export default function TvDetailsScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      const router = useRouter();
      const { data, loading } = useTvDetails(id);
      const [selectedSeason, setSelectedSeason] = useState<SeasonItem | null>(null);

      if (loading || !data) return <DetailLoader />;

      const { detail, cast, recommended, reviews } = data;
      const backdrop = tmdbImage(detail.backdrop_path, "original");
      const firstSeason = detail.seasons?.find((season) => season.season_number > 0 && season.episode_count > 0);

      return (
            <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 100 }}>
                  <SeasonModal season={selectedSeason} tvId={id} onClose={() => setSelectedSeason(null)} />
                  <Pressable sound="navigate" soundDirection="back" onPress={() => router.back()} className="absolute right-5 top-14 z-10 rounded-full bg-white/30 p-2">
                        <X size={18} color="black" />
                  </Pressable>
                  <View className="h-96 w-full">
                        <Image source={backdrop ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        <LinearGradient colors={["transparent", colors.background]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }} />
                  </View>
                  <View className="gap-3 px-4 pt-2">
                        <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-3xl font-semibold">
                              {detail.name || detail.original_name}
                        </Text>
                        {!!(detail.tagline || detail.status) && (
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-base">
                                    {detail.tagline || detail.status}
                              </Text>
                        )}
                        <View className="flex-row flex-wrap gap-2">
                              <Text style={{ color: colors.muted, backgroundColor: "rgba(254,254,254,0.1)", fontFamily: fonts.body }} className="rounded-full px-3 py-1 text-xs">
                                    Total Seasons: {detail.number_of_seasons}
                              </Text>
                              {detail.genres?.map((genre) => (
                                    <Text key={genre.id} style={{ color: colors.muted, backgroundColor: "rgba(254,254,254,0.1)", fontFamily: fonts.body }} className="rounded-full px-3 py-1 text-xs">
                                          {genre.name}
                                    </Text>
                              ))}
                        </View>
                        <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center gap-1.5">
                                    <StarIcon size={16} />
                                    <Text style={{ color: colors.text, fontFamily: fonts.body }} className="text-lg font-medium">
                                          {detail.vote_average?.toFixed(1)}/10{" "}
                                          <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-xs">
                                                {detail.vote_count} votes
                                          </Text>
                                    </Text>
                              </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                              <MediaActionButton action="watch" sound="open" disabled={!firstSeason} onPress={() => setSelectedSeason(firstSeason ?? null)} />
                              <MediaActionButton action="trailer" sound="navigate" onPress={() => router.push(`/tv/${id}/trailer` as any)} />
                              <MediaActionButton action="download" sound="open" disabled={!firstSeason} onPress={() => setSelectedSeason(firstSeason ?? null)} />
                        </View>

                        <View className="mt-3 gap-1 border-t py-3" style={{ borderColor: colors.muted }}>
                              <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-2xl font-semibold">
                                    Storyline
                              </Text>
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }}>{detail.overview || "No storyline available"}</Text>
                        </View>

                        {detail.seasons?.length > 0 && (
                              <View className="mt-2 gap-2">
                                    <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-center text-xl font-bold">
                                          Watch TV Season
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                          {detail.seasons.map((season) => (
                                                <SeasonCard key={season.id} season={season} onPress={() => setSelectedSeason(season)} />
                                          ))}
                                    </ScrollView>
                              </View>
                        )}

                        {cast.cast.length > 0 && (
                              <View className="mt-2 gap-2">
                                    <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-xl font-bold">
                                          Cast
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                          {cast.cast.slice(0, 12).map((member) => (
                                                <CastChip key={member.cast_id ?? member.id} member={member} />
                                          ))}
                                    </ScrollView>
                              </View>
                        )}

                        {reviews.length > 0 && (
                              <View className="mt-2 gap-2 border-t pt-3" style={{ borderColor: colors.muted }}>
                                    <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-xl font-bold">
                                          Reviews ({reviews.length})
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                          {reviews.slice(0, 8).map((review) => (
                                                <Review key={review.id} review={review} />
                                          ))}
                                    </ScrollView>
                              </View>
                        )}

                        {recommended.length > 0 && (
                              <View className="mt-2 gap-2">
                                    <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-xl font-bold">
                                          Similar TV Series
                                    </Text>
                                    <View className="flex-row flex-wrap gap-3">
                                          {recommended.slice(0, 12).map((item) => (
                                                <Card key={item.id} item={item} type="tv" width={150} />
                                          ))}
                                    </View>
                              </View>
                        )}
                  </View>
            </ScrollView>
      );
}
