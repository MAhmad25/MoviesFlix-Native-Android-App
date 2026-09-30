import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SoundPressable } from "./SoundPressable";
import { MediaActionButton } from "./MediaActionButton";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { downloadUrl, openDownloadPage, type DownloadTarget } from "@/lib/downloads";

// Keep existing download/deep-link routes usable with the same browser handoff.
export default function DownloadScreen({ target }: { target: DownloadTarget }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen}>
      <SoundPressable sound="navigate" soundDirection="back" onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <ArrowLeft size={22} color={colors.text} />
      </SoundPressable>
      <View style={styles.content}>
        <Text style={styles.title}>Download with VidVault</Text>
        {target.type === "tv" && <Text style={styles.caption}>Season {target.season} · Episode {target.episode}</Text>}
        <Text style={styles.description}>Choose MP4 or MKV and your preferred quality in your browser. Your browser will handle saving the file.</Text>
        <Text selectable style={styles.caption}>{downloadUrl(target)}</Text>
        <View style={styles.action}>
          <MediaActionButton action="download" onPress={() => { void openDownloadPage(target); }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  back: { width: 48, height: 48, alignItems: "center", justifyContent: "center", margin: 8 },
  content: { flex: 1, justifyContent: "center", gap: 16, padding: 24 },
  title: { color: colors.text, fontFamily: fonts.heading, fontSize: 26, fontWeight: "600" },
  description: { color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  caption: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  action: { flexDirection: "row", marginTop: 8 },
});
