// src/components/PickerButton.tsx
// Reusable picker button component with press animation

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { AnimatedPressable } from './AnimatedPressable';

interface PickerButtonProps {
    value: string;
    onPress: () => void;
    label?: string; // Optional label (not used in all contexts)
}

export const PickerButton: React.FC<PickerButtonProps> = ({ value, onPress }) => (
    <AnimatedPressable style={styles.pickerButton} onPress={onPress}>
        <Text style={styles.pickerButtonText} numberOfLines={1}>{value}</Text>
        <ChevronDown size={18} color={colors.secondary} />
    </AnimatedPressable>
);

const styles = StyleSheet.create({
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    pickerButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.primary,
        flex: 1,
    },
});
