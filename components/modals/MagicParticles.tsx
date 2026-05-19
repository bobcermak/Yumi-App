import { Dimensions } from "react-native";
import Reanimated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useEffect, type FC } from "react";

const { width: W, height: H } = Dimensions.get("window");
const PARTICLES = [
  { id: 0,  x: 0.08, y: 0.18, size: 5, duration: 2200, delay: 0 },
  { id: 1,  x: 0.22, y: 0.42, size: 7, duration: 2800, delay: 300 },
  { id: 2,  x: 0.68, y: 0.14, size: 4, duration: 2500, delay: 600 },
  { id: 3,  x: 0.84, y: 0.58, size: 3, duration: 3000, delay: 100 },
  { id: 4,  x: 0.50, y: 0.72, size: 8, duration: 2100, delay: 900 },
  { id: 5,  x: 0.33, y: 0.83, size: 4, duration: 2600, delay: 400 },
  { id: 6,  x: 0.88, y: 0.32, size: 5, duration: 2900, delay: 700 },
  { id: 7,  x: 0.14, y: 0.62, size: 6, duration: 2300, delay: 200 },
  { id: 8,  x: 0.58, y: 0.88, size: 3, duration: 3100, delay: 800 },
  { id: 9,  x: 0.75, y: 0.48, size: 9, duration: 2400, delay: 500 },
  { id: 10, x: 0.42, y: 0.28, size: 4, duration: 2700, delay: 1000 },
  { id: 11, x: 0.18, y: 0.08, size: 5, duration: 2000, delay: 350 },
  { id: 12, x: 0.62, y: 0.35, size: 6, duration: 2650, delay: 150 },
  { id: 13, x: 0.30, y: 0.65, size: 3, duration: 2450, delay: 750 },
  { id: 14, x: 0.92, y: 0.78, size: 5, duration: 2850, delay: 550 },
];
type ParticleProps = { 
  x: number,
  y: number,
  size: number,
  duration: number,
  delay: number
};
const Particle: FC<ParticleProps> = ({ x, y, size, duration, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.75, { duration: duration * 0.4 }),
        withTiming(0.1,  { duration: duration * 0.6 }),
      ), -1, false
    ));
    translateY.value = withDelay(delay, withRepeat(
      withTiming(-45, { duration }), -1, true
    ));
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1,   { duration: duration * 0.5 }),
        withTiming(0.3, { duration: duration * 0.5 }),
      ), -1, false
    ));
  }, [opacity, scale, translateY, delay, duration]);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
  return (
    <Reanimated.View
      style={[
        {
          position: "absolute",
          left: x * W,
          top: y * H,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#C5E384",
          shadowColor: "#C5E384",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 6,
        },
        animStyle,
      ]}
    />
  );
};
const MagicParticles = () => (
  <>
    {PARTICLES.map((p) => (
      <Particle key={p.id} x={p.x} y={p.y} size={p.size} duration={p.duration} delay={p.delay} />
    ))}
  </>
);
export default MagicParticles;