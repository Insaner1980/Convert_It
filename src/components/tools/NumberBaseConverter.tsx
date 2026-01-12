// src/components/tools/NumberBaseConverter.tsx
// Convert between decimal, binary, octal, and hexadecimal

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { shadows } from '../../theme';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';
import { CopiedBadge } from '../CopiedBadge';

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
    const { copyToClipboard } = useClipboard();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleCopy = async (text: string, base: Base) => {
        await copyToClipboard(text);
        setCopiedBase(base);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopiedBase(null), 1500);
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
                <MarqueeInput
                    containerStyle={styles.inputContainer}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    placeholder="0"
                    autoCapitalize="characters"
                    keyboardType={inputBase === 16 ? 'default' : 'numeric'}
                    maxLength={32}
                />
            </View>

            {/* Results - show only other bases, not the input base */}
            <View style={styles.resultsGrid}>
                {BASES.filter((base) => base.id !== inputBase).map((base) => {
                    const value = `${base.prefix}${conversions?.[base.id] || '0'}`;
                    return (
                        <TouchableOpacity
                            key={base.id}
                            style={styles.resultCard}
                            onPress={() => handleCopy(value, base.id)}
                            activeOpacity={0.7}
                        >
                            {copiedBase === base.id && <CopiedBadge size="small" />}
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
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        ...shadows.card,
    },
    baseButton: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
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
        color: colors.primary,
    },
    inputSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        ...shadows.card,
    },
    label: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    inputContainer: {
        flex: 1,
        minHeight: 44,
    },
    resultsGrid: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        ...shadows.card,
    },
    resultLabel: {
        fontFamily,
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
        flexShrink: 0,
    },
    resultValue: {
        fontFamily,
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
});
