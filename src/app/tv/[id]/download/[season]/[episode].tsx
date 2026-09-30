import { useLocalSearchParams } from "expo-router";
import DownloadScreen from "@/components/DownloadScreen";

export default function TvDownloadScreen() {
      const { id, season, episode } = useLocalSearchParams<{ id: string; season: string; episode: string }>();
      return <DownloadScreen target={{ type: "tv", id, season, episode }} />;
}
