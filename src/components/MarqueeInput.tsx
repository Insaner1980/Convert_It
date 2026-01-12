// src/components/MarqueeInput.tsx
// Text input with dynamic font size based on content length

import React from 'react';
import {
    TextInput,
    TextInputProps,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface MarqueeInputProps extends Omit<TextInputProps, 'style'> {
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    fontSize?: number;
    /** Use more aggressive font scaling for narrow containers */
    compactMode?: boolean;
}

/**
 * Calculate font size based on text length and container
 * @param text - The text to measure
 * @param baseSize - Base font size
 * @param compact - Use more aggressive scaling for narrow containers
 */
const getDynamicFontSize = (text: string, baseSize: number, compact: boolean = false): number => {
    const len = text.length;

    if (compact) {
        // Aggressive scaling for narrow containers (like fraction inputs)
        if (len > 10) return Math.max(baseSize * 0.35, 14);
        if (len > 8) return Math.max(baseSize * 0.45, 16);
        if (len > 6) return Math.max(baseSize * 0.55, 18);
        if (len > 4) return Math.max(baseSize * 0.7, 22);
        return baseSize;
    }

    // Normal scaling for full-width inputs
    if (len > 20) return Math.max(baseSize * 0.4, 14);
    if (len > 16) return Math.max(baseSize * 0.5, 16);
    if (len > 12) return Math.max(baseSize * 0.65, 20);
    return baseSize;
};

export const MarqueeInput: React.FC<MarqueeInputProps> = ({
    containerStyle,
    inputStyle,
    fontSize = 32,
    compactMode = false,
    value = '',
    ...props
}) => {
    const dynamicSize = getDynamicFontSize(value, fontSize, compactMode);

    return (
        <TextInput
            {...props}
            value={value}
            style={[
                styles.input,
                {
                    fontSize: dynamicSize,
                    fontFamily,
                    fontWeight: '300',
                    color: colors.primary,
                },
                inputStyle,
                containerStyle,
            ]}
            placeholderTextColor={colors.secondary}
            selectionColor={colors.accent}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        padding: 0,
        margin: 0,
        width: '100%',
    },
});
