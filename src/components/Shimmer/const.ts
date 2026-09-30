import type { IShimmerColorTheme, ShimmerPreset } from "./Shimmer.types";

/**
 * "brand" is built from constants/theme.ts (colors.card -> colors.backgroundLight)
 * so the shimmer sweep reads as part of the app instead of a generic gray
 * overlay. It's the default preset for every skeleton loader in the app.
 */
const SHIMMER_PRESETS: Record<ShimmerPreset, IShimmerColorTheme> = {
  brand: {
    colors: [
      "rgba(15, 0, 0, 1)",
      "rgba(45, 16, 11, 1)",
      "rgba(83, 38, 27, 1)",
      "rgba(45, 16, 11, 1)",
      "rgba(15, 0, 0, 1)",
    ],
    backgroundColor: "rgba(15, 0, 0, 1)",
  },
  dark: {
    colors: [
      "rgba(28, 28, 28, 1)",
      "rgba(38, 38, 38, 1)",
      "rgba(58, 58, 58, 1)",
      "rgba(38, 38, 38, 1)",
      "rgba(28, 28, 28, 1)",
    ],
    backgroundColor: "rgba(28, 28, 28, 1)",
  },
  light: {
    colors: [
      "transparent",
      "rgba(255,255,255,0.3)",
      "rgba(255,255,255,1)",
      "rgba(255,255,255,0.2)",
      "transparent",
    ],
    backgroundColor: "rgb(59 59 59)",
  },
  twitter: {
    colors: [
      "rgba(47, 51, 54, 1)",
      "rgba(71, 75, 78, 1)",
      "rgba(47, 51, 54, 1)",
    ],
    backgroundColor: "rgba(32, 35, 39, 1)",
  },
  neutral: {
    colors: [
      "rgba(200, 200, 200, 1)",
      "rgba(235, 235, 235, 1)",
      "rgba(200, 200, 200, 1)",
    ],
    backgroundColor: "rgba(190, 190, 190, 1)",
  },
  custom: {
    colors: [
      "rgba(15, 15, 15, 0.1)",
      "rgba(255, 255, 255, 0.15)",
      "rgba(15, 15, 15, 0.1)",
    ],
  },
};

export { SHIMMER_PRESETS };
