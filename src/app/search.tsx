import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { mediaTitle, tmdb, tmdbImage } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";

/** Ports Components/pages/Search.jsx — a native search input + results list (the web app's "gooey" liquid search box has no RN equivalent). */
export default function SearchScreen() {
      const [results, setResults] = useState<MediaItem[]>([]);
      const [error, setError] = useState("");
      const requestId = useRef(0);
      const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const router = useRouter();

      const runSearch = useCallback(async (term: string) => {
            const currentRequest = ++requestId.current;
            if (!term.trim()) {
                  setResults([]);
                  setError("");
                  return;
            }
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
            }
      }, []);

      const onSearchChange = (text: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => runSearch(text), 350);
      };

      const onClear = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            requestId.current++;
            setResults([]);
            setError("");
      };

      return (
            <View style={{ flex: 1, backgroundColor: colors.background }} className="px-4 pt-14">
                  <SearchBar
                        placeholder="e.g. Breaking Bad"
                        tint={colors.accent}
                        onSearch={onSearchChange}
                        onClear={onClear}
                        textCenterOffset={2.2}
                        iconCenterOffset={2.2}
                  />
                  {!!error && (
                        <Text style={{ color: colors.muted }} className="mt-6 text-center text-sm">
                              {error}
                        </Text>
                  )}
                  <FlatList
                        className="mt-4"
                        data={results}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
                        renderItem={({ item }) => {
                              const src = tmdbImage(item.poster_path || item.backdrop_path || item.profile_path, "w92");
                              const type = item.media_type || "movie";
                              return (
                                    <Pressable onPress={() => router.push(`/${type}/${item.id}` as any)} className="flex-row items-center gap-3 rounded-lg p-2" style={{ backgroundColor: colors.card }}>
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
            </View>
      );
}
