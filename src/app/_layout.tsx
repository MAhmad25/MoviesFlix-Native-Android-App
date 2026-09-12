import "../../global.css";

import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurTargetView } from "expo-blur";

import NavBar from "@/components/NavBar";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
      const blurTargetRef = useRef<View | null>(null);
      const pathname = usePathname();

      const [fontsLoaded] = useFonts({
            Astralaga: require("@/assets/fonts/astralaga.ttf"),
            Primary: require("@/assets/fonts/primary.ttf"),
      });

      useEffect(() => {
            if (fontsLoaded) {
                  SplashScreen.hideAsync();
            }
      }, [fontsLoaded]);

      if (!fontsLoaded) {
            return null;
      }

      // Fullscreen media routes
      const isMediaScreen = pathname.includes("/trailer") || pathname.includes("/watch");

      return (
            <SafeAreaProvider>
                  <View
                        style={{
                              flex: 1,
                              backgroundColor: colors.background,
                        }}
                  >
                        <StatusBar style="light" hidden={isMediaScreen} />

                        <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
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
                        </BlurTargetView>

                        {!isMediaScreen && <NavBar blurTarget={blurTargetRef} />}
                  </View>
            </SafeAreaProvider>
      );
}
