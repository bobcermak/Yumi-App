import { type FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityLevelType } from "@/types/activityLevelsType";

type ActivityCardProps = {
    level: ActivityLevelType,
    isSelected: boolean,
    onPress: () => void
}
const ActivityCard: FC<ActivityCardProps> = ({ level, isSelected, onPress }) => {
    const Icon = level.icon;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.25}
        >
            <LinearGradient
                colors={isSelected ? ['#2C2C2C', '#1D1D1D'] : ['#1D1D1D', '#161616']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: isSelected ? level.color : 'rgba(255,255,255,0.05)',
                }}
            >
                <View className="px-5 py-5 flex-row items-center gap-4">
                    <View 
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: isSelected ? `${level.color}20` : 'rgba(255,255,255,0.05)' }}
                    >
                        <Icon 
                            size={24} 
                            weight={isSelected ? "fill" : "regular"} 
                            color={isSelected ? level.color : "rgba(255,255,255,0.4)"} 
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-lg font-nunito-700 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                            {level.title}
                        </Text>
                        <Text className={`text-sm font-nunito-600 ${isSelected ? 'text-white/60' : 'text-white/40'}`}>
                            {level.description}
                        </Text>
                    </View>
                    {isSelected && (
                        <View 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: level.color }}
                        />
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};
export default ActivityCard;