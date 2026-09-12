import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { tmdbImage } from "@/lib/tmdb";
import type { SeasonItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";
import { WatchIcon } from "./icons/WatchIcon";

interface SeasonModalProps {
      season: SeasonItem | null;
      tvId: string;
      onClose: () => void;
}

/**
 * Ports pages/TV/TVSeasonModal.jsx (incl. its EpisodeSelector) — episode picker for a season, then routes to the Watch placeholder.
 *
 * The backdrop uses BlurView (dark tint) over a dim layer. Inside a Modal we can't wire Android's
 * `blurTarget` / `dimezisBlurView` to the screen behind, so Android falls back to the default
 * semi-transparent overlay; iOS still gets a real blur.
 */
export default function SeasonModal({ season, tvId, onClose }: SeasonModalProps) {
      const router = useRouter();
      const [episode, setEpisode] = useState(1);
      const src = season ? tmdbImage(season.poster_path, "original") : null;
      const totalEpisodes = season?.episode_count || 1;

      return (
            <Modal visible={!!season} transparent animationType="fade" onRequestClose={onClose}>
                  <View style={StyleSheet.absoluteFill}>
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
                        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
                        <View className="flex-1 items-center justify-center px-4" pointerEvents="box-none">
                              <Pressable onPress={(e) => e.stopPropagation()} className="max-h-[85%] w-full overflow-hidden rounded-2xl" style={{ backgroundColor: colors.background }}>
                                    <ScrollView>
                                          <View>
                                                <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: 200 }} contentFit="cover" />
                                                <Pressable onPress={onClose} className="absolute right-3 top-3 rounded-full bg-black/50 p-2">
                                                      <X size={16} color={colors.text} />
                                                </Pressable>
                                          </View>
                                          <View className="gap-3 p-4">
                                                <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-2xl font-semibold">
                                                      {season?.name}
                                                </Text>
                                                <View className="flex-row items-center gap-3">
                                                      <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-sm">
                                                            Total Episodes: {season?.episode_count ?? 0}
                                                      </Text>
                                                      <View className="flex-row items-center gap-1">
                                                            <StarIcon size={14} />
                                                            <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-sm">
                                                                  {season?.vote_average || "No rating"}
                                                            </Text>
                                                      </View>
                                                </View>
                                                {!!season?.overview && (
                                                      <Text style={{ color: colors.muted, fontFamily: fonts.body }} className="text-sm">
                                                            {season.overview}
                                                      </Text>
                                                )}
                                                <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="mt-2 text-lg font-semibold">
                                                      Select Episode
                                                </Text>
                                                <View className="flex-row flex-wrap gap-2">
                                                      {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                                                            <Pressable key={ep} onPress={() => setEpisode(ep)} className="h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: ep === episode ? colors.accent : "rgba(254,254,254,0.08)" }}>
                                                                  <Text style={{ color: colors.text, fontFamily: fonts.body }}>{ep}</Text>
                                                            </Pressable>
                                                      ))}
                                                </View>
                                                <Pressable
                                                      onPress={() => {
                                                            onClose();
                                                            router.push(`/tv/${tvId}/watch/${season?.season_number}/${episode}` as any);
                                                      }}
                                                      className="mt-3 flex-row items-center justify-center gap-2 self-center rounded-md px-4 py-2"
                                                      style={{ backgroundColor: "rgba(26,46,5,0.8)" }}
                                                >
                                                      <WatchIcon color="#a3e635" />
                                                      <Text style={{ color: "#a3e635", fontFamily: fonts.body }} className="font-medium uppercase">
                                                            Watch
                                                      </Text>
                                                </Pressable>
                                          </View>
                                    </ScrollView>
                              </Pressable>
                        </View>
                  </View>
            </Modal>
      );
}
