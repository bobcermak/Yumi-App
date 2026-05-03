import { useMemo, forwardRef } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Plus } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

const DashboardSheet = forwardRef<BottomSheet>((props, ref) => {
  //Hooks
  const snapPoints = useMemo(() => [105, "20%", "35%", "50%", "65%", "80%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={3}
      snapPoints={snapPoints}
      detached={false}
      bottomInset={0}
      backgroundStyle={{ 
        backgroundColor: '#121212', 
      }}
      style={{
        marginHorizontal: 16,
        borderRadius: 40,
        overflow: 'hidden',
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#FFFFFF10'
      }}
      handleIndicatorStyle={{ 
        backgroundColor: '#FFFFFF', 
        width: 40, 
        height: 4, 
        borderRadius: 100 ,
        marginTop: 12
      }}
      enableOverDrag={false}
    >
      <BottomSheetView>
        <View className="px-5">
          <View className="flex-row justify-between items-center my-10 pb-5">
            <Text className="text-white text-xl font-nunito-800">Today&apos;s Food</Text>
            <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} className="bg-yellow w-[36px] h-[36px] rounded-full justify-center items-center"
              style={{
                shadowColor: "#C5E384",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }}
            >
              <Plus size={24} color="#1D1D1D" weight="regular"/>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});
export default DashboardSheet;