import { useCallback } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import YoutubePlayer from "react-native-youtube-iframe";

import { useTvDetails } from "@/hooks/useTvDetails";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";

export default function TvTrailerScreen() {
      const { id } = useLocalSearchParams<{ id: string }>();
      const router = useRouter();

      const { width, height } = useWindowDimensions();

      const { data } = useTvDetails(id);
      const trailer = data?.trailer;

      const playerWidth = width;
      const playerHeight = width * (9 / 16);
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
                        onPress={() => router.back()}
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

                  {trailer ? (
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
