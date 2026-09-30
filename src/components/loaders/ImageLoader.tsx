import { Shimmer } from "@/components/Shimmer";

interface ImageLoaderProps {
  /** Defaults to true so it can be dropped in unconditionally behind an
   * <Image>; pass `isLoading={false}` once the real image has resolved. */
  isLoading?: boolean;
}

/**
 * Ports ui/Loaders/ImageLoader.jsx — an absolute-fill shimmer tile meant to
 * sit behind any <Image>/expo-image while its source is still loading
 * (e.g. via onLoadStart/onLoad), instead of a flat placeholder color.
 */
export function ImageLoader({ isLoading = true }: ImageLoaderProps) {
  return <Shimmer isLoading={isLoading} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />;
}
