import { useLocalSearchParams } from "expo-router";
import StreamPlaceholder from "@/components/StreamPlaceholder";

/** Passes the selected season and episode to the existing TV player source. */
export default function TvWatchScreen() {
      const { id, season, episode } = useLocalSearchParams<{ id: string; season: string; episode: string }>();
      return <StreamPlaceholder type="tv" id={id} season={season} episode={episode} />;
}
