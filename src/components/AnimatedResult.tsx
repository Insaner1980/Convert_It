// src/components/AnimatedResult.tsx
// Result display with smooth value change animation

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface AnimatedResultProps {
    value: string;
    unit?: string;
    style?: ViewStyle;
}

export const AnimatedResult: React.FC<AnimatedResultProps> = ({
    value,
    unit,
    style,
}) => {
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    // Animate when value changes
    useEffect(() => {
        // Quick fade out and slide up, then fade in from below
        opacity.value = withSequence(
            withTiming(0, { duration: 100 }),
            withTiming(1, { duration: 200 })
        );
        translateY.value = withSequence(
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 0 }), // Jump to below
            withTiming(0, { duration: 200 })
        );
    }, [value, opacity, translateY]);

    const animatedValueStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={[styles.container, style]}>
            <Animated.Text style={[styles.value, animatedValueStyle]}>
                {value}
            </Animated.Text>
            {unit && (
                <Animated.Text style={[styles.unit, animatedValueStyle]}>
                    {unit}
                </Animated.Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 8,
    },
    value: {
        fontFamily,
        fontSize: 48,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    unit: {
        fontFamily,
        fontSize: 18,
        color: colors.secondary,
    },
});
