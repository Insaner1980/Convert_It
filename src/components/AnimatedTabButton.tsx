// src/components/AnimatedTabButton.tsx
// Animated tab/pill button with scale bounce and color transition

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface AnimatedTabButtonProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const AnimatedTabButton: React.FC<AnimatedTabButtonProps> = ({
    label,
    isActive,
    onPress,
    icon,
    style,
}) => {
    const scale = useSharedValue(1);
    const progress = useSharedValue(isActive ? 1 : 0);

    // Update progress when active state changes
    React.useEffect(() => {
        progress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    }, [isActive, progress]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', colors.accent]
        ),
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            [colors.secondary, colors.main]
        ),
    }));

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        // Bounce effect
        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 400,
        });
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.container, style, animatedContainerStyle]}>
                {icon}
                <Animated.Text style={[styles.label, animatedTextStyle]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    label: {
        fontFamily,
        fontSize: 12,
        fontWeight: '500',
    },
});
