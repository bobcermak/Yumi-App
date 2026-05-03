import { Image, View, Animated } from "react-native";
import { useRef, useEffect } from "react";

const AnimatedBackground = () => {
  //Hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim, flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <View pointerEvents="none" className="absolute top-0 left-0 w-full h-full">
        {[300, 700, 1100].map((y, i) => (
          <Image
            key={y}
            source={require("@/assets/images/side-shadow.png")}
            className="absolute w-[768px] h-[492px]"
            style={{
              top: y - 100,
              [i % 2 === 0 ? 'right' : 'left']: 0,
              opacity: 0.8,
              transform: [{ rotate: i % 2 === 0 ? '0deg' : '180deg' }]
            }}
            resizeMode="contain"
          />
        ))}
      </View>
      <View pointerEvents="none" className="absolute top-0 left-0 w-full h-[200px] z-[999]">
        <Image source={require("@/assets/images/shadow.png")} resizeMode="cover" className="w-full h-full"/>
      </View>
    </Animated.View>
  );
};
export default AnimatedBackground;