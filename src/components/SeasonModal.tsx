import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Button } from "heroui-native/button";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { tmdb, tmdbImage } from "@/lib/tmdb";
import { playSound } from "@/lib/interactionSounds";
import { openDownloadPage } from "@/lib/downloads";
import type { EpisodeItem, SeasonItem } from "@/lib/types";
import { StarIcon } from "./icons/StarIcon";
import { SoundPressable } from "./SoundPressable";
import { MediaActionButton } from "./MediaActionButton";

interface SeasonModalProps {
  season: SeasonItem | null;
  tvId: string;
  onClose: () => void;
}

export default function SeasonModal({ season, tvId, onClose }: SeasonModalProps) {
  if (!season) return null;
  return <SeasonModalContent key={season.id} season={season} tvId={tvId} onClose={onClose} />;
}

function SeasonModalContent({ season, tvId, onClose }: Omit<SeasonModalProps, "season"> & { season: SeasonItem }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [episodesFailed, setEpisodesFailed] = useState(false);
  const src = tmdbImage(season.poster_path, "w780");
  const totalEpisodes = episodes.length || season.episode_count || 0;
  const verticalPadding = 48;
  const panelHeight = Math.min(680, height - insets.top - insets.bottom - verticalPadding * 2);
  const dismiss = () => { playSound("close"); onClose(); };
  useEffect(() => {
    let active = true;
    tmdb.get(`/tv/${tvId}/season/${season.season_number}?language=en-US`)
      .then(({ data }) => {
        if (!active) return;
        const nextEpisodes = Array.isArray(data.episodes)
          ? [...data.episodes].sort((a, b) => a.episode_number - b.episode_number)
          : [];
        setEpisodes(nextEpisodes);
        setSelectedEpisode(nextEpisodes[0]?.episode_number ?? null);
      })
      .catch(() => {
        if (active) setEpisodesFailed(true);
      })
      .finally(() => {
        if (active) setEpisodesLoading(false);
      });

    return () => { active = false; };
  }, [season.season_number, tvId]);

  const openEpisode = (action: "watch" | "download", episodeNumber: number) => {
    onClose();
    if (action === "download") {
      void openDownloadPage({ type: "tv", id: tvId, season: String(season.season_number), episode: String(episodeNumber) });
    } else {
      router.push(`/tv/${tvId}/watch/${season.season_number}/${episodeNumber}` as any);
    }
  };

  return (
    <Modal visible transparent presentationStyle="overFullScreen" animationType="fade" statusBarTranslucent onShow={() => setStatusBarHidden(true, "none")} onRequestClose={dismiss}>
      <StatusBar hidden />
      <View style={[styles.backdrop, { paddingTop: insets.top + verticalPadding, paddingBottom: insets.bottom + verticalPadding }]}>
        <SoundPressable sound="close" onPress={onClose} accessibilityLabel="Dismiss season" style={StyleSheet.absoluteFill} />
        <View style={[styles.panel, { height: panelHeight }]} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.heading}>{season.name}</Text>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              background={null}
              accessibilityLabel="Close season"
              style={styles.close}
              onPress={() => { playSound("close"); onClose(); }}
            >
              <X size={22} color={colors.text} />
            </Button>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator nestedScrollEnabled>
            <Image source={src ?? require("@/assets/images/no-image.jpg")} style={styles.poster} contentFit="contain" />
            <View style={styles.body}>
              <View style={styles.seasonDetails}>
                <View style={styles.metadata}>
                  <Text style={styles.description}>{totalEpisodes} episodes</Text>
                  <View style={styles.metadata}>
                    <StarIcon size={14} />
                    <Text style={styles.description}>{season.vote_average ? season.vote_average.toFixed(1) : "No rating"}</Text>
                  </View>
                </View>
                {!!season.overview && <Text style={styles.description}>{season.overview}</Text>}
              </View>
              <View style={styles.episodeHeading}>
                <Text style={styles.heading}>Episodes</Text>
                <Text style={styles.description}>{episodes.length || season.episode_count || 0} total</Text>
              </View>
              {episodesLoading ? (
                <View style={styles.stateRow}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={styles.description}>Loading episode details…</Text>
                </View>
              ) : episodesFailed ? (
                <Text style={styles.description}>Episode details could not be loaded. Check your connection and reopen this season.</Text>
              ) : episodes.length > 0 ? (
                <View style={styles.episodeList}>
                  {episodes.map((item) => {
                    const selected = item.episode_number === selectedEpisode;
                    const still = tmdbImage(item.still_path, "w300");
                    const metadata = [
                      item.air_date,
                      item.runtime ? `${item.runtime} min` : null,
                      item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : null,
                    ].filter(Boolean).join(" · ");
                    return (
                      <View key={item.id} style={[styles.episodeCard, selected && styles.episodeCardSelected]}>
                        <SoundPressable
                          sound="select"
                          onPress={() => setSelectedEpisode(item.episode_number)}
                          accessibilityRole="button"
                          accessibilityLabel={`Select episode ${item.episode_number}: ${item.name}`}
                          accessibilityState={{ selected }}
                          style={styles.episodeInfo}
                        >
                          <Image source={still ? { uri: still } : require("@/assets/images/no-image.jpg")} style={styles.episodeImage} contentFit="cover" />
                          <View style={styles.episodeCopy}>
                            <Text style={styles.episodeNumber}>Episode {item.episode_number}{selected ? " · Selected" : ""}</Text>
                            <Text style={styles.episodeName}>{item.name || `Episode ${item.episode_number}`}</Text>
                            {!!metadata && <Text style={styles.episodeMetadata}>{metadata}</Text>}
                            <Text style={styles.episodeDescription}>{item.overview || "No episode description available."}</Text>
                          </View>
                        </SoundPressable>
                        <View style={styles.episodeActions}>
                          <MediaActionButton action="watch" onPress={() => openEpisode("watch", item.episode_number)} />
                          <MediaActionButton action="download" onPress={() => openEpisode("download", item.episode_number)} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.description}>No episodes are available for this season yet.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  panel: { width: "100%", maxWidth: 520, borderRadius: 16, overflow: "hidden", backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, minHeight: 56 },
  close: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24 },
  scroll: { flex: 1, minHeight: 0 },
  poster: { width: "100%", height: 260, backgroundColor: colors.card },
  body: { gap: 14, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 18 },
  seasonDetails: { gap: 10 },
  heading: { color: colors.text, fontFamily: fonts.heading, fontSize: 20, fontWeight: "600", flexShrink: 1 },
  description: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  metadata: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  episodeHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingTop: 4 },
  episodeList: { gap: 12 },
  episodeCard: { padding: 10, gap: 10, borderWidth: 1, borderColor: "rgba(255,121,73,0.22)", borderRadius: 12, backgroundColor: colors.card },
  episodeCardSelected: { borderColor: colors.accent },
  episodeInfo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  episodeImage: { width: 96, height: 116, borderRadius: 8, backgroundColor: colors.backgroundLight },
  episodeCopy: { flex: 1, minWidth: 0, gap: 4 },
  episodeNumber: { color: colors.accent, fontFamily: fonts.body, fontSize: 11, fontWeight: "700" },
  episodeName: { color: colors.text, fontFamily: fonts.heading, fontSize: 15, fontWeight: "600" },
  episodeMetadata: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  episodeDescription: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  episodeActions: { flexDirection: "row", gap: 8 },
  stateRow: { minHeight: 90, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
});
