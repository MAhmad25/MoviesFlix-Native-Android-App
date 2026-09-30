import type { ViewStyle } from "react-native";
import type { ReactNode } from "react";

interface IShimmerEffect {
  readonly isLoading?: boolean;
  readonly shimmerColors?: string[];
  readonly duration?: number;
  /**
   * @deprecated
   */
  readonly className?: string;
  readonly style?: ViewStyle;
  readonly variant?: "shimmer" | "pulse";
  readonly direction?: ShimmerDirection;
  readonly preset?: ShimmerPreset;
  readonly opacity?: number;
  readonly children?: ReactNode;
}

interface IShimmerGroup {
  readonly isLoading?: boolean;
  readonly children: ReactNode;
  readonly preset?: ShimmerPreset;
  readonly shimmerColors?: string[];
  readonly duration?: number;
  readonly direction?: ShimmerDirection;
  readonly variant?: "shimmer" | "pulse";
  readonly opacity?: number;
}

type ShimmerDirection =
  | "leftToRight"
  | "rightToLeft"
  | "topToBottom"
  | "bottomToTop";

/**
 * "brand" is the app-specific preset (tuned to MoviesFlix's maroon/brown
 * theme, see constants/theme.ts) and is the default used across the app's
 * skeleton loaders. The rest are generic presets kept for reuse elsewhere.
 */
type ShimmerPreset = "brand" | "dark" | "light" | "twitter" | "neutral" | "custom";

interface IShimmerColorTheme {
  colors: string[];
  readonly backgroundColor?: string;
}

export type {
  IShimmerEffect,
  IShimmerGroup,
  ShimmerDirection,
  ShimmerPreset,
  IShimmerColorTheme,
};
