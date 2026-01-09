import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title,
    message,
    confirmText = 'Remove',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    destructive = true,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                destructive && styles.destructiveButton,
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.confirmText,
                                destructive && styles.destructiveText,
                            ]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    dialog: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    title: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    message: {
        color: colors.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.input,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    cancelText: {
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.input,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    confirmText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    destructiveButton: {
        backgroundColor: colors.accent,
    },
    destructiveText: {
        color: colors.main,
    },
});
