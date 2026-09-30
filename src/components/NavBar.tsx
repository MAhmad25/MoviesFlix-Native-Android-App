import { StyleSheet, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Film, Home, Search, Tv, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaskedTabBar } from "@/components/ui/organisms/masked-tab-bar";
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
      <MaskedTabBar
        value={activeRoute}
        onValueChange={navigateTo}
        onValueReselect={navigateTo}
        theme="dark"
        radius={16}
        height={64}
        padding={4}
        gap={0}
        iconSize={21}
        fontSize={10}
        style={styles.bar}
        palette={{ track: colors.card, pill: colors.accent, inactive: colors.muted, active: colors.card }}
      >
        <MaskedTabBar.List>
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <MaskedTabBar.Trigger key={href} value={href} accessibilityLabel={label} style={styles.tab}>
              <MaskedTabBar.Icon>{({ size, color }) => <Icon size={size} color={color} />}</MaskedTabBar.Icon>
              <MaskedTabBar.Label style={{ fontFamily: fonts.body }}>{label}</MaskedTabBar.Label>
            </MaskedTabBar.Trigger>
          ))}
        </MaskedTabBar.List>
      </MaskedTabBar>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.backgroundLight },
  bar: { borderRadius: 0 },
  tab: { flexDirection: "column", gap: 5, paddingHorizontal: 2 },
});
