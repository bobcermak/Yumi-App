import { PencilSimple, Trash, Check } from "phosphor-react-native";
import { type FC, useState, useMemo, useEffect } from "react";
import { Text, TouchableOpacity, View, TextInput } from "react-native";

export type MealIngredientProps = {
    title: string;
    cal: number;
    baseCal?: number;
    amount?: string;
    onDelete?: () => void;
    onEdit?: (newCal: number) => void;
}
const MealIngredient: FC<MealIngredientProps> = ({ title, cal, baseCal, amount, onDelete, onEdit }) => {
    //Hooks
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

    //Functions
    const handleDelete = () => {
        onDelete?.();
    };
    const handleEditToggle = () => {
        if (isEditing) {
            const newCal = Number(editedCal) || 0;
            if (editedCal.trim() === '') {
                setEditedCal(String(cal));
            } else if (newCal !== cal) {
                onEdit?.(newCal);
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
                <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash size={20} color="#CA877E" weight="regular" />
                </TouchableOpacity>
                <View className="flex-row items-center gap-1 flex-1">
                    {amount && (
                        <Text className="base-text font-nunito-800 text-base shrink-0">{amount}</Text>
                    )}
                    <Text className="base-text font-nunito-600 text-base flex-1" numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                </View>
            </View>
            <View className="flex-row items-center gap-2 shrink-0">
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
                <TouchableOpacity onPress={handleEditToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {isEditing ? (
                        <Check size={16} color="#84C754" weight="bold"/>
                    ) : (
                        <PencilSimple size={16} color="#FFFFFF80" weight="regular"/>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
export default MealIngredient;