import "../../global.css";

import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Image, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import NavBar from "@/components/NavBar";
import { colors } from "@/constants/theme";
import { SoundProvider } from "@/components/SoundProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
      const pathname = usePathname();

      const [fontsLoaded] = useFonts({
            Astralaga: require("@/assets/fonts/astralaga.ttf"),
            Primary: require("@/assets/fonts/primary.ttf"),
      });

      useEffect(() => {
            SplashScreen.hideAsync();
      }, []);

      if (!fontsLoaded) {
            return (
                  <View
                        style={{
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: colors.background,
                        }}
                  >
                        <StatusBar hidden />
                        <Image source={require("@/assets/images/icon.png")} resizeMode="contain" style={{ width: 180, height: 180 }} />
                        <Text
                              style={{
                                    marginTop: 24,
                                    color: colors.text,
                                    fontSize: 30,
                                    fontWeight: "700",
                              }}
                        >
                              MoviesFlix
                        </Text>
                  </View>
            );
      }

      // Fullscreen media routes
      const isMediaScreen = pathname.includes("/trailer") || pathname.includes("/watch");
      const isDownloadScreen = pathname.includes("/download");

      return (
            <SafeAreaProvider>
                  <SoundProvider>
                        <GestureHandlerRootView
                              style={{
                                    flex: 1,
                                    backgroundColor: colors.background,
                              }}
                        >
                              <StatusBar hidden />

                              <View style={{ flex: 1 }}>
                                    <Stack
                                          screenOptions={{
                                                headerShown: false,
                                                statusBarHidden: true,
                                                contentStyle: {
                                                      backgroundColor: colors.background,
                                                },
                                          }}
                                    >
                                          <Stack.Screen name="index" />
                                          <Stack.Screen name="movies" />
                                          <Stack.Screen name="tv" />
                                          <Stack.Screen name="people" />
                                          <Stack.Screen name="search" />

                                          <Stack.Screen name="movie/[id]/index" />
                                          <Stack.Screen name="movie/[id]/download" />

                                          <Stack.Screen
                                                name="movie/[id]/trailer"
                                                options={{
                                                      presentation: "fullScreenModal",
                                                      orientation: "landscape",
                                                      navigationBarHidden: true,
                                                      statusBarHidden: true,
                                                }}
                                          />

                                          <Stack.Screen
                                                name="movie/[id]/watch"
                                                options={{
                                                      presentation: "fullScreenModal",
                                                      orientation: "landscape",
                                                      navigationBarHidden: true,
                                                      statusBarHidden: true,
                                                }}
                                          />

                                          <Stack.Screen name="tv/[id]/index" />
                                          <Stack.Screen name="tv/[id]/download/[season]/[episode]" />

                                          <Stack.Screen
                                                name="tv/[id]/trailer"
                                                options={{
                                                      presentation: "fullScreenModal",
                                                      orientation: "landscape",
                                                      navigationBarHidden: true,
                                                      statusBarHidden: true,
                                                }}
                                          />

                                          <Stack.Screen
                                                name="tv/[id]/watch/[season]/[episode]"
                                                options={{
                                                      presentation: "fullScreenModal",
                                                      orientation: "landscape",
                                                      navigationBarHidden: true,
                                                      statusBarHidden: true,
                                                }}
                                          />

                                          <Stack.Screen name="person/[id]" />
                                    </Stack>
                              </View>

                              {!isMediaScreen && !isDownloadScreen && <NavBar />}
                        </GestureHandlerRootView>
                  </SoundProvider>
            </SafeAreaProvider>
      );
}
