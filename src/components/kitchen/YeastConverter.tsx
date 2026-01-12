// src/components/kitchen/YeastConverter.tsx
// Convert between different yeast types

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { shadows } from '../../theme';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';

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
    const { copyToClipboard } = useClipboard();

    const handleCopy = async (text: string, type: YeastType) => {
        await copyToClipboard(text);
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
                    <MarqueeInput
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputStyle}
                        fontSize={40}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        maxLength={10}
                    />
                    <Text style={styles.inputUnit}>g</Text>
                </View>
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
                {YEAST_TYPES.map((yeast) => (
                    <TouchableOpacity
                        key={yeast.id}
                        style={[
                            styles.typeButton,
                            fromType === yeast.id && styles.typeButtonActive
                        ]}
                        onPress={() => setFromType(yeast.id)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                fromType === yeast.id && styles.typeButtonTextActive
                            ]}
                        >
                            {yeast.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results - only show conversions to OTHER types */}
            {conversions && (
                <View style={styles.results}>
                    {conversions.filter(conv => conv.id !== fromType).map((conv) => (
                        <TouchableOpacity
                            key={conv.id}
                            style={styles.resultCard}
                            onPress={() => handleCopy(`${conv.amount}g`, conv.id)}
                            activeOpacity={0.7}
                        >
                            {copiedType === conv.id && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <Text style={styles.resultLabel}>{conv.label}</Text>
                            <Text style={styles.resultValue}>
                                {conv.amount}g
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

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
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        ...shadows.card,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputContainer: {
        flex: 1,
        minHeight: 50,
    },
    inputStyle: {
        textAlign: 'center',
    },
    inputUnit: {
        fontFamily,
        fontSize: 24,
        color: colors.secondary,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    typeButton: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderRadius: 12,
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
        color: colors.primary,
    },
    results: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.card,
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
    copiedBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 1,
        ...shadows.glow,
    },
    copiedText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '600',
    },
});
