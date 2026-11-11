import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Button } from "heroui-native/button";
import { WebView } from "react-native-webview";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { handleWebViewSound, webviewSoundScript } from "@/lib/webviewSounds";
import { playSound } from "@/lib/interactionSounds";

const STREAM_ORIGINS = ["*"];

export default function StreamScreen({ id, season, episode, type }: {
  id: string;
  season?: string;
  episode?: string;
  type: "movie" | "tv";
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webViewAttempt, setWebViewAttempt] = useState(0);
  const hasLoadedOnce = useRef(false);

  const url = type === "tv"
    ? `https://cinemaos.tech/watch/tv/${id}?season=${season}&episode=${episode}`
    : `https://cinemaos.tech/player/${id}`;
  const source = useMemo(() => ({ uri: url }), [url]);

  const retry = useCallback(() => {
    hasLoadedOnce.current = false;
    setHasError(false);
    setIsLoading(true);
    setWebViewAttempt((attempt) => attempt + 1);
  }, []);
  const handleLoadStart = useCallback(() => {
    // Keep the player visible if the embedded video iframe navigates again.
    if (!hasLoadedOnce.current) {
      setHasError(false);
      setIsLoading(true);
    }
  }, []);
  const handleLoadEnd = useCallback(() => {
    hasLoadedOnce.current = true;
    setIsLoading(false);
  }, []);
  const handleLoadError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        key={webViewAttempt}
        source={source}
        style={styles.webview}
        injectedJavaScript={webviewSoundScript}
        injectedJavaScriptForMainFrameOnly
        onMessage={handleWebViewSound}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleLoadError}
        onRenderProcessGone={retry}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        cacheMode="LOAD_DEFAULT"
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        androidLayerType="hardware"
        originWhitelist={STREAM_ORIGINS}
      />

      {isLoading && !hasError && (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.statusText}>Opening stream…</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>The stream could not be loaded.</Text>
          <Button
            variant="primary"
            size="sm"
            feedbackVariant="scale"
            onPress={() => { playSound("tap"); retry(); }}
            style={styles.retryButton}
          >
            <Button.Label style={styles.retryLabel}>Try again</Button.Label>
          </Button>
        </View>
      )}

      <Button
        variant="secondary"
        size="sm"
        isIconOnly
        feedbackVariant="scale"
        background={null}
        onPress={() => {
          playSound("navigate", { direction: "back" });
          router.back();
        }}
        accessibilityLabel="Close stream"
        style={styles.closeButton}
      >
        <X size={20} color={colors.text} />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080706" },
  webview: { flex: 1, width: "100%", backgroundColor: "#080706" },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#080706",
  },
  statusText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  errorPanel: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: "rgba(8,7,6,0.96)",
  },
  errorText: { color: colors.text, fontFamily: fonts.body, fontSize: 15, textAlign: "center" },
  retryLabel: { color: colors.card, fontFamily: fonts.body, fontWeight: "700" },
  retryButton: { backgroundColor: colors.accent, borderColor: colors.accent },
  closeButton: {
    position: "absolute",
    zIndex: 3,
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    backgroundColor: "rgba(15,0,0,0.78)",
  },
});
