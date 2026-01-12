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
import { fontFamily, getDynamicFontSize } from '../theme/typography';

interface MarqueeInputProps extends Omit<TextInputProps, 'style'> {
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    fontSize?: number;
    /** Use more aggressive font scaling for narrow containers */
    compactMode?: boolean;
}

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
                styles.baseText,
                { fontSize: dynamicSize },
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
    baseText: {
        fontFamily,
        fontWeight: '300',
        color: colors.primary,
    },
});
