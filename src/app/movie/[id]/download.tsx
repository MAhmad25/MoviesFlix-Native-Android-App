import { useLocalSearchParams } from "expo-router";
import DownloadScreen from "@/components/DownloadScreen";

export default function MovieDownloadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DownloadScreen target={{ type: "movie", id }} />;
}
