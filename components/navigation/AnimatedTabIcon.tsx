import { House, MagnifyingGlass, Plus, Users, List, IconProps } from "phosphor-react-native";
import { type FC, useEffect, useRef } from "react";
import { Animated } from "react-native";

type Icon = React.FC<IconProps>;
const ICONS: Record<string, Icon> = {
  index: House,
  search: MagnifyingGlass,
  'add-food': Plus,
  groups: Users,
  profile: List,
};
const BOLD_ICONS = ['add-food', 'profile'];
const AnimatedTabIcon: FC<{ route: string; focused: boolean }> = ({ route, focused }) => {
  //Hooks
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;

  const IconComponent = ICONS[route];
  const isBold = BOLD_ICONS.includes(route);
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0.5,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [focused]);
  return (
    <Animated.View style={{ opacity }}>
      <IconComponent
        size={28}
        color="#FFFFFF"
        weight={focused ? (isBold ? "bold" : "fill") : "regular"}
      />
    </Animated.View>
  );
};
export default AnimatedTabIcon;