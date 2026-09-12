import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { tmdbImage } from "@/lib/tmdb";
import type { CastMember } from "@/lib/types";

/** Ports ui/Exclude.jsx — a round cast/crew avatar chip linking to the person's details. */
export default function CastChip({ member }: { member: CastMember }) {
      const router = useRouter();
      const src = tmdbImage(member.profile_path, "w300");
      const name = (member.name || member.original_name || "").slice(0, 14);
      const role = (member.character || member.job || "").slice(0, 18);

      return (
            <Pressable onPress={() => router.push(`/person/${member.id}` as any)} className="w-24 shrink-0 items-center">
                  <View className="h-24 w-24 overflow-hidden rounded-full" style={{ backgroundColor: colors.card }}>
                        <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
                  </View>
                  <View className="mt-2 items-center">
                        <Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.body }} className="text-xs">
                              {name}
                        </Text>
                        {!!role && (
                              <Text numberOfLines={1} style={{ color: colors.muted, fontFamily: fonts.body }} className="text-[10px]">
                                    as {role}
                              </Text>
                        )}
                  </View>
            </Pressable>
      );
}
