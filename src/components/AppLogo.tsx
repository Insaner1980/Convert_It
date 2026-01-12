// src/components/AppLogo.tsx
// App logo with two chevron arrows - same style as splash screen

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface AppLogoProps {
    size?: number;
    color?: string; // If provided, uses solid color instead of gradient
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 36, color }) => {
    const arrowWidth = size * 0.8;
    const arrowHeight = size * 0.4;
    const gap = size * 0.05;

    // Viewbox dimensions
    const viewBoxWidth = 80;
    const viewBoxHeight = 60;

    // Same chevron path as StreamlinedArrow - straight back edge, rounded back corners, sharp tip
    const chevronPath = `
        M 8 12
        Q 8 4, 16 4
        L 68 30
        L 16 56
        Q 8 56, 8 48
        L 8 40
        L 36 30
        L 8 20
        L 8 12
        Z
    `;

    // Use solid color if provided, otherwise use gradient
    const fillRight = color || "url(#logoGradientRight)";
    const fillLeft = color || "url(#logoGradientLeft)";

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={[styles.arrowsRow, { gap }]}>
                {/* Right-pointing arrow */}
                <Svg
                    width={arrowWidth}
                    height={arrowHeight}
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                >
                    {!color && (
                        <Defs>
                            <LinearGradient id="logoGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#3d2520" stopOpacity="1" />
                                <Stop offset="12%" stopColor="#5a3530" stopOpacity="1" />
                                <Stop offset="25%" stopColor="#7a4a40" stopOpacity="1" />
                                <Stop offset="40%" stopColor="#996055" stopOpacity="1" />
                                <Stop offset="55%" stopColor="#b87565" stopOpacity="1" />
                                <Stop offset="70%" stopColor="#c98878" stopOpacity="1" />
                                <Stop offset="85%" stopColor="#daa090" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#e8b8a8" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                    )}
                    <Path
                        d={chevronPath}
                        fill={fillRight}
                    />
                </Svg>

                {/* Left-pointing arrow (flipped) */}
                <Svg
                    width={arrowWidth}
                    height={arrowHeight}
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    style={styles.flipped}
                >
                    {!color && (
                        <Defs>
                            <LinearGradient id="logoGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="#3d2520" stopOpacity="1" />
                                <Stop offset="12%" stopColor="#5a3530" stopOpacity="1" />
                                <Stop offset="25%" stopColor="#7a4a40" stopOpacity="1" />
                                <Stop offset="40%" stopColor="#996055" stopOpacity="1" />
                                <Stop offset="55%" stopColor="#b87565" stopOpacity="1" />
                                <Stop offset="70%" stopColor="#c98878" stopOpacity="1" />
                                <Stop offset="85%" stopColor="#daa090" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#e8b8a8" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                    )}
                    <Path
                        d={chevronPath}
                        fill={fillLeft}
                    />
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowsRow: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    flipped: {
        transform: [{ scaleX: -1 }],
    },
});
