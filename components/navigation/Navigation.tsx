import { Button, DashboardSheet } from "@/components";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { NotePencil, Plus, Sparkle, X } from "phosphor-react-native";
import { type FC, useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Reanimated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AnimatedTabIcon from "./AnimatedTabIcon";

const VISIBLE_TAB_NAMES = ["index", "search", "add-food", "groups", "profile"];
const Navigation: FC<BottomTabBarProps> = ({ state, navigation }) => {
  const router = useRouter();
  const [tabBarWidth, setTabBarWidth] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScaleX = useRef(new Animated.Value(1)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const plusRotation = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const menuOpacity = useSharedValue(0);
  const menuOverlayStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
  }));
  const PADDING_HORIZONTAL = 12;
  const INNER_WIDTH = tabBarWidth - PADDING_HORIZONTAL;
  const visibleRoutes = state.routes.filter(r => VISIBLE_TAB_NAMES.includes(r.name));
  const currentRouteName = state.routes[state.index]?.name;
  const visibleIndex = visibleRoutes.findIndex(r => r.name === currentRouteName);
  const addFoodIndex = visibleRoutes.findIndex(r => r.name === "add-food");
  const effectiveIndex = visibleIndex >= 0 ? visibleIndex : currentRouteName === "quick-add" ? addFoodIndex : 0;
  const TAB_WIDTH = INNER_WIDTH / visibleRoutes.length;
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 100,
    }).start();
  }, []);
  useEffect(() => {
    Animated.spring(plusRotation, {
      toValue: isMenuOpen ? 1 : 0,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [isMenuOpen]);
  useEffect(() => {
    menuOpacity.value = withTiming(isMenuOpen ? 1 : 0, { duration: 250 });
  }, [isMenuOpen, menuOpacity]);
  useEffect(() => {
    if (tabBarWidth === 0) return;
    const toValue = 8 + effectiveIndex * TAB_WIDTH + TAB_WIDTH / 2 - 20;
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
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(indicatorScaleX, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
        }),
      ]),
    ]).start();
  }, [effectiveIndex, tabBarWidth]);
  const handleMenuOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMenuOpen(true);
  };
  const handleMenuClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuOpen(false);
  };
  const plusRotateStyle = {
    transform: [
      {
        rotate: plusRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };
  return (
    <View
      className="absolute top-0 left-0 right-0 bottom-0"
      pointerEvents="box-none"
    >
      <Image
        source={require("../../assets/images/bottom-shadow.png")}
        resizeMode="stretch"
        className="absolute bottom-0 left-0 right-0 w-full h-[120px] pointer-events-none"
      />
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 48 }}
        pointerEvents="box-none"
      >
        <DashboardSheet ref={bottomSheetRef} />
      </View>
      <Animated.View
        className="absolute bottom-8 left-4 right-4 items-center"
        style={{
          opacity: entranceAnim,
          transform: [
            {
              translateY: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View
          className="flex-row bg-dark rounded-[32px] h-[65px] w-full items-center justify-around shadow-[#000000]/25 shadow-lg px-2"
          onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 40,
              height: 3,
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
              transform: [
                { translateX: indicatorX },
                { scaleX: indicatorScaleX },
              ],
              shadowColor: "#FFFFFF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
            }}
          />
          {visibleRoutes.map((route, index) => {
            const focused = route.name === state.routes[state.index]?.name;
            const isCenter = route.name === "add-food";
            const onPress = () => {
              if (isCenter) {
                handleMenuOpen();
                return;
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: "tabPress",
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
                    elevation: 5,
                  }}
                >
                  <Animated.View style={plusRotateStyle}>
                    <Plus size={28} color="#FFFFFF" weight={currentRouteName === "quick-add" ? "bold" : "regular"} />
                  </Animated.View>
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
                <AnimatedTabIcon
                  route={route.name}
                  focused={focused}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
      <Reanimated.View
        style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, menuOverlayStyle]}
        pointerEvents={isMenuOpen ? "auto" : "none"}
      >
        <Image
          source={require("../../assets/images/gradient.png")}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
        />
        {isMenuOpen && <Pressable style={StyleSheet.absoluteFill} onPress={handleMenuClose} />}
        {isMenuOpen && (
          <>
            <View className="absolute bottom-[148px] left-4 right-4 gap-4">
              <Reanimated.View
                entering={FadeInDown.delay(60).duration(250).springify()}
                exiting={FadeOutDown.duration(250)}
              >
                <Button
                  className="rounded-[30px] mx-0 w-full py-5 bg-dark"
                  textClassName="text-xl text-white"
                  shadowColor="#000000"
                  onPress={() => {
                    handleMenuClose();
                    router.push("/quick-add");
                  }}
                  icon={<NotePencil size={24} color="#FFFFFF" weight="regular" />}
                >
                  Quick Add
                </Button>
              </Reanimated.View>
              <Reanimated.View
                entering={FadeInDown.duration(250).springify()}
                exiting={FadeOutDown.duration(250)}
              >
                <Button
                  className="rounded-[30px] mx-0 w-full py-5"
                  textClassName="text-xl"
                  shadowColor="#C5E384"
                  onPress={() => {
                    handleMenuClose();
                    router.push({ pathname: "/(tabs)/quick-add", params: { startTab: "magicScan", _t: Date.now().toString() } });
                  }}
                  icon={<Sparkle size={24} color="#1D1D1D" weight="regular"/>}
                >
                  Magic Scan
                </Button>
              </Reanimated.View>
            </View>
            <Reanimated.View
              entering={FadeInDown.delay(30).duration(250).springify()}
              exiting={FadeOutDown.duration(250)}
              className="absolute bottom-[60px] self-center"
            >
              <TouchableOpacity
                onPress={handleMenuClose}
                activeOpacity={0.25}
                className="w-[60px] h-[60px] rounded-full bg-white/10 border border-white/20 justify-center items-center"
              >
                <X size={28} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </Reanimated.View>
          </>
        )}
      </Reanimated.View>
    </View>
  );
};
export default Navigation;