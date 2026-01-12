// src/components/PickerModal.tsx
// Reusable picker modal component

import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Pressable,
    StyleSheet,
} from 'react-native';
import { X, Check, Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme';

export interface PickerOption {
    label: string;
    value: string;
}

interface PickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: PickerOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onAdd?: () => void;
}

export const PickerModal: React.FC<PickerModalProps> = ({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
    onAdd,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    selectedValue === item.value && styles.modalOptionSelected
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    selectedValue === item.value && styles.modalOptionTextSelected
                                ]}>
                                    {item.label}
                                </Text>
                                {selectedValue === item.value && (
                                    <Check size={20} color={colors.accent} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                    {onAdd && (
                        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                            <View style={styles.addButtonIcon}>
                                <Plus size={18} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle + '40',
    },
    modalOptionSelected: {
        // No background - only text and checkmark highlighted
    },
    modalOptionText: {
        fontSize: 16,
        color: colors.primary,
    },
    modalOptionTextSelected: {
        color: colors.accent,
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.subtle,
        backgroundColor: colors.elevated,
    },
    addButtonIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button,
    },
});
