import { View, TouchableWithoutFeedback, Keyboard, FlatList, Text, ActivityIndicator } from "react-native";
import { SearchInput, Icon, PopularMealsSection, Button, SearchResultItem } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, DotsThree, Plus } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchProvider from "@/contexts/SearchContext";
import { useSearchContext } from "@/lib/hooks/useSearchContext";

const SearchContent = () => {
  //Router
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus: string }>();
  const insets = useSafeAreaInsets();
  //Contexts
  const { query, setQuery, searchResults, isSearching, searchSource, submitSearch } = useSearchContext();
  //Constants
  const TAB_BAR_HEIGHT = 148;
  const isSearchActive = query.trim().length > 0;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 mt-[88px] w-full">
        <View className="flex-row w-[380px] self-center justify-center items-center py-4">
          <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
            <CaretLeft size={24} color="#1D1D1D" weight="regular" />
          </Icon>
          <Text className="font-nunito-700 text-[28px] text-white">Search</Text>
        </View>
        <FlatList
          data={isSearchActive ? searchResults : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SearchResultItem item={item} />}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <View className="w-[362px] self-center mt-4 flex-row items-center gap-1 justify-between">
                <SearchInput
                  isInput
                  autoFocus={focus === "true"}
                  placeholder="Maybe pizza?"
                  showCamera={false}
                  className="w-[310px]"
                  value={query}
                  onChangeText={setQuery}
                  onSubmit={submitSearch}
                />
                <Icon onPress={() => {}} className="bg-yellow w-12 h-12">
                  <DotsThree size={24} color="#1D1D1D" weight="regular" />
                </Icon>
              </View>
              {isSearchActive && (
                <View className="w-[362px] self-center mt-3 mb-1 flex-row items-center justify-between">
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#F5D84E" />
                  ) : (
                    <Text className="text-white/40 font-nunito-600 text-sm">
                      {searchResults.length > 0
                        ? `${searchResults.length} results via ${searchSource === 'usda' ? 'USDA' : 'Open Food Facts'}`
                        : 'No results found'}
                    </Text>
                  )}
                </View>
              )}
              {!isSearchActive && <PopularMealsSection/>}
              {!isSearchActive && (
                <View className="w-[362px] self-center mt-8">
                  <View className="flex-row items-end justify-between">
                    <Text className="title">My Meals</Text>
                    <Button
                      onPress={() => {}}
                      icon={<Plus size={20} color="#1D1D1D" weight="bold" />}
                    >
                      Create
                    </Button>
                  </View>
                </View>
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
const Search = () => {
  return (
    <SearchProvider>
      <SearchContent />
    </SearchProvider>
  );
};
export default Search;