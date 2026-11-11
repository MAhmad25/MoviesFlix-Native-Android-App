import { StyleSheet, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Film, Home, Search, Tv, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "heroui-native/tabs";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { playSound } from "@/lib/interactionSounds";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/movies", label: "Movies", Icon: Film },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/people", label: "Celebrity", Icon: Users },
  { href: "/tv", label: "TV Shows", Icon: Tv },
] as const;

export default function NavBar() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const segment = segments[0] ?? "";
  const activeRoute = segment === "movie" ? "/movies" : segment === "person" ? "/people" : `/${segment}`;
  const navigateTo = (value: string) => {
    const item = NAV_ITEMS.find(({ href }) => href === value);
    if (!item) return;
    playSound("tap");
    if (segments.length < 2 && value === activeRoute) return;
    router.navigate(item.href);
  };

  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 8), paddingLeft: insets.left, paddingRight: insets.right }]}>
      <Tabs
        value={activeRoute}
        onValueChange={navigateTo}
        variant="secondary"
        animation="disable-all"
        style={styles.tabs}
      >
        <Tabs.List background={null} style={styles.bar}>
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Tabs.Trigger key={href} value={href} accessibilityLabel={label} style={styles.tab}>
              {({ isSelected }) => (
                <View style={[styles.tabContent, isSelected && styles.activeTab]}>
                  <Icon size={20} color={isSelected ? colors.card : colors.muted} />
                  <Tabs.Label style={[styles.label, { color: isSelected ? colors.card : colors.muted }]}>{label}</Tabs.Label>
                </View>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.backgroundLight },
  tabs: { width: "100%" },
  bar: { height: 66, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 58, paddingHorizontal: 0, borderRadius: 10, overflow: "hidden" },
  tabContent: { minWidth: 58, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 10, overflow: "hidden", paddingHorizontal: 3, paddingVertical: 4 },
  activeTab: { backgroundColor: colors.accent, borderRadius: 10 },
  label: { fontFamily: fonts.body, fontSize: 10, includeFontPadding: false },
});
