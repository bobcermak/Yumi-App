import { View, TouchableWithoutFeedback, Keyboard, FlatList, Text } from "react-native";
import { SearchInput, Icon, PopularMealsSection, Button } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, DotsThree, Plus } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchProvider from "@/contexts/SearchContext";

const SearchContent = () => {
  //Router
  const router = useRouter();
  //Params
  const { focus } = useLocalSearchParams<{ focus: string }>();
  //Hooks
  const insets = useSafeAreaInsets();
  
  const TAB_BAR_HEIGHT = 148;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 mt-[88px] w-full">
        <View className="flex-row w-[380px] self-center justify-center items-center py-4">
          <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
              <CaretLeft size={24} color="#1D1D1D" weight="regular"/>
          </Icon>
          <Text className="font-nunito-700 text-[28px] text-white">Search</Text>
        </View>
        <FlatList
          data={[]} 
          renderItem={null}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          ListHeaderComponent={
            <View>
              <View>
                <View className="w-[362px] self-center mt-4 flex-row items-center gap-1 justify-between">
                  <SearchInput 
                    isInput 
                    autoFocus={focus === "true"}
                    placeholder="Search for 'Banana' or 'Big Mac'"
                    showCamera={false}
                    className="w-[292px]"
                  />
                  <Icon onPress={() => {}} className="bg-yellow w-12 h-12">
                    <DotsThree size={24} color="#1D1D1D" weight="regular"/>
                  </Icon>
                </View>
                <PopularMealsSection/>
              </View>
              <View className="w-[362px] self-center mt-8">
                <View className="flex-row items-end justify-between">
                  <Text className="title">My Meals</Text>
                  <Button
                    onPress={() => {}}
                    icon={<Plus size={20} color="#1D1D1D" weight="bold"/>}
                  >
                    Create
                  </Button>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
const Search = () => {
  return (
    <SearchProvider>
      <SearchContent />
    </SearchProvider>
  );
};
export default Search;