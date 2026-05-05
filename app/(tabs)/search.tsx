import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SearchInput } from "@/components";
import { useLocalSearchParams } from "expo-router";

const Search = () => {
  //Params
  const { focus } = useLocalSearchParams<{ focus: string }>();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-transparent pt-[88px] px-6">
        <SearchInput 
          isInput 
          autoFocus={focus === "true"}
          className="w-full"
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
export default Search;