import { View, Text } from "react-native";
import Animated, { FadeIn, FadeInDown, ReduceMotion } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { UsersThree, HandHeart, Trophy, ChatCircleDots } from "phosphor-react-native";

const INK = {
  hi:    "rgba(255,255,255,0.94)",
  mid:   "rgba(255,255,255,0.70)",
  low:   "rgba(255,255,255,0.42)",
  faint: "rgba(255,255,255,0.26)",
  ghost: "rgba(255,255,255,0.15)",
  line:  "rgba(255,255,255,0.07)"
};
const GREEN = {
  full: "#C5E384",
  deep: "#84C754",
  dim:  "rgba(197,227,132,0.30)",
  wash: "rgba(197,227,132,0.12)"
};
const SP = { xs: 4, sm: 8, md: 12, lg: 18, xl: 26, xxl: 38 };
const PAGE_X = 24;
const PLANNED = [
  { Icon: HandHeart,       title: "Friends",        detail: "Follow the people you already cook with" },
  { Icon: Trophy,          title: "Clubs",          detail: "Small groups that log together and compare streaks" },
  { Icon: ChatCircleDots,  title: "Shared rewinds", detail: "Your weekly summary, side by side with theirs" }
];
const Groups = () => {
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: PAGE_X, marginTop: -SP.xxl }}>
        <Animated.View
          entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
          className="items-center"
        >
          <View
            className="items-center justify-center"
            style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: GREEN.wash }}
          >
            <UsersThree size={34} color={GREEN.full} weight="regular" />
          </View>
          <View
            className="rounded-full"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginTop: SP.xl,
              backgroundColor: GREEN.wash,
              borderWidth: 1,
              borderColor: GREEN.dim
            }}
          >
            <Text className="font-nunito-800 text-[11px]" style={{ color: GREEN.full, letterSpacing: 0.4 }}>
              COMING SOON
            </Text>
          </View>
          <Text
            className="font-nunito-800 text-center"
            style={{ color: INK.hi, fontSize: 28, lineHeight: 40, letterSpacing: -0.7, marginTop: SP.md }}
          >
            Groups
          </Text>
          <Text
            className="font-nunito-600 text-center"
            style={{ color: INK.faint, fontSize: 14, lineHeight: 22, marginTop: SP.xs }}
          >
            Tracking is easier with company.{"\n"}We are building this part next.
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeIn.duration(280).delay(140).reduceMotion(ReduceMotion.System)}
          className="w-full"
          style={{ marginTop: SP.xxl }}
        >
          {PLANNED.map(({ Icon, title, detail }, index) => (
            <View
              key={title}
              className="flex-row items-center"
              style={{
                gap: SP.md,
                paddingVertical: SP.md + 2,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: INK.line
              }}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Icon size={17} color={INK.low} weight="regular" />
              </View>
              <View className="flex-1">
                <Text className="font-nunito-700 text-[15px]" style={{ color: INK.mid }}>
                  {title}
                </Text>
                <Text className="font-nunito-600 text-[11px]" style={{ color: INK.faint, marginTop: 2 }}>
                  {detail}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
      <LinearGradient
        colors={["transparent", "rgba(197,227,132,0.06)"]}
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220 }}
      />
    </View>
  );
};
export default Groups;