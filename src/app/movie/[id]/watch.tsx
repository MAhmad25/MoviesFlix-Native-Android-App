import { useLocalSearchParams } from "expo-router";
import StreamPlaceholder from "@/components/StreamPlaceholder";

/** Uses the existing movie player source. */
export default function MovieWatchScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      return <StreamPlaceholder type="movie" id={id} />;
}
