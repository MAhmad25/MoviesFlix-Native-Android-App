import { View, StyleSheet } from "react-native";
import { Download, Play, Tv } from "lucide-react-native";
import { Button } from "heroui-native/button";
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
      <Button
        variant={primary ? "primary" : "outline"}
        size="md"
        feedbackVariant="scale"
        background={null}
        isDisabled={disabled}
        onPress={() => { playSound(sound, { emphasis: "strong" }); onPress(); }}
        accessibilityLabel={label}
        style={[styles.button, primary ? styles.primaryButton : styles.secondaryButton]}
      >
        <View style={styles.label}>
          <Icon size={17} color={foreground} fill={action === "trailer" ? foreground : "none"} />
          <Button.Label style={{ color: foreground, fontFamily: fonts.body, fontSize: 13, fontWeight: "700" }}>{label}</Button.Label>
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, minWidth: 0 },
  button: { minHeight: 48, borderRadius: 14, paddingHorizontal: 8 },
  primaryButton: { backgroundColor: colors.accent, borderColor: colors.accent },
  secondaryButton: { borderColor: "rgba(255,121,73,0.5)" },
  label: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
