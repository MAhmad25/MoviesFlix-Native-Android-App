import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { Shimmer } from "@/components/Shimmer";

export default function MovieTrailerScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      const router = useRouter();

      const { width, height } = useWindowDimensions();

      const { data, loading } = useMovieDetails(id);
      const trailer = data?.trailer;
      /*
       * 16:9 YouTube player
       */
      const playerWidth = width;
      const playerHeight = width * (9 / 16);

      /*
       * Prevent the player from becoming taller than the
       * available landscape screen.
       */
      const finalHeight = Math.min(playerHeight, height);

      return (
            <View
                  style={{
                        flex: 1,
                        backgroundColor: "black",
                        alignItems: "center",
                        justifyContent: "center",
                  }}
            >
                  <Pressable
                        sound="navigate" soundDirection="back" onPress={() => router.back()}
                        style={{
                              position: "absolute",
                              right: 16,
                              top: 20,
                              zIndex: 10,
                              borderRadius: 999,
                              backgroundColor: "rgba(255,255,255,0.3)",
                              padding: 8,
                        }}
                  >
                        <X size={18} color="black" />
                  </Pressable>

                  {loading ? (
                        <Shimmer style={{ width: playerWidth, height: finalHeight }} />
                  ) : trailer ? (
                        <YoutubePlayer
                              width={playerWidth}
                              height={finalHeight}
                              videoId={trailer.key}
                              play={true}
                              initialPlayerParams={{
                                    controls: false,
                                    modestbranding: false,
                                    rel: false,
                              }}
                        />
                  ) : (
                        <Text
                              style={{
                                    color: colors.text,
                                    fontFamily: fonts.body,
                              }}
                        >
                              Trailer not found.
                        </Text>
                  )}
            </View>
      );
}
