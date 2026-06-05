import { Icon, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, MagnifyingGlass } from "phosphor-react-native";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SearchResults = () => {
  //Router
  const router = useRouter();
  const insets = useSafeAreaInsets();
  //Context
  const { searchResults, isSearching, searchSource, query, popularMeals } = useSearchContext();
  const { mealType, logDate, source } = useLocalSearchParams<{ mealType?: string; logDate?: string; source?: string }>();

  return (
    <View className="flex-1 mt-[56px]">
      <View className="flex-row w-[380px] self-center justify-center items-center py-4">
        <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular"/>
        </Icon>
        <Text className="font-nunito-700 text-[28px] text-white">Results</Text>
      </View>
      <View className="flex-row items-center justify-between px-8 mb-4 mt-8">
        <Text className="text-white/50 font-nunito-700 text-lg flex-1 mr-3" numberOfLines={1} ellipsizeMode="tail">
          {query ? `Results for "${query}"` : "Search Results"}
        </Text>
        {!isSearching && searchResults.length > 0 && searchSource && (
          <Text className="text-white/30 font-nunito-600 text-sm flex-shrink-0">
            via {searchSource === 'usda' ? "Homemade" : "Packaged"}
          </Text>
        )}
      </View>
      {isSearching ? (
        <View className="px-4">
          {Array.from({ length: 10 }).map((_, i) => <SearchResultSkeleton key={`skel-${i}`} />)}
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, gap: 2 }}
          renderItem={({ item }) => {
            const isFav = (popularMeals || []).some(p => p?.name?.toLowerCase() === item?.name?.toLowerCase() && (p?.barcode === item?.barcode || !item?.barcode));
            return (
              <SearchResultItem
                item={item}
                showArrow
                onPress={() => router.push({
                  pathname: "/search-item/[id]",
                  params: {
                    id: item.id,
                    item: JSON.stringify(item),
                    isFavorite: isFav ? 'true' : 'false',
                    ...(source === "addMore" ? { mealType, ...(logDate ? { logDate } : {}), source: "addMore" } : {})
                  }
                })}
              />
            );
          }}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <View className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
            <MagnifyingGlass size={40} color="#C5E384" weight="duotone"/>
          </View>
          <Text className="text-white/40 font-nunito-600 text-lg text-center px-6">
            No food found... 🥑 Try a different search!
          </Text>
        </View>
      )}
    </View>
  );
};
export default SearchResults;