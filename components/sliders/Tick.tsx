import React, { FC } from "react";
import { View, Text } from 'react-native';

type TickProps = {
    val: number,
    isSelected: boolean,
    isMajor: boolean,
    isMinor: boolean,
    PIXELS_PER_UNIT: number
};
const Tick: FC<TickProps> = ({ val, isSelected, isMajor, isMinor, PIXELS_PER_UNIT }) => (
    <View style={{ width: PIXELS_PER_UNIT }} className="items-center justify-center h-full relative">
        <View
            style={{
                height: isSelected ? 42 : (isMajor ? 32 : (isMinor ? 20 : 10)),
                backgroundColor: isSelected ? '#1D1D1D' : (isMajor ? 'rgba(29, 29, 29, 0.8)' : 'rgba(29, 29, 29, 0.4)'),
                width: isSelected ? 3 : 2,
                borderRadius: 1.5
            }}
        />
        {isMajor && (
            <Text
                style={{ left: (PIXELS_PER_UNIT - 50) / 2 }}
                className={`text-md font-nunito-700 absolute bottom-0 w-[50px] text-center ${isSelected ? 'text-dark font-nunito-800' : 'text-dark/60'}`}
            >
                {val}
            </Text>
        )}
    </View>
);
export default React.memo(Tick);