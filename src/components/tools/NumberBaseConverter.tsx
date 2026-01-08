// src/components/tools/NumberBaseConverter.tsx
// Convert between decimal, binary, octal, and hexadecimal

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type Base = 2 | 8 | 10 | 16;
type CopiedBase = Base | null;

const BASES: { id: Base; label: string; prefix: string }[] = [
    { id: 2, label: 'Binary', prefix: '0b' },
    { id: 8, label: 'Octal', prefix: '0o' },
    { id: 10, label: 'Decimal', prefix: '' },
    { id: 16, label: 'Hex', prefix: '0x' },
];

export const NumberBaseConverter: React.FC = () => {
    const [inputBase, setInputBase] = useState<Base>(10);
    const [inputValue, setInputValue] = useState('');
    const [copiedBase, setCopiedBase] = useState<CopiedBase>(null);

    const copyToClipboard = async (text: string, base: Base) => {
        await Clipboard.setStringAsync(text);
        setCopiedBase(base);
        setTimeout(() => setCopiedBase(null), 1500);
    };

    const conversions = useMemo(() => {
        if (!inputValue) return null;

        // Parse input in selected base
        const decimal = parseInt(inputValue, inputBase);
        if (isNaN(decimal) || decimal < 0) return null;

        return {
            2: decimal.toString(2),
            8: decimal.toString(8),
            10: decimal.toString(10),
            16: decimal.toString(16).toUpperCase(),
        };
    }, [inputValue, inputBase]);

    const validateInput = (text: string, base: Base): boolean => {
        if (!text) return true;
        const patterns: Record<Base, RegExp> = {
            2: /^[01]*$/,
            8: /^[0-7]*$/,
            10: /^\d*$/,
            16: /^[0-9A-Fa-f]*$/,
        };
        return patterns[base].test(text);
    };

    const handleInputChange = (text: string) => {
        if (validateInput(text, inputBase)) {
            setInputValue(text);
        }
    };

    return (
        <View style={styles.container}>
            {/* Base Selector */}
            <View style={styles.baseContainer}>
                {BASES.map((base) => (
                    <Pressable
                        key={base.id}
                        style={[
                            styles.baseButton,
                            inputBase === base.id && styles.baseButtonActive
                        ]}
                        onPress={() => {
                            setInputBase(base.id);
                            setInputValue('');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                        <Text
                            style={[
                                styles.baseButtonText,
                                inputBase === base.id && styles.baseButtonTextActive
                            ]}
                        >
                            {base.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Input */}
            <View style={styles.inputSection}>
                <Text style={styles.label}>
                    INPUT ({BASES.find(b => b.id === inputBase)?.label.toUpperCase()})
                </Text>
                <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                    autoCapitalize="characters"
                    keyboardType={inputBase === 10 ? 'numeric' : 'default'}
                />
            </View>

            {/* Results */}
            <View style={styles.resultsGrid}>
                {BASES.map((base) => {
                    const value = `${base.prefix}${conversions?.[base.id] || '0'}`;
                    return (
                        <TouchableOpacity
                            key={base.id}
                            style={styles.resultCard}
                            onPress={() => copyToClipboard(value, base.id)}
                            activeOpacity={0.7}
                        >
                            {copiedBase === base.id && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <Text style={styles.resultLabel}>{base.label}</Text>
                            <Text style={styles.resultValue}>{value}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16 },
    baseContainer: {
        flexDirection: 'row',
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    baseButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        minHeight: 44,
    },
    baseButtonActive: {
        backgroundColor: colors.accent,
    },
    baseButtonText: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
    },
    baseButtonTextActive: {
        color: colors.main,
    },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 8,
    },
    label: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    input: {
        fontFamily,
        fontSize: 32,
        fontWeight: '300',
        color: colors.primary,
    },
    resultsGrid: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.subtle,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultLabel: {
        fontFamily,
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
    },
    resultValue: {
        fontFamily,
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    copiedBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 1,
    },
    copiedText: {
        color: colors.main,
        fontSize: 10,
        fontWeight: '600',
    },
});
