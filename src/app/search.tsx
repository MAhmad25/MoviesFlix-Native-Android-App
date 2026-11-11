import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { useCallback, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { mediaTitle, tmdb, tmdbImage } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { Shimmer, ShimmerGroup } from "@/components/Shimmer";

const RESULT_SKELETON_COUNT = 6;

function SearchResultsSkeleton() {
  return (
    <View className="mt-4 gap-2">
      <ShimmerGroup duration={1000}>
        {Array.from({ length: RESULT_SKELETON_COUNT }).map((_, i) => (
          <View key={i} className="flex-row items-center gap-3 rounded-lg p-2" style={{ backgroundColor: colors.card }}>
            <Shimmer style={{ width: 46, height: 46, borderRadius: 8 }} />
            <View className="flex-1 gap-1.5">
              <Shimmer style={{ width: "70%", height: 13, borderRadius: 5 }} />
              <Shimmer style={{ width: 40, height: 10, borderRadius: 4 }} />
            </View>
          </View>
        ))}
      </ShimmerGroup>
    </View>
  );
}

/** Ports Components/pages/Search.jsx — a native search input + results list (the web app's "gooey" liquid search box has no RN equivalent). */
export default function SearchScreen() {
      const [results, setResults] = useState<MediaItem[]>([]);
      const [error, setError] = useState("");
      const [isSearching, setIsSearching] = useState(false);
      const requestId = useRef(0);
      const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const router = useRouter();

      const runSearch = useCallback(async (term: string) => {
            const currentRequest = ++requestId.current;
            if (!term.trim()) {
                  setResults([]);
                  setError("");
                  setIsSearching(false);
                  return;
            }
            setIsSearching(true);
            try {
                  const { data } = await tmdb.get(`/search/multi?query=${encodeURIComponent(term.trim())}`);
                  if (currentRequest === requestId.current) {
                        setResults(data.results ?? []);
                        setError("");
                  }
            } catch {
                  if (currentRequest === requestId.current) {
                        setResults([]);
                        setError("We couldn't load results right now. Try again in a moment.");
                  }
            } finally {
                  if (currentRequest === requestId.current) setIsSearching(false);
            }
      }, []);

      const onSearchChange = (text: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (text.trim()) setIsSearching(true);
            debounceRef.current = setTimeout(() => runSearch(text), 350);
      };

      const onClear = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            requestId.current++;
            setResults([]);
            setError("");
            setIsSearching(false);
      };

      return (
            <View style={{ flex: 1, backgroundColor: colors.background }} className="px-4 pt-14">
                  <SearchBar
                        placeholder="e.g. Breaking Bad"
                        tint={colors.accent}
                        onSearch={onSearchChange}
                        onClear={onClear}
                  />
                  {!!error && (
                        <Text style={{ color: colors.muted }} className="mt-6 text-center text-sm">
                              {error}
                        </Text>
                  )}
                  {isSearching ? (
                        <SearchResultsSkeleton />
                  ) : (
                        <FlatList
                              className="mt-4"
                              data={results}
                              keyExtractor={(item, index) => `${item.id}-${index}`}
                              contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
                              renderItem={({ item }) => {
                                    const src = tmdbImage(item.poster_path || item.backdrop_path || item.profile_path, "w92");
                                    const type = item.media_type || "movie";
                                    return (
                                          <Pressable sound="navigate" onPress={() => router.push(`/${type}/${item.id}` as any)} className="flex-row items-center gap-3 rounded-lg p-2" style={{ backgroundColor: colors.card }}>
                                                <Image source={src ?? require("@/assets/images/no-image.jpg")} style={{ width: 46, height: 46, borderRadius: 8 }} contentFit="cover" />
                                                <View className="flex-1">
                                                      <Text numberOfLines={1} style={{ color: colors.text }}>
                                                            {mediaTitle(item)}
                                                      </Text>
                                                      <Text style={{ color: colors.muted }} className="text-xs">
                                                            {type.toUpperCase()}
                                                      </Text>
                                                </View>
                                          </Pressable>
                                    );
                              }}
                        />
                  )}
            </View>
      );
}
