// src/components/ModalHeader.tsx
// Reusable modal header with title and close button

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
    /** Hide bottom border for seamless integration */
    noBorder?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, noBorder }) => {
    return (
        <View style={[styles.header, noBorder && styles.noBorder]}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={colors.secondary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
});
