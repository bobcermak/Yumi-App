import { FC, ReactNode } from "react";
import { Text } from "react-native";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};
const SectionLabel: FC<SectionLabelProps> = ({ children, className = "" }) => (
  <Text className={`font-nunito-600 text-sm text-white/80 tracking-wide ${className}`}>
    {children}
  </Text>
);
export default SectionLabel;