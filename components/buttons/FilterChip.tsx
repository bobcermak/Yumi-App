import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};
const FilterChip: FC<FilterChipProps> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.25}
    className={`px-4 py-2 rounded-full border ${isActive
        ? "bg-yellow border-yellow"
        : "bg-white/5 border-white/10"
      }`}
  >
    <Text
      className={`font-nunito-700 text-sm ${isActive ? "text-dark" : "text-white/60"
        }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
export default FilterChip;