import { useLocalSearchParams } from "expo-router";
import StreamPlaceholder from "@/components/StreamPlaceholder";

/** Ports Components/pages/Stream.jsx for TV episodes — see StreamPlaceholder.tsx for why this is a placeholder. */
export default function TvWatchScreen() {
  const { season, episode } = useLocalSearchParams<{ id: string; season: string; episode: string }>();
  return <StreamPlaceholder title={`Watch S${season}E${episode}`} />;
}
