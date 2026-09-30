import { FlatList } from "react-native";
import Card from "./Card";
import type { MediaItem } from "@/lib/types";
import { playSound } from "@/lib/interactionSounds";

interface SliderProps {
      data: MediaItem[];
      type?: "movie" | "tv" | "person";
}

/** Ports ui/Slider.jsx — a horizontal row of Cards. Uses FlatList instead of the web app's framer-motion drag. */
export default function Slider({ data, type = "movie" }: SliderProps) {
      return <FlatList horizontal showsHorizontalScrollIndicator={false} onScrollBeginDrag={() => playSound("select")} data={data} keyExtractor={(item, index) => `${item.id}-${index}`} contentContainerStyle={{ gap: 12, paddingRight: 12 }} renderItem={({ item }) => <Card item={item} type={type} width={150} />} />;
}
