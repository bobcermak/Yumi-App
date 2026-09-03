import { House, MagnifyingGlass, Plus, Users, List, IconProps } from "phosphor-react-native";
import { type FC, useEffect, useState } from "react";
import { Animated, View } from "react-native";

type Icon = FC<IconProps>;
const ICONS: Record<string, Icon> = {
  index: House,
  search: MagnifyingGlass,
  'add-food': Plus,
  groups: Users,
  profile: List,
};
const BOLD_ICONS = ['add-food', 'profile'];
type AnimatedTabIconProps = {
  route: string,
  focused: boolean,
  isNotification?: boolean
}
const AnimatedTabIcon: FC<AnimatedTabIconProps> = ({ route, focused, isNotification = false }) => {
  //Hooks
  const [scale] = useState(() => new Animated.Value(focused ? 1.15 : 1));
  const [opacity] = useState(() => new Animated.Value(focused ? 1 : 0.5));

  const IconComponent = ICONS[route];
  const isBold = BOLD_ICONS.includes(route);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, opacity]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Animated.View style={{ opacity }}>
        <IconComponent
          size={28}
          color="#FFFFFF"
          weight={focused ? (isBold ? "bold" : "fill") : "regular"}
        />
      </Animated.View>
      {isNotification && (
        <View className="absolute top-full w-[6px] h-[6px] rounded-full bg-[#CA877E] self-center mt-0.5"/>
      )}
    </Animated.View>
  );
};
export default AnimatedTabIcon;