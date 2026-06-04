import { Check, PencilSimple, Trash } from "phosphor-react-native";
import { type FC, useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useIndexContext } from "@/lib/hooks/useIndexContext";

export type MealIngredientProps = {
    title: string,
    cal: number,
    baseCal?: number,
    count?: number,
    onDelete?: () => void,
    onEdit?: (newCal: number) => void,
    onItemPress?: () => void,
}
const MealIngredient: FC<MealIngredientProps> = ({ title, cal, baseCal, count, onDelete, onEdit, onItemPress }) => {
    const { showToast } = useIndexContext();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedCal, setEditedCal] = useState<string>(String(cal));
    const calculatedBaseCal = useMemo(() => {
        if (baseCal !== undefined && cal > 0) {
            const ratio = baseCal / cal;
            const currentTotal = Number(editedCal) || 0;
            return Number((currentTotal * ratio).toFixed(1));
        }
        return baseCal;
    }, [editedCal, baseCal, cal]);

    const handleEditToggle = () => {
        if (isEditing) {
            const newCal = Number(editedCal) || 0;
            if (editedCal.trim() === '') {
                setEditedCal(String(cal));
            } else if (newCal !== cal) {
                onEdit?.(newCal);
                showToast("Calories updated", undefined, 'success');
            }
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };
    useEffect(() => {
        setEditedCal(String(cal));
    }, [cal]);
    return (
        <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-2 flex-1 mr-4">
                <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash size={20} color="#CA877E" weight="regular" />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.25}
                    onPress={() => { if (!isEditing) onItemPress?.(); }}
                    className="flex-1 flex-row items-center gap-1"
                >
                    {count !== undefined && count > 1 && (
                        <Text className="base-text font-nunito-800 text-base shrink-0">{count}x</Text>
                    )}
                    <Text className="base-text font-nunito-600 text-base flex-1" numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleEditToggle}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center gap-2 shrink-0"
            >
                <View className="flex-row items-center gap-1 shrink-0">
                    {calculatedBaseCal !== undefined && !isEditing && (
                        <Text className="base-text font-nunito-700 text-sm text-white/40 shrink-0">({calculatedBaseCal})</Text>
                    )}
                    {isEditing ? (
                        <TextInput
                            className="base-text font-nunito-800 text-sm text-white bg-white/10 px-2 py-0.5 rounded"
                            value={editedCal}
                            onChangeText={setEditedCal}
                            keyboardType="numeric"
                            autoFocus
                            onSubmitEditing={handleEditToggle}
                            style={{ minWidth: 45, textAlign: 'center' }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        />
                    ) : (
                        <Text className="base-text font-nunito-800 text-sm shrink-0" numberOfLines={1}>{editedCal} cal</Text>
                    )}
                </View>
                {isEditing ? (
                    <Check size={16} color="#84C754" weight="bold" />
                ) : (
                    <PencilSimple size={16} color="#FFFFFF80" weight="regular" />
                )}
            </TouchableOpacity>
        </View>
    );
}
export default MealIngredient;