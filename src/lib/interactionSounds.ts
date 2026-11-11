import { AppState } from "react-native";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import type { SoundName, PlayOptions } from "cuelume";

const sources = {
      tap: require("@/assets/sounds/tap.wav"),
      select: require("@/assets/sounds/select.wav"),
      "select-back": require("@/assets/sounds/select-back.wav"),
      toggle: require("@/assets/sounds/toggle.wav"),
      open: require("@/assets/sounds/open.wav"),
      "open-strong": require("@/assets/sounds/open-strong.wav"),
      close: require("@/assets/sounds/close.wav"),
      navigate: require("@/assets/sounds/navigate.wav"),
      "navigate-strong": require("@/assets/sounds/navigate-strong.wav"),
      "navigate-back": require("@/assets/sounds/navigate-back.wav"),
      error: require("@/assets/sounds/error.wav"),
      type: require("@/assets/sounds/type.wav"),
      "type-delete": require("@/assets/sounds/type-delete.wav"),
      "type-enter": require("@/assets/sounds/type-enter.wav"),
};

export type InteractionCue = Extract<SoundName, "tap" | "select" | "toggle" | "open" | "close" | "navigate" | "error" | "type">;
export type InteractionOptions = Pick<PlayOptions, "direction" | "emphasis" | "key">;
let players = new Map<keyof typeof sources, AudioPlayer>();
let generation = 0;
const lastPlayedAt = new Map<keyof typeof sources, number>();
const requests = new Map<keyof typeof sources, number>();
const waitingLoads = new Map<keyof typeof sources, () => void>();

export function initializeSounds() {
      // Sounds stay enabled, including in silent mode, and mix with trailer/player audio.
      void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers", shouldPlayInBackground: false }).catch(() => {});
      for (const [name, source] of Object.entries(sources)) {
            const player = createAudioPlayer(source, { keepAudioSessionActive: true });
            player.volume = name.startsWith("type") ? 0.3 : 0.42;
            players.set(name as keyof typeof sources, player);
      }
      return () => {
            generation++;
            waitingLoads.forEach((cancel) => cancel());
            waitingLoads.clear();
            players.forEach((player) => player.remove());
            players = new Map();
            lastPlayedAt.clear();
            requests.clear();
      };
}

export function playSound(cue: InteractionCue = "tap", options?: InteractionOptions) {
      if (AppState.currentState && AppState.currentState !== "active") return;
      const now = Date.now();
      const name: keyof typeof sources = cue === "type" ? (options?.key === "delete" ? "type-delete" : options?.key === "enter" ? "type-enter" : "type") : cue === "navigate" && options?.direction === "back" ? "navigate-back" : cue === "select" && options?.direction === "back" ? "select-back" : options?.emphasis === "strong" && (cue === "navigate" || cue === "open") ? `${cue}-strong` : cue;
      if (cue === "type" && now - (lastPlayedAt.get(name) ?? 0) < 45) return;
      const player = players.get(name);
      if (!player) return;
      lastPlayedAt.set(name, now);
      const request = (requests.get(name) ?? 0) + 1;
      requests.set(name, request);
      const currentGeneration = generation;
      const isCurrent = () => currentGeneration === generation && requests.get(name) === request && (!AppState.currentState || AppState.currentState === "active");
      const replay = () => {
            // Android's isLoaded getter is false at STATE_ENDED. Rewind finished
            // clips instead of treating them as unloaded and silently losing the tap.
            void player
                  .seekTo(0)
                  .then(() => {
                        if (isCurrent()) player.play();
                  })
                  .catch(() => {});
      };
      waitingLoads.get(name)?.();
      if (player.currentStatus.isLoaded) {
            replay();
      } else {
            // Keep the first tap while a bundled cue loads. Cancel stale/background
            // playback so opening the browser cannot cause a delayed sound on return.
            const subscription = player.addListener("playbackStatusUpdate", (status) => {
                  if (!status.isLoaded) return;
                  cancel();
                  if (isCurrent()) replay();
            });
            const timer = setTimeout(() => cancel(), 1500);
            const cancel = () => {
                  subscription.remove();
                  clearTimeout(timer);
                  waitingLoads.delete(name);
            };
            waitingLoads.set(name, cancel);
      }
}
