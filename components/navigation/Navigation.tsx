import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Plus } from 'phosphor-react-native';
import { type FC, useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedTabIcon from './AnimatedTabIcon';
import BottomSheet from '@gorhom/bottom-sheet';
import { DashboardSheet } from '@/components';

const Navigation: FC<BottomTabBarProps> = ({ state, navigation }) => {
  //Hooks
  const [tabBarWidth, setTabBarWidth] = useState<number>(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScaleX = useRef(new Animated.Value(1)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const PADDING_HORIZONTAL = 12;
  const INNER_WIDTH = tabBarWidth - PADDING_HORIZONTAL;
  const TAB_WIDTH = INNER_WIDTH / state.routes.length;

  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 100,
    }).start();
  }, []);
  useEffect(() => {
    if (tabBarWidth === 0) return;
    const toValue = 8 + (state.index * TAB_WIDTH) + (TAB_WIDTH / 2) - 20;
    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }),
      Animated.sequence([
        Animated.timing(indicatorScaleX, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(indicatorScaleX, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
        })
      ])
    ]).start();
  }, [state.index, tabBarWidth]);
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0" pointerEvents="box-none">
      <Image source={require('../../assets/images/bottom-shadow.png')} resizeMode="stretch" className="absolute bottom-0 left-0 right-0 w-full h-[280px] pointer-events-none"/>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 48 }} pointerEvents="box-none">
        <DashboardSheet ref={bottomSheetRef}/>
      </View>
      <Animated.View 
        className="absolute bottom-8 left-4 right-4 items-center"
        style={{
          opacity: entranceAnim,
          transform: [{
            translateY: entranceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }}
      >
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
              height: 3,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              transform: [
                { translateX: indicatorX },
                { scaleX: indicatorScaleX }
              ],
              shadowColor: "#FFFFFF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
            }}
          />
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const isCenter = route.name === 'add-food';
            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  activeOpacity={0.25}
                  className="w-[64px] h-[64px] rounded-full bg-green justify-center items-center mx-2 mb-10"
                  style={{
                    shadowColor: "#84C754",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  <Plus size={28} color="#FFFFFF" weight={focused ? "bold" : "regular"} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.25}
                className="flex-1 h-full justify-center items-center"
              >
                <AnimatedTabIcon route={route.name} focused={focused} isNotification={route.name === "groups"}/>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};
export default Navigation;