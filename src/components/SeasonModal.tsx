import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { tmdbImage } from "@/lib/tmdb";
import { playSound } from "@/lib/interactionSounds";
import { openDownloadPage } from "@/lib/downloads";
import type { SeasonItem } from "@/lib/types";
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
  const [episode, setEpisode] = useState(1);
  const src = tmdbImage(season.poster_path, "w780");
  const totalEpisodes = season.episode_count || 0;
  const verticalPadding = 48;
  const panelHeight = Math.min(680, height - insets.top - insets.bottom - verticalPadding * 2);
  const dismiss = () => { playSound("close"); onClose(); };
  const openEpisode = (action: "watch" | "download") => {
    onClose();
    if (action === "download") {
      void openDownloadPage({ type: "tv", id: tvId, season: String(season.season_number), episode: String(episode) });
    } else {
      router.push(`/tv/${tvId}/watch/${season.season_number}/${episode}` as any);
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
            <SoundPressable sound="close" onPress={onClose} accessibilityRole="button" accessibilityLabel="Close season" style={styles.close}>
              <X size={22} color={colors.text} />
            </SoundPressable>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator nestedScrollEnabled>
            <Image source={src ?? require("@/assets/images/no-image.jpg")} style={styles.poster} contentFit="contain" />
            <View style={styles.body}>
              <View style={styles.metadata}>
                <Text style={styles.description}>Episodes: {totalEpisodes}</Text>
                <View style={styles.metadata}>
                  <StarIcon size={14} />
                  <Text style={styles.description}>{season.vote_average || "No rating"}</Text>
                </View>
              </View>
              {!!season.overview && <Text style={styles.description}>{season.overview}</Text>}
              <Text style={styles.heading}>Select episode</Text>
              {totalEpisodes > 0 ? <View style={styles.episodes}>
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((number) => (
                  <SoundPressable
                    key={number}
                    sound="select"
                    soundDirection={number < episode ? "back" : "forward"}
                    onPress={() => setEpisode(number)}
                    accessibilityRole="button"
                    accessibilityLabel={`Episode ${number}`}
                    accessibilityState={{ selected: episode === number }}
                    style={[styles.episode, { backgroundColor: number === episode ? colors.accent : colors.backgroundLight }]}
                  >
                    <Text style={{ color: number === episode ? colors.card : colors.text, fontFamily: fonts.body }}>{number}</Text>
                  </SoundPressable>
                ))}
              </View> : <Text style={styles.description}>No episodes available yet.</Text>}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Text style={[styles.description, { fontSize: 12 }]}>Season {season.season_number} · Episode {episode}</Text>
            <View style={styles.actions}>
              <MediaActionButton action="watch" disabled={!totalEpisodes} onPress={() => openEpisode("watch")} />
              <MediaActionButton action="download" disabled={!totalEpisodes} onPress={() => openEpisode("download")} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  panel: { width: "100%", maxWidth: 520, borderRadius: 16, overflow: "hidden", backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, minHeight: 56 },
  close: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1, minHeight: 0 },
  poster: { width: "100%", height: 340, backgroundColor: colors.card },
  body: { gap: 16, paddingHorizontal: 16, paddingVertical: 24 },
  heading: { color: colors.text, fontFamily: fonts.heading, fontSize: 20, fontWeight: "600", flexShrink: 1 },
  description: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  metadata: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  episodes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  episode: { minWidth: 44, height: 44, paddingHorizontal: 8, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  footer: { padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.backgroundLight },
  actions: { flexDirection: "row", gap: 12 },
});
