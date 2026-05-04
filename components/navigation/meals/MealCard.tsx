import { Icon, MealIngredient } from "@/components";
import { CaretDown, Plus } from "phosphor-react-native";
import { FC, useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, Layout, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { MealIngredientProps } from "./MealIngredient";

type IngredientData = Omit<MealIngredientProps, 'onDelete' | 'onEdit'> & { id: string | number };
type MealCardProps = {
    icon: React.ReactNode,
    title: string,
    allCal: number,
    isDayTime?: boolean,
    onPress?: () => void,
    ingredients?: IngredientData[],
    expanded?: boolean,
    onToggle?: () => void
}
const MealCard: FC<MealCardProps> = ({ icon, title, allCal, isDayTime, onPress, ingredients, expanded, onToggle }) => {
    //Hooks
    const hasIngredients = ingredients && ingredients.length > 0;
    const [localExpanded, setLocalExpanded] = useState<boolean>(false);
    const isExpanded = expanded !== undefined ? expanded : localExpanded;
    const rotation = useSharedValue<number>(isExpanded ? 180 : 0);

    //Functions
    const toggleExpand = () => {
        if (!hasIngredients) return;
        if (onToggle) {
            onToggle();
        } else {
            setLocalExpanded(!localExpanded);
        }
    };
    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });
    useEffect(() => {
        rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 250 });
    }, [isExpanded]);
    return (
        <View className="flex-row items-center gap-3 w-full">
            <Animated.View className="flex-1 bg-dark p-4 rounded-[15px]"
                layout={Layout.duration(250)}
                style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                }}>
                <Pressable
                    onPress={toggleExpand}
                    disabled={!hasIngredients}
                    className={`flex-row items-center justify-between ${isExpanded && hasIngredients ? 'pb-4 border-b border-white/80' : ""}`}
                >
                    <View className="flex-row items-center gap-1 flex-1 mr-4">
                        {icon}
                        <Text className={`base-text font-nunito-700 text-lg flex-1 ${isDayTime ? 'text-white font-nunito-800' : 'text-white/80'}`} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 shrink-0">
                        <Text className={`base-text font-nunito-800 text-lg shrink-0 ${isDayTime ? 'text-white font-nunito-800' : 'text-white/80'}`} numberOfLines={1}>{allCal} cal</Text>
                        {hasIngredients && (
                            <Animated.View style={animatedIconStyle}>
                                <CaretDown size={24} color={isDayTime ? "#FFFFFF" : "#FFFFFF80"} weight="bold"/>
                            </Animated.View>
                        )}
                    </View>
                </Pressable>
                {isExpanded && hasIngredients && (
                    <Animated.View entering={FadeIn.duration(250).delay(100)} className="pt-2">
                        {ingredients.map((ingredient) => (
                            <MealIngredient
                                key={ingredient.id}
                                title={ingredient.title}
                                cal={ingredient.cal}
                                baseCal={ingredient.baseCal}
                                amount={ingredient.amount}
                                onDelete={() => console.log(`Delete ${ingredient.id}`)}
                                onEdit={() => console.log(`Edit ${ingredient.id}`)}
                            />
                        ))}
                    </Animated.View>
                )}
            </Animated.View>
            <Icon className="w-[28px] h-[28px] bg-green" shadowColor="#84C754" onPress={() => { }}>
                <Plus size={16} color="#FFFFFF" weight="regular" />
            </Icon>
        </View>
    );
}
export default MealCard;