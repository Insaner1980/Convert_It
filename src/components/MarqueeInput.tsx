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
}

/**
 * Calculate font size based on text length and container
 * Shrinks only when text is very long
 */
const getDynamicFontSize = (text: string, baseSize: number): number => {
    const len = text.length;
    if (len > 20) return Math.max(baseSize * 0.4, 14);
    if (len > 16) return Math.max(baseSize * 0.5, 16);
    if (len > 12) return Math.max(baseSize * 0.65, 20);
    return baseSize;
};

export const MarqueeInput: React.FC<MarqueeInputProps> = ({
    containerStyle,
    inputStyle,
    fontSize = 32,
    value = '',
    ...props
}) => {
    const dynamicSize = getDynamicFontSize(value, fontSize);

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
    },
});
