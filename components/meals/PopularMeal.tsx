import { CaretRight } from "phosphor-react-native";
import { FC } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

type PopularMealProps = {
    imgUrl?: string | null,
    name: string,
    calories: number,
    url: string,
}
const PopularMeal: FC<PopularMealProps> = ({ imgUrl, name, calories, url }) => {
    return (
        <TouchableOpacity
            onPress={() => { }}
            className="bg-dark rounded-[15px] overflow-hidden w-[200px] mr-4"
            activeOpacity={0.25}
            style={{
                height: 184,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            }}
        >
            <Image
                source={imgUrl ? { uri: imgUrl } : require("@/assets/images/not-found-meal.webp")}
                resizeMode="cover"
                className="w-full h-[90px]"
                style={{ opacity: 0.8 }}
            />
            <View className="mt-2 px-4 pb-3 flex-row justify-between gap-2 items-center flex-1">
                <View className="gap-1 flex-1">
                    <Text className="text-lg text-white font-nunito-700" numberOfLines={2}>{name}</Text>
                    <Text className="text-sm text-white/50 font-nunito-800" numberOfLines={1}>{calories} cal / 100 g</Text>
                </View>
                <CaretRight size={20} color="#FFFFFF" weight="bold"/>
            </View>
        </TouchableOpacity>
    );
};
export default PopularMeal;