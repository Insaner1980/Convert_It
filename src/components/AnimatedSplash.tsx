// src/components/AnimatedSplash.tsx
// Animated splash screen with sliding arrows

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARROW_WIDTH = 180;
const ARROW_HEIGHT = 120;
const ANIMATION_DURATION = 400;
const PAUSE_DURATION = 300;

// Import arrow images
const arrowRight = require('../../assets/splash-arrow-right.png');
const arrowLeft = require('../../assets/splash-arrow-left.png');

interface AnimatedSplashProps {
    onComplete: () => void;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onComplete }) => {
    const topArrowX = useSharedValue(SCREEN_WIDTH);
    const bottomArrowX = useSharedValue(-SCREEN_WIDTH);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Animate arrows sliding in
        topArrowX.value = withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
        });

        bottomArrowX.value = withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
        });

        // Fade out after pause, then call onComplete
        opacity.value = withDelay(
            ANIMATION_DURATION + PAUSE_DURATION,
            withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(onComplete)();
                }
            })
        );
    }, [topArrowX, bottomArrowX, opacity, onComplete]);

    const topArrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: topArrowX.value }],
    }));

    const bottomArrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bottomArrowX.value }],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.arrowsContainer}>
                <Animated.View style={[styles.arrowWrapper, topArrowStyle]}>
                    <Image
                        source={arrowRight}
                        style={styles.arrowImage}
                        resizeMode="contain"
                    />
                </Animated.View>
                <Animated.View style={[styles.arrowWrapper, bottomArrowStyle]}>
                    <Image
                        source={arrowLeft}
                        style={styles.arrowImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    arrowsContainer: {
        alignItems: 'center',
        gap: 24,
    },
    arrowWrapper: {
        alignItems: 'center',
    },
    arrowImage: {
        width: ARROW_WIDTH,
        height: ARROW_HEIGHT,
    },
});
