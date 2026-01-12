// src/components/Toast.tsx
// Reusable toast notification component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme';

type ToastType = 'info' | 'success' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
    return (
        <View style={[styles.toast, type === 'success' && styles.toastSuccess]}>
            <Text style={styles.toastText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.card,
    },
    toastSuccess: {
        backgroundColor: colors.accent,
        ...shadows.glow,
    },
    toastText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
