import { useLocalSearchParams } from "expo-router";
import StreamPlaceholder from "@/components/StreamPlaceholder";

/** Ports Components/pages/Stream.jsx for movies — see StreamPlaceholder.tsx for why this is a placeholder. */
export default function MovieWatchScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      return <StreamPlaceholder title={`Watch movie #${id}`} />;
}
