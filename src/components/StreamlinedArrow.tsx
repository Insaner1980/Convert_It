// src/components/StreamlinedArrow.tsx
// Premium thick chevron arrow with smooth gradient

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface StreamlinedArrowProps {
    width?: number;
    height?: number;
    direction?: 'right' | 'left';
}

export const StreamlinedArrow: React.FC<StreamlinedArrowProps> = ({
    width = 80,
    height = 60,
    direction = 'right',
}) => {
    const isLeft = direction === 'left';

    // Viewbox dimensions
    const viewBoxWidth = 80;
    const viewBoxHeight = 60;

    // Thick chevron path - straight back edge, rounded back corners, sharp tip
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

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                style={isLeft ? styles.flipped : undefined}
            >
                <Defs>
                    <LinearGradient id="chevronGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                <Path
                    d={chevronPath}
                    fill="url(#chevronGradient)"
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    flipped: {
        transform: [{ scaleX: -1 }],
    },
});
