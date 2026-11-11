import React, { createContext, memo, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "heroui-native/skeleton";
import type { IShimmerEffect, IShimmerGroup } from "./Shimmer.types";
import { SHIMMER_PRESETS } from "./const";

interface ShimmerGroupSettings {
  isLoading: boolean;
  duration: number;
  variant: "shimmer" | "pulse";
  preset: NonNullable<IShimmerGroup["preset"]>;
  shimmerColors?: string[];
  opacity: number;
}

const ShimmerSettingsContext = createContext<ShimmerGroupSettings | null>(null);

function getHighlightColor(preset: IShimmerEffect["preset"], shimmerColors?: string[]) {
  const theme = SHIMMER_PRESETS[preset ?? "brand"] ?? SHIMMER_PRESETS.brand;
  return shimmerColors?.[2] ?? theme.colors[2] ?? colors.accent;
}

export const ShimmerEffect: React.FC<IShimmerEffect> = memo(function ShimmerEffect({
  isLoading,
  shimmerColors,
  duration,
  className,
  style,
  variant,
  preset,
  opacity,
  children,
}) {
  const group = useContext(ShimmerSettingsContext);
  const resolvedPreset = preset ?? group?.preset ?? "brand";
  const theme = SHIMMER_PRESETS[resolvedPreset] ?? SHIMMER_PRESETS.brand;
  const animationDuration = duration ?? group?.duration ?? 1300;
  const highlightColor = getHighlightColor(resolvedPreset, shimmerColors ?? group?.shimmerColors);
  const effectOpacity = opacity ?? group?.opacity ?? style?.opacity ?? 1;
  const backgroundColor = style?.backgroundColor ?? theme.backgroundColor ?? "rgba(15,0,0,1)";

  return (
    <View className={className} style={[styles.placeholder, style, { opacity: effectOpacity }]}>
      <Skeleton
        isLoading={isLoading ?? group?.isLoading ?? true}
        variant={variant ?? group?.variant ?? "shimmer"}
        style={[StyleSheet.absoluteFill, { backgroundColor }]}
        animation={{
          shimmer: { duration: animationDuration, highlightColor },
          pulse: { duration: animationDuration, minOpacity: 0.35, maxOpacity: 0.9 },
        }}
      >
        {children}
      </Skeleton>
    </View>
  );
});

export const ShimmerGroup: React.FC<IShimmerGroup> = memo(function ShimmerGroup({
  isLoading = true,
  children,
  preset = "brand",
  shimmerColors,
  duration = 1300,
  variant = "shimmer",
  opacity = 1,
}) {
  return (
    <ShimmerSettingsContext.Provider
      value={{
        isLoading,
        duration,
        variant,
        preset,
        shimmerColors,
        opacity,
      }}
    >
      {children}
    </ShimmerSettingsContext.Provider>
  );
});

export const Shimmer: React.FC<IShimmerEffect> = memo(function Shimmer(props) {
  return <ShimmerEffect {...props} />;
});

const colors = { accent: "#ff7949" } as const;
const styles = StyleSheet.create({ placeholder: { overflow: "hidden" } });
