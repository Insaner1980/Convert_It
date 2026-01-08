// src/components/kitchen/YeastConverter.tsx
// Convert between different yeast types

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type YeastType = 'fresh' | 'active' | 'instant';

const YEAST_TYPES: { id: YeastType; label: string; factor: number }[] = [
    { id: 'fresh', label: 'Fresh Yeast', factor: 1 },       // Base (100%)
    { id: 'active', label: 'Active Dry', factor: 0.4 },     // 40% of fresh
    { id: 'instant', label: 'Instant/Rapid', factor: 0.33 }, // 33% of fresh (1/3)
];

export const YeastConverter: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [fromType, setFromType] = useState<YeastType>('fresh');
    const [copiedType, setCopiedType] = useState<YeastType | null>(null);

    const copyToClipboard = async (text: string, type: YeastType) => {
        await Clipboard.setStringAsync(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 1500);
    };

    const conversions = useMemo(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return null;

        const fromFactor = YEAST_TYPES.find(y => y.id === fromType)!.factor;
        const freshEquivalent = val / fromFactor; // Convert to fresh first

        return YEAST_TYPES.map(yeast => ({
            ...yeast,
            amount: (freshEquivalent * yeast.factor).toFixed(1),
        }));
    }, [amount, fromType]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>YEAST CONVERTER</Text>

            {/* Input */}
            <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.secondary}
                    />
                    <Text style={styles.inputUnit}>g</Text>
                </View>
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
                {YEAST_TYPES.map((yeast) => (
                    <View
                        key={yeast.id}
                        style={[
                            styles.typeButton,
                            fromType === yeast.id && styles.typeButtonActive
                        ]}
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                fromType === yeast.id && styles.typeButtonTextActive
                            ]}
                            onPress={() => setFromType(yeast.id)}
                        >
                            {yeast.label}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Results */}
            {conversions && (
                <View style={styles.results}>
                    {conversions.map((conv) => (
                        <TouchableOpacity
                            key={conv.id}
                            style={[
                                styles.resultCard,
                                conv.id === fromType && styles.resultCardActive
                            ]}
                            onPress={() => copyToClipboard(`${conv.amount}g`, conv.id)}
                            activeOpacity={0.7}
                        >
                            {copiedType === conv.id && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <Text style={styles.resultLabel}>{conv.label}</Text>
                            <Text style={[
                                styles.resultValue,
                                conv.id === fromType && styles.resultValueActive
                            ]}>
                                {conv.amount}g
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.hint}>
                Fresh yeast = 2.5× Active Dry = 3× Instant
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 12 },
    sectionTitle: {
        fontFamily,
        fontSize: 11,
        fontWeight: '700',
        color: colors.secondary,
        letterSpacing: 1,
    },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    input: {
        fontFamily,
        fontSize: 40,
        fontWeight: '300',
        color: colors.primary,
        textAlign: 'center',
        minWidth: 100,
    },
    inputUnit: {
        fontFamily,
        fontSize: 24,
        color: colors.secondary,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: colors.accent,
    },
    typeButtonText: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        color: colors.secondary,
    },
    typeButtonTextActive: {
        color: colors.main,
    },
    results: {
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
    resultCardActive: {
        borderColor: colors.accent,
    },
    resultLabel: {
        fontFamily,
        fontSize: 14,
        color: colors.secondary,
    },
    resultValue: {
        fontFamily,
        fontSize: 20,
        fontWeight: '600',
        color: colors.primary,
    },
    resultValueActive: {
        color: colors.accent,
    },
    hint: {
        fontFamily,
        fontSize: 11,
        color: colors.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
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
