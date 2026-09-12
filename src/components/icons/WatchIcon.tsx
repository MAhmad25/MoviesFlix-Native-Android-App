import { Play } from "lucide-react-native";

/** Ports ui/Icons/WatchIcon.jsx — now backed by lucide-react-native's Play icon (filled, to read as a solid play glyph). */
export function WatchIcon({ size = 16, color = "#a3e635" }: { size?: number; color?: string }) {
  return <Play size={size} color={color} fill={color} />;
}
