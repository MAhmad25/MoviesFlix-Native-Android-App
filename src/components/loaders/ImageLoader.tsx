import { View } from "react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Loaders/ImageLoader.jsx — a placeholder tile shown while a card image is still loading. */
export function ImageLoader() {
  return <View className="absolute inset-0" style={{ backgroundColor: colors.backgroundLight }} />;
}
