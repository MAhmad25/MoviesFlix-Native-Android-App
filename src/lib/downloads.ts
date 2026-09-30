import { Alert, Linking } from "react-native";
import { playSound } from "./interactionSounds";

export type DownloadTarget = { type: "movie" | "tv"; id: string; season?: string; episode?: string };
export type DownloadFormat = "MP4" | "MKV";

export function downloadUrl({ type, id, season, episode }: DownloadTarget) {
  const mediaId = encodeURIComponent(id);
  return type === "movie"
    ? `https://vidvault.to/movie/${mediaId}`
    : `https://vidvault.to/tv/${mediaId}/${encodeURIComponent(season ?? "1")}/${encodeURIComponent(episode ?? "1")}`;
}

// Open the title page in the system browser so VidVault owns the complete
// format/quality selection, redirects, cookies and browser download flow.
export async function openDownloadPage(target: DownloadTarget): Promise<boolean> {
  const url = downloadUrl(target);
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    playSound("error");
    Alert.alert("Couldn't open your browser", `Open this page in your browser to download:\n${url}`, [
      { text: "Close", style: "cancel" },
      { text: "Try again", onPress: () => { playSound("tap"); void openDownloadPage(target); } },
    ]);
    return false;
  }
}

// Keep VidVault's own download/quality UI. These shortcuts jump to its format sections,
// including when its asynchronous results arrive after the WebView has loaded.
export function focusDownloadFormat(format: DownloadFormat) {
  return `(function () {
    if (window.__moviesflixDownloadObserver) window.__moviesflixDownloadObserver.disconnect();
    var findSection = function () {
      var heading = Array.from(document.querySelectorAll('h4')).find(function (node) {
        return (node.textContent || '').trim().startsWith('${format}');
      });
      if (!heading) return false;
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };
    if (!findSection()) {
      var observer = new MutationObserver(function () { if (findSection()) observer.disconnect(); });
      observer.observe(document.body, { childList: true, subtree: true });
      window.__moviesflixDownloadObserver = observer;
      setTimeout(function () { observer.disconnect(); }, 20000);
    }
  })(); true;`;
}
