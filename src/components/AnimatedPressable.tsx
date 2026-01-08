// src/components/AnimatedPressable.tsx
// Reusable pressable component with scale animation

import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleValue?: number; // How much to scale down (default 0.97)
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
    children,
    style,
    scaleValue = 0.97,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: GestureResponderEvent) => {
        scale.value = withTiming(scaleValue, { duration: 100 });
        onPressIn?.(e);
    };

    const handlePressOut = (e: GestureResponderEvent) => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 400,
        });
        onPressOut?.(e);
    };

    return (
        <AnimatedPressableBase
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressableBase>
    );
};
