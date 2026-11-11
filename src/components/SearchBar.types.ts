import type { ViewStyle, TextStyle } from "react-native";

export interface SearchBarProps {
      placeholder?: string;
      onSearch?: (query: string) => void;
      onClear?: () => void;
      style?: ViewStyle;
      inputStyle?: TextStyle;
      tint?: string;
      renderTrailingIcons?: () => React.ReactNode;
      renderLeadingIcons?: () => React.ReactNode;
      onSearchDone?: () => void;
      onSearchMount?: () => void;
}
