// src/components/AnimatedSplash.tsx
// Animated splash screen with streamlined arrows and lens flare effect

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    runOnJS,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { colors } from '../theme/colors';
import { StreamlinedArrow } from './StreamlinedArrow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARROW_WIDTH = 100;
const ARROW_HEIGHT = 75;
const FLARE_HEIGHT = 20; // Height of the lens flare area
const CENTER_THICKNESS = 10; // Thickness at center
const ANIMATION_DURATION = 400;
const PAUSE_DURATION = 300;
const SHIMMER_DURATION = 1500;

interface AnimatedSplashProps {
    onComplete: () => void;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onComplete }) => {
    const topArrowX = useSharedValue(SCREEN_WIDTH);
    const bottomArrowX = useSharedValue(-SCREEN_WIDTH);
    const opacity = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    const shimmerPosition = useSharedValue(0);
    const pulseScale = useSharedValue(1);

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

        // Fade in glow after arrows arrive
        glowOpacity.value = withDelay(
            ANIMATION_DURATION - 100,
            withTiming(1, { duration: 200 })
        );

        // Pulse animation for center glow
        pulseScale.value = withDelay(
            ANIMATION_DURATION,
            withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            )
        );

        // Start shimmer animation - flows from left to right
        shimmerPosition.value = withDelay(
            ANIMATION_DURATION,
            withRepeat(
                withTiming(1, {
                    duration: SHIMMER_DURATION,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                false
            )
        );

        // Fade out after pause, then call onComplete
        opacity.value = withDelay(
            ANIMATION_DURATION + PAUSE_DURATION + SHIMMER_DURATION,
            withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(onComplete)();
                }
            })
        );
    }, [topArrowX, bottomArrowX, opacity, glowOpacity, shimmerPosition, pulseScale, onComplete]);

    const topArrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: topArrowX.value }],
    }));

    const bottomArrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bottomArrowX.value }],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const glowContainerStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const centerGlowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: interpolate(pulseScale.value, [1, 1.2], [0.8, 1]),
    }));

    const shimmerStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            shimmerPosition.value,
            [0, 1],
            [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5]
        );
        return {
            transform: [{ translateX }],
        };
    });

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.arrowsContainer}>
                {/* Top arrow - pointing right */}
                <Animated.View style={[styles.arrowWrapper, topArrowStyle]}>
                    <StreamlinedArrow
                        width={ARROW_WIDTH}
                        height={ARROW_HEIGHT}
                        direction="right"
                    />
                </Animated.View>

                {/* Lens Flare Effect */}
                <Animated.View style={[styles.flareContainer, glowContainerStyle]}>
                    {/* Base ray - full width, tapered */}
                    <Svg width={SCREEN_WIDTH} height={FLARE_HEIGHT} style={styles.flareSvg}>
                        <Defs>
                            <LinearGradient id="rayGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                                <Stop offset="0%" stopColor={colors.accent} stopOpacity="0" />
                                <Stop offset="15%" stopColor={colors.accent} stopOpacity="0.3" />
                                <Stop offset="40%" stopColor={colors.accent} stopOpacity="0.6" />
                                <Stop offset="50%" stopColor={colors.accent} stopOpacity="0.9" />
                                <Stop offset="60%" stopColor={colors.accent} stopOpacity="0.6" />
                                <Stop offset="85%" stopColor={colors.accent} stopOpacity="0.3" />
                                <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        {/* Tapered diamond shape - thicker in middle */}
                        <Ellipse
                            cx={SCREEN_WIDTH / 2}
                            cy={FLARE_HEIGHT / 2}
                            rx={SCREEN_WIDTH / 2}
                            ry={2}
                            fill="url(#rayGradient)"
                        />
                    </Svg>

                    {/* Secondary ray - slightly thicker */}
                    <Svg width={SCREEN_WIDTH} height={FLARE_HEIGHT} style={[styles.flareSvg, styles.flareLayer2]}>
                        <Defs>
                            <LinearGradient id="rayGradient2" x1="0%" y1="50%" x2="100%" y2="50%">
                                <Stop offset="0%" stopColor="#e8b8a8" stopOpacity="0" />
                                <Stop offset="25%" stopColor="#e8b8a8" stopOpacity="0.2" />
                                <Stop offset="45%" stopColor="#daa090" stopOpacity="0.5" />
                                <Stop offset="50%" stopColor="#c98878" stopOpacity="0.8" />
                                <Stop offset="55%" stopColor="#daa090" stopOpacity="0.5" />
                                <Stop offset="75%" stopColor="#e8b8a8" stopOpacity="0.2" />
                                <Stop offset="100%" stopColor="#e8b8a8" stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        <Ellipse
                            cx={SCREEN_WIDTH / 2}
                            cy={FLARE_HEIGHT / 2}
                            rx={SCREEN_WIDTH * 0.4}
                            ry={3}
                            fill="url(#rayGradient2)"
                        />
                    </Svg>

                    {/* Center glow - bright core */}
                    <Animated.View style={[styles.centerGlow, centerGlowStyle]}>
                        <Svg width={100} height={FLARE_HEIGHT}>
                            <Defs>
                                <LinearGradient id="centerGlow" x1="0%" y1="50%" x2="100%" y2="50%">
                                    <Stop offset="0%" stopColor={colors.primary} stopOpacity="0" />
                                    <Stop offset="30%" stopColor="#e8b8a8" stopOpacity="0.6" />
                                    <Stop offset="50%" stopColor={colors.primary} stopOpacity="1" />
                                    <Stop offset="70%" stopColor="#e8b8a8" stopOpacity="0.6" />
                                    <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                                </LinearGradient>
                            </Defs>
                            <Ellipse
                                cx={50}
                                cy={FLARE_HEIGHT / 2}
                                rx={40}
                                ry={CENTER_THICKNESS / 2}
                                fill="url(#centerGlow)"
                            />
                        </Svg>
                    </Animated.View>

                    {/* Shimmer - moving highlight across the flare */}
                    <View style={styles.shimmerMask}>
                        <Animated.View style={[styles.shimmerWrapper, shimmerStyle]}>
                            <Svg width={120} height={FLARE_HEIGHT}>
                                <Defs>
                                    <LinearGradient id="shimmerGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                                        <Stop offset="0%" stopColor={colors.primary} stopOpacity="0" />
                                        <Stop offset="40%" stopColor={colors.primary} stopOpacity="0.4" />
                                        <Stop offset="50%" stopColor={colors.primary} stopOpacity="0.8" />
                                        <Stop offset="60%" stopColor={colors.primary} stopOpacity="0.4" />
                                        <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                                    </LinearGradient>
                                </Defs>
                                <Ellipse
                                    cx={60}
                                    cy={FLARE_HEIGHT / 2}
                                    rx={50}
                                    ry={4}
                                    fill="url(#shimmerGrad)"
                                />
                            </Svg>
                        </Animated.View>
                    </View>
                </Animated.View>

                {/* Bottom arrow - pointing left */}
                <Animated.View style={[styles.arrowWrapper, bottomArrowStyle]}>
                    <StreamlinedArrow
                        width={ARROW_WIDTH}
                        height={ARROW_HEIGHT}
                        direction="left"
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
        gap: 8,
    },
    arrowWrapper: {
        alignItems: 'center',
    },
    flareContainer: {
        width: SCREEN_WIDTH,
        height: FLARE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flareSvg: {
        position: 'absolute',
    },
    flareLayer2: {
        opacity: 0.8,
    },
    centerGlow: {
        position: 'absolute',
    },
    shimmerMask: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shimmerWrapper: {
        position: 'absolute',
        left: '50%',
        marginLeft: -60,
        height: '100%',
    },
});
