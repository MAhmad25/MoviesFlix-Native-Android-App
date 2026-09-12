import type { RefObject } from "react";

import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter, useSegments } from "expo-router";
import { Film, Home, Search, Tv, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";

const NAV_ITEMS = [
      { href: "/", label: "Home", Icon: Home },
      { href: "/movies", label: "Movies", Icon: Film },
      { href: "/search", label: "Search", Icon: Search },
      { href: "/people", label: "Celebrity", Icon: Users },
      { href: "/tv", label: "TV Shows", Icon: Tv },
] as const;

interface NavBarProps {
      /**
       * Ref to the BlurTargetView wrapping app content
       */
      blurTarget: RefObject<View | null>;
}

export default function NavBar({ blurTarget }: NavBarProps) {
      const router = useRouter();
      const segments = useSegments();
      const insets = useSafeAreaInsets();

      const activeSegment = `/${segments[0] ?? ""}`;

      return (
            <View
                  className="absolute inset-x-0 z-20 items-center"
                  style={{
                        bottom: insets.bottom + 5,
                  }}
            >
                  <BlurView
                        intensity={40}
                        tint="dark"
                        blurMethod="dimezisBlurView"
                        blurTarget={blurTarget}
                        className="flex-row items-center gap-1 overflow-hidden rounded-full border p-2"
                        style={{
                              borderColor: "rgba(214,103,34,0.3)",
                        }}
                  >
                        {NAV_ITEMS.map(({ href, label, Icon }) => {
                              const isActive = href === "/" ? activeSegment === "/" : activeSegment === href;

                              return (
                                    <Pressable
                                          key={href}
                                          onPress={() => router.push(href as any)}
                                          className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
                                          style={{
                                                backgroundColor: isActive ? "rgba(254,254,254,0.12)" : "transparent",
                                          }}
                                    >
                                          <Icon size={18} color={isActive ? colors.accent : colors.text} />

                                          {isActive && (
                                                <Text
                                                      style={{
                                                            color: colors.text,
                                                            fontFamily: fonts.body,
                                                      }}
                                                      className="text-xs font-medium"
                                                >
                                                      {label}
                                                </Text>
                                          )}
                                    </Pressable>
                              );
                        })}
                  </BlurView>
            </View>
      );
}
