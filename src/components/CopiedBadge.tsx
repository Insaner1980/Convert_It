// src/components/CopiedBadge.tsx
// Reusable "Copied!" badge component for tap-to-copy feedback

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme';

interface CopiedBadgeProps {
    /** Use 'small' for compact result cards, 'default' for larger containers */
    size?: 'small' | 'default';
}

export const CopiedBadge: React.FC<CopiedBadgeProps> = ({ size = 'default' }) => {
    const isSmall = size === 'small';

    return (
        <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeDefault]}>
            <Text style={[styles.text, isSmall && styles.textSmall]}>Copied!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        backgroundColor: colors.accent,
        zIndex: 1,
        ...shadows.glow,
    },
    badgeDefault: {
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeSmall: {
        top: 4,
        right: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    text: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    textSmall: {
        fontSize: 10,
    },
});
