import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SearchField } from "heroui-native/search-field";
import type { SearchBarProps } from "./SearchBar.types";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { playSound } from "@/lib/interactionSounds";

export function SearchBar({
  placeholder = "Search",
  onSearch,
  onClear,
  style,
  inputStyle,
  renderLeadingIcons,
  renderTrailingIcons,
  onSearchDone = () => {},
  onSearchMount = () => {},
  tint = colors.accent,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    if (text !== query) {
      const key = text.length < query.length ? "delete" : text.endsWith(" ") ? "space" : "printable";
      playSound("type", { key });
    }
    setQuery(text);
    onSearch?.(text);
  };

  return (
    <View style={[styles.container, style]}>
      <SearchField value={query} onChange={handleChange} animation="disable-all" style={styles.field}>
        <SearchField.Group style={[styles.group, isFocused && styles.groupFocused]}>
          <SearchField.SearchIcon iconProps={{ size: 18, color: colors.muted }}>
            {renderLeadingIcons?.()}
          </SearchField.SearchIcon>
          <SearchField.Input
            variant="secondary"
            background={null}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            cursorColor={tint}
            selectionColor={tint}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onFocus={() => {
              setIsFocused(true);
              playSound("open");
              onSearchMount();
            }}
            onBlur={() => {
              setIsFocused(false);
              if (!query) onSearchDone();
            }}
            onSubmitEditing={() => playSound("type", { key: "enter" })}
            style={[styles.input, inputStyle]}
          />
          <SearchField.ClearButton
            variant="ghost"
            feedbackVariant="none"
            background={null}
            iconProps={{ size: 14, color: colors.text }}
            onPress={() => {
              playSound("tap");
              onClear?.();
            }}
          >
            {renderTrailingIcons?.()}
          </SearchField.ClearButton>
        </SearchField.Group>
      </SearchField>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center", justifyContent: "center" },
  field: { width: "100%" },
  group: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,121,73,0.32)",
    borderRadius: 999,
    backgroundColor: "rgba(255,121,73,0.08)",
  },
  groupFocused: { borderColor: colors.accent, backgroundColor: "rgba(255,121,73,0.12)" },
  input: {
    flex: 1,
    minHeight: 42,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
