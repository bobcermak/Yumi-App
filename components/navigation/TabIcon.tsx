import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FC, useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from 'react-native';
import { PlusIcon } from 'phosphor-react-native';
import { AnimatedTabIcon } from '@/components';

const TabIcon: FC<BottomTabBarProps> = ({ state, navigation }) => {
  //Hooks
  const [tabBarWidth, setTabBarWidth] = useState<number>(0);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const PADDING_HORIZONTAL = 12;
  const INNER_WIDTH = tabBarWidth - PADDING_HORIZONTAL;
  const TAB_WIDTH = INNER_WIDTH / state.routes.length;
  useEffect(() => {
    if (tabBarWidth === 0) return;
    Animated.spring(indicatorX, {
      toValue: 8 + (state.index * TAB_WIDTH) + (TAB_WIDTH / 2) - 20,
      useNativeDriver: true,
      damping: 18,
      stiffness: 140,
    }).start();
  }, [state.index, tabBarWidth]);
  return (
    <View className="absolute bottom-8 left-4 right-4 items-center">
      <View
        className="flex-row bg-[#1D1D1D] rounded-[32px] h-[65px] w-full items-center justify-around shadow-[#000000]/25 shadow-lg px-2"
        onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 40,
            height: 2,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: indicatorX }],
          }}
        />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const isCenter = route.name === 'add-food';
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={1}
                className="w-[64px] h-[64px] rounded-full bg-green justify-center items-center mx-2 mb-10"
                style={{
                  shadowColor: "#84C754",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5
                }}
              >
                <PlusIcon size={28} color="#FFFFFF" weight={focused ? "bold" : "regular"}/>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              className="flex-1 h-full justify-center items-center"
            >
              <AnimatedTabIcon route={route.name} focused={focused}/>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
export default TabIcon;