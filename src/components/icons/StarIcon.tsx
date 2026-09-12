import { Star } from "lucide-react-native";
import { colors } from "@/constants/theme";

/** Ports ui/Icons/StarIcon.jsx — now backed by lucide-react-native's Star icon (filled, to read as a rating glyph). */
export function StarIcon({ size = 16, color = colors.rating }: { size?: number; color?: string }) {
  return <Star size={size} color={color} fill={color} />;
}
