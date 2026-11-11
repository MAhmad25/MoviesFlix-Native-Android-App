import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Select } from "heroui-native/select";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";
import { playSound } from "@/lib/interactionSounds";

interface Option {
  label: string;
  value: string;
}

interface CategoryToggleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryToggle({ options, value, onChange }: CategoryToggleProps) {
  const selected = options.find((option) => option.value === value);
  const { height } = useWindowDimensions();

  return (
    <Select
      presentation="dialog"
      value={selected}
      isDisabled={options.length === 0}
      onOpenChange={(isOpen) => playSound(isOpen ? "open" : "close")}
      onValueChange={(option) => {
        const next = Array.isArray(option) ? option[0]?.value : option?.value;
        if (next) {
          playSound("select");
          onChange(next);
        }
      }}
    >
      <Select.Trigger
        variant="unstyled"
        background={null}
        accessibilityRole="button"
        accessibilityLabel={`Category: ${selected?.label ?? value}`}
        style={styles.trigger}
      >
        <Select.Value placeholder={selected?.label ?? "Trending"} style={styles.value} />
        <Select.TriggerIndicator iconProps={{ size: 16, color: colors.accent }} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="dialog" isSwipeable={false} style={[styles.content, { maxHeight: height * 0.82 }]}>
          <Select.ListLabel style={styles.listLabel}>Choose a genre</Select.ListLabel>
          <ScrollView
            style={[styles.list, { maxHeight: height * 0.68 }]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} label={option.label} style={styles.option}>
                {({ isSelected }) => (
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>{option.label}</Text>
                    {isSelected && <View style={styles.selectedMark} />}
                  </View>
                )}
              </Select.Item>
            ))}
          </ScrollView>
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,121,73,0.4)",
    borderRadius: 10,
    backgroundColor: colors.backgroundLight,
  },
  value: { color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  content: { backgroundColor: colors.card },
  listLabel: { color: colors.text, fontFamily: fonts.heading, fontSize: 18, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  list: { flexGrow: 0, paddingHorizontal: 10 },
  listContent: { paddingBottom: 20 },
  option: { minHeight: 42, borderRadius: 8, paddingHorizontal: 10, justifyContent: "center" },
  optionContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  optionLabel: { color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  selectedLabel: { color: colors.accent },
  selectedMark: { width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent },
});
