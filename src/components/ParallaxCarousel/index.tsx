import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type {
  ParallaxCarouselItem,
  ParallaxCarouselItemProps,
  ParallaxCarouselProps,
  ParallaxCarouselRef,
} from "./types";
import { scheduleOnRN } from "react-native-worklets";
import { playSound } from "@/lib/interactionSounds";

const { width, height } = Dimensions.get("window");

// expo-image (not RN's core Image) to match caching behavior used everywhere
// else in the app (Card, HeaderCarousel, search results, ...).
const AnimatedImage = Animated.createAnimatedComponent(Image);

const ParallaxCarouselItemComponent = <ItemT extends ParallaxCarouselItem>({
  item,
  index,
  scrollX,
  renderItem,
  itemWidth,
  itemHeight,
  spacing,
  parallaxIntensity,
}: ParallaxCarouselItemProps<ItemT>) => {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const offset = index * itemWidth;
    const translateX = interpolate(
      scrollX.value,
      [offset - itemWidth, offset, offset + itemWidth],
      [-itemWidth * parallaxIntensity, 0, itemWidth * parallaxIntensity],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX }],
    };
  }, [index, itemWidth, parallaxIntensity]);

  const innerWidth = itemWidth - spacing * 2;
  const innerHeight = itemHeight - spacing * 2;

  return (
    <View
      style={[styles.itemContainer, { width: itemWidth, height: itemHeight }]}
    >
      <View
        style={[
          styles.imageContainer,
          { width: innerWidth, height: innerHeight },
        ]}
        renderToHardwareTextureAndroid
      >
        {item.image && (
          <AnimatedImage
            source={item.image}
            contentFit="cover"
            style={[
              styles.image,
              { width: innerWidth, height: innerHeight },
              imageAnimatedStyle,
            ]}
          />
        )}
      </View>
      {renderItem({ item, index })}
    </View>
  );
};

const MemoizedParallaxCarouselItem = React.memo(
  ParallaxCarouselItemComponent,
) as typeof ParallaxCarouselItemComponent;

function ParallaxCarouselInner<ItemT extends ParallaxCarouselItem>(
  {
    data,
    renderItem,
    keyExtractor,
    itemWidth = width,
    itemHeight = height * 0.75,
    spacing = 20,
    parallaxIntensity = 0.7,
    pagingEnabled = true,
    showHorizontalScrollIndicator = false,
    onIndexChange,
    onInteractionStart,
    onInteractionEnd,
  }: ParallaxCarouselProps<ItemT>,
  ref: React.Ref<ParallaxCarouselRef>,
) {
  const scrollX = useSharedValue(0);
  const listRef = useRef<Animated.FlatList<ItemT>>(null);
  const reportPosition = useCallback((offset: number) => {
    const index = Math.max(0, Math.min(data.length - 1, Math.round(offset / itemWidth)));
    onIndexChange?.(index);
    onInteractionEnd?.();
  }, [data.length, itemWidth, onIndexChange, onInteractionEnd]);
  const beginInteraction = useCallback(() => onInteractionStart?.(), [onInteractionStart]);
  const beginDrag = useCallback(() => {
    playSound("select");
    beginInteraction();
  }, [beginInteraction]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, animated = true) => {
        listRef.current?.scrollToIndex({ index, animated });
      },
    }),
    [],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      scheduleOnRN(beginDrag);
    },
    onEndDrag: (event) => {
      scheduleOnRN(reportPosition, event.contentOffset.x);
    },
    onMomentumBegin: () => {
      scheduleOnRN(beginInteraction);
    },
    onMomentumEnd: (event) => {
      scheduleOnRN(reportPosition, event.contentOffset.x);
    },
  });

  const defaultKeyExtractor = useCallback(
    (item: ItemT, index: number) =>
      keyExtractor ? keyExtractor(item, index) : `item-${index}`,
    [keyExtractor],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<ItemT> | null | undefined, index: number) => ({
      length: itemWidth,
      offset: itemWidth * index,
      index,
    }),
    [itemWidth],
  );

  const renderCarouselItem = useCallback(
    ({ item, index }: { item: ItemT; index: number }) => (
      <MemoizedParallaxCarouselItem
        item={item}
        index={index}
        scrollX={scrollX}
        renderItem={renderItem}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        spacing={spacing}
        parallaxIntensity={parallaxIntensity}
      />
    ),
    [scrollX, renderItem, itemWidth, itemHeight, spacing, parallaxIntensity],
  );

  const sidePadding = useMemo(
    () => Math.max((width - itemWidth) / 2, 0),
    [itemWidth],
  );

  const contentContainerStyle = useMemo(
    () => [styles.flatListContent, { paddingHorizontal: sidePadding }],
    [sidePadding],
  );

  const snapProps = useMemo(
    () =>
      pagingEnabled
        ? {
            snapToInterval: itemWidth,
            snapToAlignment: "start" as const,
            decelerationRate: "fast" as const,
            disableIntervalMomentum: true,
          }
        : {},
    [pagingEnabled, itemWidth],
  );

  return (
    <View style={styles.carouselWrapper}>
      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={defaultKeyExtractor}
        horizontal
        showsHorizontalScrollIndicator={showHorizontalScrollIndicator}
        onScroll={onScroll}
        onTouchStart={beginInteraction}
        onTouchEnd={onInteractionEnd}
        onTouchCancel={onInteractionEnd}
        style={styles.list}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        initialNumToRender={3}
        maxToRenderPerBatch={1}
        windowSize={3}
        overScrollMode="never"
        contentContainerStyle={contentContainerStyle}
        renderItem={renderCarouselItem}
        {...snapProps}
      />
    </View>
  );
}

/**
 * A paging carousel with an image-parallax effect and settled-position callbacks.
 * Forwards a ref exposing `scrollToIndex` so a parent (e.g. an
 * autoplaying hero) can drive paging without reaching into the FlatList.
 */
const ParallaxCarousel = forwardRef(ParallaxCarouselInner) as <
  ItemT extends ParallaxCarouselItem,
>(
  props: ParallaxCarouselProps<ItemT> & {
    ref?: React.Ref<ParallaxCarouselRef>;
  },
) => React.ReactElement;

const styles = StyleSheet.create({
  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flexGrow: 0,
  },
  flatListContent: {
    alignItems: "center",
  },
  itemContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

export { ParallaxCarousel };
export type {
  ParallaxCarouselItem,
  ParallaxCarouselItemProps,
  ParallaxCarouselProps,
  ParallaxCarouselRef,
};
