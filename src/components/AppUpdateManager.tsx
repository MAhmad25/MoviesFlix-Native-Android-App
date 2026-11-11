import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import type { DownloadProgressData, DownloadResumable } from "expo-file-system/legacy";
import Constants from "expo-constants";

import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { findAppUpdate, formatFileSize, type AppUpdate } from "@/lib/appUpdates";
import { playSound } from "@/lib/interactionSounds";

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const APK_MIME_TYPE = "application/vnd.android.package-archive";
const INSTALL_PACKAGE_ACTION = "android.intent.action.INSTALL_PACKAGE";

type AppUpdateManagerProps = {
  suppressPrompt?: boolean;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function cleanReleaseNotes(markdown: string) {
  return markdown
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*#+\s?/gm, "")
    .replace(/[>*_`]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function AppUpdateManager({ suppressPrompt = false }: AppUpdateManagerProps) {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [downloadedApkUri, setDownloadedApkUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installPermissionHelp, setInstallPermissionHelp] = useState(false);
  const lastCheckedAt = useRef(0);
  const checkInProgress = useRef(false);
  const dismissedVersion = useRef<string | null>(null);
  const downloadTask = useRef<DownloadResumable | null>(null);

  const checkForUpdate = useCallback(async (force = false) => {
    if (Platform.OS !== "android" || checkInProgress.current) return;
    if (!force && Date.now() - lastCheckedAt.current < CHECK_INTERVAL_MS) return;

    checkInProgress.current = true;
    lastCheckedAt.current = Date.now();

    try {
      const availableUpdate = await findAppUpdate();
      if (!availableUpdate || dismissedVersion.current === availableUpdate.version) return;

      setUpdate(availableUpdate);
      setIsVisible(true);
      setError(null);
    } catch {
      // Release checks are best-effort; offline or rate-limited checks stay quiet.
    } finally {
      checkInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    void checkForUpdate(true);
    const interval = setInterval(() => {
      if (AppState.currentState === "active") void checkForUpdate();
    }, CHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void checkForUpdate();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [checkForUpdate]);

  useEffect(() => {
    setDownloadedApkUri(null);
    setError(null);
    setInstallPermissionHelp(false);
  }, [update?.version]);

  const dismissUpdate = useCallback(() => {
    if (update) dismissedVersion.current = update.version;
    setIsVisible(false);
    setError(null);
  }, [update]);

  const openInstaller = useCallback(async (apkUri: string) => {
    if (Platform.OS !== "android") return;

    const contentUri = await FileSystem.getContentUriAsync(apkUri);
    const IntentLauncher = await import("expo-intent-launcher");
    await IntentLauncher.startActivityAsync(INSTALL_PACKAGE_ACTION, {
      data: contentUri,
      type: APK_MIME_TYPE,
      flags: 1,
    });
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!update || isDownloading) return;
    setError(null);
    setInstallPermissionHelp(false);

    if (downloadedApkUri) {
      try {
        await openInstaller(downloadedApkUri);
      } catch {
        setInstallPermissionHelp(true);
        setError("Android could not open the installer. Allow MoviesFlix to install unknown apps, then try again.");
      }
      return;
    }

    const cacheDirectory = FileSystem.cacheDirectory;
    if (!cacheDirectory) {
      setError("This device does not have an available download location.");
      return;
    }

    const filenameVersion = update.version.replace(/[^\w.-]/g, "_");
    const apkUri = `${cacheDirectory}moviesflix-update-${filenameVersion}.apk`;
    setIsDownloading(true);
    setProgress(0);

    try {
      await FileSystem.deleteAsync(apkUri, { idempotent: true });
      const task = FileSystem.createDownloadResumable(
        update.apkUrl,
        apkUri,
        { headers: { Accept: "application/octet-stream" } },
        (downloadProgress: DownloadProgressData) => {
          const expected = downloadProgress.totalBytesExpectedToWrite;
          if (expected > 0) {
            setProgress(Math.min(1, downloadProgress.totalBytesWritten / expected));
          }
        },
      );
      downloadTask.current = task;

      const result = await task.downloadAsync();
      downloadTask.current = null;
      if (!result) return;
      if (result.status < 200 || result.status >= 300) {
        throw new Error(`The APK download failed (HTTP ${result.status}).`);
      }

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (!fileInfo.exists || (fileInfo.size ?? 0) < 1) {
        throw new Error("The downloaded APK is empty. Check your connection and try again.");
      }
      if (update.apkSize > 0 && fileInfo.size !== update.apkSize) {
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        throw new Error("The APK download was incomplete. Please try again on a stable connection.");
      }

      setProgress(1);
      setDownloadedApkUri(result.uri);
      try {
        await openInstaller(result.uri);
      } catch {
        setInstallPermissionHelp(true);
        setError("The APK is ready, but Android blocked the installer. Allow MoviesFlix to install unknown apps, then tap Install update.");
      }
    } catch (downloadError) {
      setError(errorMessage(downloadError));
    } finally {
      downloadTask.current = null;
      setIsDownloading(false);
      setProgress(null);
    }
  }, [downloadedApkUri, isDownloading, openInstaller, update]);

  const cancelDownload = useCallback(async () => {
    const task = downloadTask.current;
    downloadTask.current = null;
    if (task) await task.cancelAsync().catch(() => undefined);
    setIsDownloading(false);
    setProgress(null);
  }, []);

  const openInstallPermissionSettings = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const androidConfig = Constants.expoConfig?.android as { package?: string } | undefined;
    const packageName = androidConfig?.package;

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES, {
        data: packageName ? `package:${packageName}` : undefined,
      });
      setError("Return here after allowing installs, then tap Install update.");
      setInstallPermissionHelp(false);
    } catch {
      setError("Open Android Settings → Apps → Special app access → Install unknown apps, then allow MoviesFlix.");
    }
  }, []);

  if (Platform.OS !== "android") return null;

  const releaseNotes = update ? cleanReleaseNotes(update.notes) : "";
  const actionLabel = isDownloading
    ? "Downloading update"
    : downloadedApkUri
      ? "Install update"
      : "Download update";

  return (
    <Modal
      visible={isVisible && update !== null && !suppressPrompt}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isDownloading ? () => void cancelDownload() : dismissUpdate}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.accentMark} />
          <Text style={styles.title}>A new MoviesFlix is ready</Text>
          <Text style={styles.version}>Version {update?.version}</Text>

          <View style={styles.releaseRow}>
            <Text style={styles.releaseTitle} numberOfLines={1}>{update?.title}</Text>
            <Text style={styles.fileSize}>{formatFileSize(update?.apkSize ?? 0)}</Text>
          </View>

          {releaseNotes ? (
            <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.notes}>{releaseNotes}</Text>
            </ScrollView>
          ) : (
            <Text style={styles.notesFallback}>Performance fixes and improvements.</Text>
          )}

          {isDownloading && (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((progress ?? 0) * 100)}%` }]} />
              </View>
              <View style={styles.progressMeta}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.progressLabel}>
                  {progress === null ? "Downloading APK…" : `${Math.round(progress * 100)}% downloaded`}
                </Text>
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {installPermissionHelp && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                playSound("navigate");
                void openInstallPermissionSettings();
              }}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.settingsLabel}>Open install settings</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={isDownloading}
            onPress={() => {
              playSound("select", { emphasis: "strong" });
              void downloadAndInstall();
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !isDownloading && styles.buttonPressed,
              isDownloading && styles.buttonDisabled,
            ]}
          >
            {isDownloading && <ActivityIndicator size="small" color={colors.card} />}
            <Text style={styles.primaryLabel}>{actionLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isDownloading}
            onPress={() => {
              playSound("close");
              dismissUpdate();
            }}
            style={({ pressed }) => [styles.laterButton, pressed && styles.laterPressed]}
          >
            <Text style={[styles.laterLabel, isDownloading && styles.disabledLabel]}>Not now</Text>
          </Pressable>

          <Text style={styles.systemNote}>Android will ask you to confirm the installation.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "rgba(8, 2, 1, 0.78)",
  },
  dialog: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 121, 73, 0.34)",
    backgroundColor: colors.card,
  },
  accentMark: {
    width: 34,
    height: 3,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  version: {
    marginTop: 4,
    color: colors.accent,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "700",
  },
  releaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
  releaseTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "600",
  },
  fileSize: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  notesScroll: {
    maxHeight: 112,
    marginTop: 12,
  },
  notes: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  notesFallback: {
    marginTop: 12,
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  progressSection: {
    marginTop: 18,
    gap: 8,
  },
  progressTrack: {
    height: 5,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#3b1a16",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  errorText: {
    marginTop: 14,
    color: "#ffb4a4",
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  settingsButton: {
    minHeight: 44,
    marginTop: 14,
    borderRadius: 10,
    borderColor: "rgba(255,121,73,0.5)",
  },
  settingsLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    marginTop: 20,
    borderRadius: 11,
    backgroundColor: colors.accent,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonDisabled: {
    opacity: 0.68,
  },
  primaryLabel: {
    color: colors.card,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "700",
  },
  laterButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    borderRadius: 10,
  },
  laterPressed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  laterLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  disabledLabel: {
    opacity: 0.5,
  },
  systemNote: {
    marginTop: 8,
    color: "#a8a29e",
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },
});

