import { SoundPressable as Pressable } from "@/components/SoundPressable";
import { useState } from "react";
import { Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { colors } from "@/constants/theme";
import { fonts } from "@/constants/fonts";

interface Option {
  label: string;
  value: string;
}

interface CategoryToggleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

/** Ports ui/DropDown.jsx (AnimatedDropdown) — a lightweight tap-to-expand option list, no motion library. */
export default function CategoryToggle({ options, value, onChange }: CategoryToggleProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <View className="relative">
      <Pressable sound={open ? "close" : "open"} onPress={() => setOpen((o) => !o)} className="flex-row items-center gap-1.5 rounded-md border px-3 py-2" style={{ borderColor: colors.muted }}>
        <Text style={{ color: colors.text, fontFamily: fonts.body }}>{current?.label ?? value}</Text>
        {open ? <ChevronUp size={16} color={colors.text} /> : <ChevronDown size={16} color={colors.text} />}
      </Pressable>
      {open && (
        <View className="absolute right-0 top-[110%] z-50 min-w-[160px] overflow-hidden rounded-md border" style={{ borderColor: colors.muted, backgroundColor: colors.card }}>
          {options.map((option) => (
            <Pressable
              key={option.value} sound="select"
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="border-b px-3 py-2"
              style={{ borderColor: colors.muted }}
            >
              <Text style={{ color: option.value === value ? colors.accent : colors.text, fontFamily: fonts.body }}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
