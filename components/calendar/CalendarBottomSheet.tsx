import { forwardRef, useState, useImperativeHandle } from "react";
import { Modal, TouchableWithoutFeedback, View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import BottomSheet from "@gorhom/bottom-sheet";

type CalendarBottomSheetProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    activeDates?: string[];
    targetDate?: string | null;
    minDate?: string | null;
    showStreak?: boolean;
    allowFuture?: boolean;
};
const CalendarBottomSheet = forwardRef<BottomSheet, CalendarBottomSheetProps>(({ selectedDate, onDateSelect, activeDates, targetDate, minDate, showStreak, allowFuture }, ref) => {
    //Hooks
    const [visible, setVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        expand: () => setVisible(true),
        snapToIndex: () => setVisible(true),
        snapToPosition: () => setVisible(true),
        collapse: () => setVisible(false),
        close: () => setVisible(false),
        forceClose: () => setVisible(false),
    } as any));
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View className="flex-1 bg-black/60 items-center justify-center px-6">
                    <TouchableWithoutFeedback>
                        <View 
                            className="w-full bg-black rounded-[32px] border border-white/10 overflow-hidden"
                            style={{
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.5,
                                shadowRadius: 20,
                                elevation: 10
                            }}
                        >
                            <View className="p-4">
                                <CustomCalendar 
                                    selectedDate={selectedDate}
                                    onDateSelect={(date) => {
                                        onDateSelect(date);
                                        setTimeout(() => {
                                            setVisible(false);
                                        }, 250);
                                    }}
                                    activeDates={activeDates}
                                    targetDate={targetDate}
                                    minDate={minDate}
                                    showStreak={showStreak}
                                    allowFuture={allowFuture}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
});
export default CalendarBottomSheet;