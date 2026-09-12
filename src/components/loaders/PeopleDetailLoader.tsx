import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Loaders/PeopleDetailLoader.jsx — shown on the Person details screen while data loads. */
export function PeopleDetailLoader() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
