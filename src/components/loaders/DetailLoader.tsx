import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Loaders/DetailLoader.jsx — shown on Movie/TV details screens while data loads. */
export function DetailLoader() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
