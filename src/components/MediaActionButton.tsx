import { Text, View, StyleSheet } from "react-native";
import { Download, Play, Tv } from "lucide-react-native";
import { RadiantButton } from "./ui/base/radiant-button";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { playSound, type InteractionCue } from "@/lib/interactionSounds";

type MediaAction = "trailer" | "watch" | "download";
const actions = {
  trailer: { label: "Trailer", Icon: Play },
  watch: { label: "Watch", Icon: Tv },
  download: { label: "Download", Icon: Download },
};

export function MediaActionButton({ action, onPress, disabled = false, sound = "navigate" }: {
  action: MediaAction;
  onPress: () => void;
  disabled?: boolean;
  sound?: InteractionCue;
}) {
  const { label, Icon } = actions[action];
  const primary = action === "watch";
  const foreground = primary ? colors.card : colors.text;
  return (
    <View style={styles.cell}>
      <RadiantButton
        onPress={() => { playSound(sound, { emphasis: "strong" }); onPress(); }}
        accessibilityLabel={label}
        disabled={disabled}
        paddingHorizontal={8}
        paddingVertical={14}
        borderRadius={10}
        borderWidth={1.5}
        showDots={false}
        shimmerOpacity={primary ? 0.16 : 0.24}
        breathingEnabled={false}
        showGlow={!primary}
        glowBlur={12}
        theme={{ background: primary ? colors.accent : colors.backgroundLight, backgroundSubtle: colors.accent, foreground, highlight: colors.accent, highlightSubtle: colors.accent }}
      >
        <View style={styles.label}>
          <Icon size={17} color={foreground} fill={action === "trailer" ? foreground : "none"} />
          <Text style={{ color: foreground, fontFamily: fonts.body, fontSize: 13, fontWeight: "700" }}>{label}</Text>
        </View>
      </RadiantButton>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, minWidth: 0 },
  label: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
