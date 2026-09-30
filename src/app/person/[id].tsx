import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { StarIcon } from "@/components/icons/StarIcon";
import { PeopleDetailLoader } from "@/components/loaders/PeopleDetailLoader";
import ViewCard from "@/components/ViewCard";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { usePersonDetails } from "@/hooks/usePersonDetails";
import { tmdbImage } from "@/lib/tmdb";

/** Ports Components/pages/People/PeopleDetails.jsx. */
export default function PersonDetailsScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      const router = useRouter();
      const { data, loading } = usePersonDetails(id);

      if (loading || !data) return <PeopleDetailLoader />;

      const { detail, credits } = data;
      const src = tmdbImage(detail.profile_path, "original");
      const notableRoles = credits.cast.filter((item) => (item.vote_average ?? 0) >= 7).slice(0, 8);

      return (
            <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 100, paddingTop: 56 }}>
                  <Pressable sound="navigate" soundDirection="back" onPress={() => router.back()} className="absolute left-5 top-14 z-10 rounded-full bg-white/30 p-2">
                        <ArrowLeft size={18} color="black" />
                  </Pressable>
                  <View className="items-center gap-2 px-4">
                        <View className="h-40 w-32 overflow-hidden rounded-2xl" style={{ backgroundColor: colors.card }}>
                              <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        </View>
                        <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="mt-2 text-2xl font-semibold">
                              {detail.name}
                        </Text>
                        {!!detail.popularity && (
                              <View className="flex-row items-center gap-1.5">
                                    <StarIcon size={16} />
                                    <Text style={{ color: colors.text, fontFamily: fonts.body }} className="text-lg">
                                          {detail.popularity.toFixed(0)}
                                    </Text>
                              </View>
                        )}
                        <View className="flex-row flex-wrap justify-center gap-2">
                              {notableRoles.map((item) => (
                                    <Text key={item.id} style={{ color: colors.text, backgroundColor: "rgba(254,254,254,0.15)", fontFamily: fonts.body }} className="rounded-full px-3 py-1 text-xs">
                                          {(item.title || item.original_title || item.name || "").slice(0, 20)}
                                    </Text>
                              ))}
                        </View>
                  </View>

                  <View className="mt-6 gap-2 px-4">
                        <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-2xl">
                              Personal Info:
                        </Text>
                        {!!detail.birthday && (
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }}>
                                    Born: <Text style={{ color: colors.text, fontFamily: fonts.body }}>{detail.birthday.split("-")[0]}</Text>
                              </Text>
                        )}
                        {!!detail.place_of_birth && (
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }}>
                                    From: <Text style={{ color: colors.text, fontFamily: fonts.body }}>{detail.place_of_birth}</Text>
                              </Text>
                        )}
                        {!!detail.known_for_department && (
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }}>
                                    Known For: <Text style={{ color: colors.text, fontFamily: fonts.body }}>{detail.known_for_department}</Text>
                              </Text>
                        )}
                  </View>

                  {!!detail.biography && (
                        <View className="mt-4 gap-2 px-4">
                              <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-xl font-semibold">
                                    Biography:
                              </Text>
                              <Text style={{ color: colors.muted, fontFamily: fonts.body }}>{detail.biography}</Text>
                        </View>
                  )}

                  <View className="mt-4 gap-2 px-4">
                        <Text style={{ color: colors.text, fontFamily: fonts.heading }} className="text-xl font-semibold">
                              Recent Projects:
                        </Text>
                        {credits.cast.length > 0 ? (
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                    {credits.cast
                                          .slice()
                                          .reverse()
                                          .slice(0, 20)
                                          .map((item) => (
                                                <ViewCard key={item.id} item={item} />
                                          ))}
                              </ScrollView>
                        ) : (
                              <Text style={{ color: colors.text, fontFamily: fonts.body }}>There are no recent projects.</Text>
                        )}
                  </View>
            </ScrollView>
      );
}
