import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { WebView } from "react-native-webview";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";

export default function StreamScreen() {
      const { id, season, seasonID, category } = useLocalSearchParams<{
            id: string;
            season?: string;
            seasonID?: string;
            category?: string;
      }>();

      const router = useRouter();

      let url = "";

      if (category === "tv") {
            url = `https://cinemaos.tech/watch/tv/${id}?season=${season}&episode=${seasonID}`;
      } else {
            url = `https://cinemaos.tech/player/${id}`;
      }

      return (
            <View style={styles.container}>
                  <Pressable onPress={() => router.back()} style={styles.closeButton}>
                        <X size={22} color="black" />
                  </Pressable>

                  {url ? <WebView source={{ uri: url }} style={styles.webview} javaScriptEnabled domStorageEnabled allowsFullscreenVideo allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} originWhitelist={["*"]} startInLoadingState /> : <Text style={styles.error}>Stream not found.</Text>}
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
