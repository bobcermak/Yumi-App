import { FC } from "react";
import { View } from "react-native";

type DividerProps = {
  className?: string;
};
const Divider: FC<DividerProps> = ({ className = "" }) => (
  <View className={`h-px bg-white/10 mx-6 mt-9 ${className}`} />
);
export default Divider;