import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Loaders/PageLoader.jsx (PageSkeleton) — full-screen loading state for grid screens. */
export function PageLoader() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
