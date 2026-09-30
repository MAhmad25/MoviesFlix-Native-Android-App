import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { WebView } from "react-native-webview";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { handleWebViewSound, webviewSoundScript } from "@/lib/webviewSounds";

export default function StreamScreen({ id, season, episode, type }: {
            id: string;
            season?: string;
            episode?: string;
            type: "movie" | "tv";
      }) {

      const router = useRouter();

      let url = "";

      if (type === "tv") {
            url = `https://cinemaos.tech/watch/tv/${id}?season=${season}&episode=${episode}`;
      } else {
            url = `https://cinemaos.tech/player/${id}`;
      }

      return (
            <View style={styles.container}>
                  <Pressable sound="navigate" soundDirection="back" onPress={() => router.back()} style={styles.closeButton}>
                        <X size={22} color="black" />
                  </Pressable>

                  {url ? <WebView source={{ uri: url }} style={styles.webview} injectedJavaScript={webviewSoundScript} onMessage={handleWebViewSound} javaScriptEnabled domStorageEnabled allowsFullscreenVideo allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} originWhitelist={["*"]} startInLoadingState /> : <Text style={styles.error}>Stream not found.</Text>}
            </View>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: "#14120b",
      },

      webview: {
            flex: 1,
            width: "95%",
            alignSelf: "center",
            marginVertical: "2.5%",
      },

      closeButton: {
            position: "absolute",
            right: 12,
            top: 20,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.3)",
            padding: 8,
            borderRadius: 999,
      },

      error: {
            color: colors.text,
            fontFamily: fonts.body,
            textAlign: "center",
      },
});
