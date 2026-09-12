import { Text, View } from "react-native";
import { colors } from "@/constants/theme";
import { useTmdbList } from "@/hooks/useTmdbList";
import Slider from "./Slider";
import { CastLoader } from "./loaders/CastLoader";

interface HomeSectionProps {
      path: string;
      title: string;
}

/** Ports ui/HomeSections.jsx — a titled Slider fed by a single TMDB list endpoint (Home screen sections). */
export default function HomeSection({ path, title }: HomeSectionProps) {
      const { data, loading } = useTmdbList(path);

      if (loading) return <CastLoader />;
      if (data.length === 0) return null;

      return (
            <View className="w-full px-4">
                  <View className="mb-3 flex-row items-center justify-center gap-3">
                        <View className="h-px flex-1" style={{ backgroundColor: colors.muted }} />
                        <Text style={{ color: colors.text, borderColor: colors.muted }} className="rounded-3xl border px-4 py-2 text-lg">
                              {title}
                        </Text>
                        <View className="h-px flex-1" style={{ backgroundColor: colors.muted }} />
                  </View>
                  <Slider data={data} />
            </View>
      );
}
