import { FC, useEffect } from "react";
import { Image, ImageResizeMode, ImageSourcePropType, ViewStyle } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";

type FloatingImageProps = {
  source: ImageSourcePropType,
  className?: string,
  style?: ViewStyle,
  delay?: number,
  floatOffset?: number,
  floatOffsetSide?: number,
  rotationOffset?: number,
  duration?: number,
  resizeMode?: ImageResizeMode,
  imageClassName?: string
};
const FloatingImage: FC<FloatingImageProps> = ({ source, className, style, delay = 0, floatOffset = 8, floatOffsetSide = 3, rotationOffset = 2, duration = 4000, resizeMode = "contain", imageClassName }) => {
  //Hooks
  const translateY = useSharedValue<number>(0);
  const translateX = useSharedValue<number>(0);
  const rotate = useSharedValue<number>(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-floatOffset, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      delay + 1000,
      withRepeat(
        withSequence(
          withTiming(floatOffsetSide, { duration: duration * 1.5, easing: Easing.inOut(Easing.sin) }),
          withTiming(-floatOffsetSide, { duration: duration * 1.5, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(rotationOffset, { duration: duration * 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(-rotationOffset, { duration: duration * 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [delay, floatOffset, floatOffsetSide, rotationOffset, duration]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(1200).springify()}
      style={[style, animatedStyle]}
      className={className}
    >
      <Image
        source={source}
        resizeMode={resizeMode}
        className={imageClassName}
      />
    </Animated.View>
  );
};
export default FloatingImage;