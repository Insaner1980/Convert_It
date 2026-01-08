// src/components/AnimatedInput.tsx
// Text input with animated focus border effect

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface AnimatedInputProps extends Omit<TextInputProps, 'style'> {
    containerStyle?: ViewStyle;
    inputStyle?: ViewStyle;
    large?: boolean; // For large number inputs (48px)
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
    containerStyle,
    inputStyle,
    large = false,
    onFocus,
    onBlur,
    ...props
}) => {
    const focus = useSharedValue(0);

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            focus.value,
            [0, 1],
            [colors.subtle, colors.accent]
        ),
        borderWidth: focus.value === 1 ? 2 : 1,
    }));

    const handleFocus: TextInputProps['onFocus'] = (e) => {
        focus.value = withTiming(1, { duration: 150 });
        onFocus?.(e);
    };

    const handleBlur: TextInputProps['onBlur'] = (e) => {
        focus.value = withTiming(0, { duration: 150 });
        onBlur?.(e);
    };

    return (
        <Animated.View style={[styles.container, containerStyle, animatedBorderStyle]}>
            <TextInput
                {...props}
                style={[
                    large ? styles.largeInput : styles.input,
                    inputStyle,
                ]}
                placeholderTextColor={colors.secondary}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    input: {
        fontFamily,
        fontSize: 16,
        color: colors.primary,
        padding: 12,
    },
    largeInput: {
        fontFamily,
        fontSize: 48,
        fontWeight: '300',
        color: colors.primary,
        padding: 16,
    },
});
