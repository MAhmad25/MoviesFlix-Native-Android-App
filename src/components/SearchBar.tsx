import { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, useAnimatedProps } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Search, X } from "lucide-react-native";
import type { SearchBarProps } from "./SearchBar.types";
import { scheduleOnRN } from "react-native-worklets";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { playSound } from "@/lib/interactionSounds";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const { width: screenWidth } = Dimensions.get("window");

export const SearchBar = ({ placeholder = "Search", onSearch, onClear, style, renderLeadingIcons, renderTrailingIcons, onSearchDone = () => {}, onSearchMount = () => {}, containerWidth, focusedWidth, cancelButtonWidth = 68, enableWidthAnimation = true, centerWhenUnfocused = true, ...props }: SearchBarProps) => {
      const [query, setQuery] = useState("");
      const [, setIsFocused] = useState(false);
      const [containerDimensions, setContainerDimensions] = useState({ width: 0 });
      const inputRef = useRef<TextInput>(null);

      const focusProgress = useSharedValue(0);
      const clearButtonScale = useSharedValue(0);
      const clearButtonOpacity = useSharedValue(0);
      const textOpacity = useSharedValue(1);
      const textScale = useSharedValue(1);
      const textTranslateY = useSharedValue(0);
      const currentWidth = useSharedValue(containerWidth || screenWidth - 32);

      useEffect(() => {
            if (containerWidth) {
                  currentWidth.set(containerWidth);
            } else if (containerDimensions.width > 0) {
                  currentWidth.set(containerDimensions.width);
            }
      }, [containerWidth, containerDimensions.width, currentWidth]);

      const animatedContainerStyle = useAnimatedStyle(() => {
            if (!enableWidthAnimation) {
                  return { width: currentWidth.value };
            }

            const searchBarWidth = interpolate(focusProgress.value, [0, 1], [currentWidth.value, focusedWidth || currentWidth.value - cancelButtonWidth]);
            return { width: searchBarWidth };
      });

      const animatedBlurViewProps = useAnimatedProps(() => {
            const blurAmount = withSpring(interpolate(focusProgress.value, [0, 0.3, 0.5, 1], [0, 20, 30, 0]));
            return {
                  intensity: blurAmount,
            };
      });

      const animatedSearchContentStyle = useAnimatedStyle(() => {
            const justifyContent = focusProgress.value === 0 && centerWhenUnfocused ? "center" : "flex-start";
            const paddingLeft = interpolate(focusProgress.value, [0, 1], [0, 12]);
            return { justifyContent, paddingLeft };
      });

      const animatedInputWrapperStyle = useAnimatedStyle(() => {
            if (!centerWhenUnfocused) {
                  return { transform: [{ translateX: 0 }] };
            }

            const iconAndPadding = 90;
            const _centerOffSetValue = props?.textCenterOffset ?? 2.5;
            const centerOffset = (currentWidth.value - iconAndPadding * _centerOffSetValue) / 2 - 10;

            const translateX = interpolate(focusProgress.value, [0, 1], [centerOffset, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return {
                  transform: [{ translateX }],
            };
      });

      const animatedIconStyle = useAnimatedStyle(() => {
            if (!centerWhenUnfocused) {
                  return { transform: [{ translateX: 0 }] };
            }
            const _iconCenterValue = props?.iconCenterOffset ?? 2.5;
            const centerOffset = (currentWidth.value - 36 * _iconCenterValue) / 2 - 10;
            const translateX = interpolate(focusProgress.value, [0, 1], [centerOffset, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return {
                  transform: [{ translateX }],
            };
      });

      const animatedClearButtonStyle = useAnimatedStyle(() => ({
            transform: [{ scale: clearButtonScale.value }],
            opacity: clearButtonOpacity.value,
      }));

      const animatedInputStyle = useAnimatedStyle(() => {
            return {
                  opacity: textOpacity.value,
                  transform: [{ scale: textScale.value }, { translateY: textTranslateY.value }],
            };
      });

      const handleFocus = () => {
            playSound("open");
            onSearchMount();
            setIsFocused(true);
            focusProgress.set(withSpring(1, {
                  damping: 20,
                  stiffness: 200,
                  mass: 0.8,
                  velocity: 0.5,
                  duration: 300 as any,
            }));
      };

      const handleCancel = () => {
            inputRef.current?.blur();
            setIsFocused(false);
            setQuery("");
            onSearchDone();
            onClear?.();
            focusProgress.set(withTiming(0));
            clearButtonScale.set(withTiming(0));
            clearButtonOpacity.set(withTiming(0, { duration: 200 }));
      };

      const handleBlur = () => {
            if (!query) handleCancel();
      };

      const handleChangeText = (text: string) => {
            if (text !== query) playSound("type", { key: text.length < query.length ? "delete" : text.endsWith(" ") ? "space" : "printable" });
            setQuery(text);
            if (text.length > 0) {
                  clearButtonScale.set(withSpring(1));
                  clearButtonOpacity.set(withTiming(1, { duration: 200 }));
                  textOpacity.set(withTiming(1, { duration: 150 }));
            } else {
                  clearButtonScale.set(withSpring(0));
                  clearButtonOpacity.set(withTiming(0, { duration: 200 }));
            }

            onSearch?.(text);
      };

      const handleClear = () => {
            playSound("tap");
            textOpacity.set(withTiming(0, { duration: 150 }, () => {
                  scheduleOnRN(setQuery, "");
                  textOpacity.set(withTiming(1, { duration: 150 }));
            }));

            clearButtonScale.set(withTiming(0));
            clearButtonOpacity.set(withTiming(0, { duration: 200 }));
            onClear?.();
            inputRef.current?.focus();
      };

      const handleLayout = (event: any) => {
            const { width } = event.nativeEvent.layout;
            setContainerDimensions({ width });
      };

      const animatedAndroidBlurStylez = useAnimatedStyle(() => ({
            filter: [
                  {
                        blur: withSpring(interpolate(focusProgress.value, [0, 0.3, 0.5, 1], [0, 10, 20, 0])),
                  },
            ],
      }));

      return (
            <View style={[styles.container, style]} onLayout={handleLayout}>
                  <View style={styles.searchRow}>
                        <AnimatedView style={[styles.searchBarContainer, animatedContainerStyle, Platform.OS === "android" && animatedAndroidBlurStylez]}>
                              <BlurView intensity={15} tint="dark" style={styles.blurContainer}>
                                    <View style={styles.searchContainer}>
                                          <AnimatedView style={[styles.searchContent, animatedSearchContentStyle]}>
                                                <AnimatedView style={[styles.searchIconContainer, animatedIconStyle, props?.iconStyle]}>{renderLeadingIcons ? renderLeadingIcons() : <Search size={18} color={colors.muted} strokeWidth={2} />}</AnimatedView>
                                                <AnimatedView style={[{ flex: 1 }, animatedInputWrapperStyle]}>
                                                      <AnimatedTextInput ref={inputRef} style={[styles.input, animatedInputStyle, props?.inputStyle]} cursorColor={props?.tint ?? colors.accent} placeholder={placeholder} placeholderTextColor={colors.muted} value={query} onChangeText={handleChangeText} onFocus={handleFocus} onBlur={handleBlur} onSubmitEditing={() => playSound("type", { key: "enter" })} returnKeyType="search" autoCorrect={false} className={"ml-10"} autoCapitalize="none" selectionColor={props?.tint ?? colors.accent} {...props} />
                                                </AnimatedView>

                                                {Platform.OS === "ios" && (
                                                      <AnimatedBlurView
                                                            tint="dark"
                                                            style={[
                                                                  StyleSheet.absoluteFill,
                                                                  {
                                                                        overflow: "hidden",
                                                                  },
                                                            ]}
                                                            animatedProps={animatedBlurViewProps}
                                                            pointerEvents={"none"}
                                                      />
                                                )}
                                                {query.length > 0 && (
                                                      <AnimatedTouchable onPress={handleClear} style={[styles.clearButton, animatedClearButtonStyle]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                            {renderTrailingIcons ? renderTrailingIcons() : <X size={14} color={colors.text} strokeWidth={2.5} />}
                                                      </AnimatedTouchable>
                                                )}
                                          </AnimatedView>
                                    </View>
                              </BlurView>
                        </AnimatedView>
                  </View>
            </View>
      );
};

const styles = StyleSheet.create({
      container: {
            alignItems: "center",
            justifyContent: "center",
      },
      searchRow: {
            flexDirection: "row",
            alignItems: "center",
      },
      searchBarContainer: {},
      blurContainer: {
            borderRadius: 999,
            overflow: "hidden",
      },
      searchContainer: {
            backgroundColor: "rgba(255, 121, 73, 0.08)",
            borderWidth: 1,
            borderColor: "rgba(214, 103, 34, 0.35)",
            borderRadius: 999,
            minHeight: 35,
            justifyContent: "center",
      },
      searchContent: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            position: "relative",
            paddingVertical: Platform.OS === "ios" ? 10 : 5,
      },
      searchIconContainer: {
            width: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: -100,
      },
      input: {
            width: "100%",
            color: colors.text,
            fontSize: 16,
            fontFamily: fonts.body,
            fontWeight: "400",
            includeFontPadding: false,
            textAlignVertical: "center",
            minHeight: 24,

            textAlign: "left",
      },
      clearButton: {
            width: 20,
            height: 20,
            borderRadius: 999,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 6,
            backgroundColor: "rgba(254, 254, 254, 0.14)",
      },
});
