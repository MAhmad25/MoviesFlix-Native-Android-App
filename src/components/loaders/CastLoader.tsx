import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Loaders/CastLoader.jsx — inline loading state for sliders and infinite-scroll footers. */
export function CastLoader() {
  return (
    <View className="w-full items-center justify-center py-6">
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
