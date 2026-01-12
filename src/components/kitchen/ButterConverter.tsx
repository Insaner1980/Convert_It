// src/components/kitchen/ButterConverter.tsx
// Convert between butter sticks and weight measurements

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { shadows } from '../../theme';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';

type ButterUnit = 'sticks' | 'tbsp' | 'cups' | 'grams' | 'oz';

const BUTTER_UNITS: { id: ButterUnit; label: string; grams: number }[] = [
    { id: 'sticks', label: 'Sticks (US)', grams: 113.4 },  // 1 US stick = 113.4g
    { id: 'tbsp', label: 'Tablespoons', grams: 14.175 },   // 1 stick = 8 tbsp
    { id: 'cups', label: 'Cups', grams: 226.8 },           // 1 cup = 2 sticks
    { id: 'grams', label: 'Grams', grams: 1 },
    { id: 'oz', label: 'Ounces', grams: 28.35 },
];

export const ButterConverter: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [fromUnit, setFromUnit] = useState<ButterUnit>('sticks');
    const [copiedUnit, setCopiedUnit] = useState<ButterUnit | null>(null);
    const { copyToClipboard } = useClipboard();

    const handleCopy = async (text: string, unit: ButterUnit) => {
        await copyToClipboard(text);
        setCopiedUnit(unit);
        setTimeout(() => setCopiedUnit(null), 1500);
    };

    const conversions = useMemo(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return null;

        const fromFactor = BUTTER_UNITS.find(u => u.id === fromUnit)!.grams;
        const grams = val * fromFactor;

        return BUTTER_UNITS.map(unit => ({
            ...unit,
            amount: unit.id === 'grams'
                ? Math.round(grams).toString()
                : (grams / unit.grams).toFixed(unit.id === 'tbsp' ? 1 : 2),
        }));
    }, [amount, fromUnit]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>BUTTER CONVERTER</Text>

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
                </View>
            </View>

            {/* Unit Selector */}
            <View style={styles.unitSelector}>
                {BUTTER_UNITS.slice(0, 3).map((unit) => (
                    <TouchableOpacity
                        key={unit.id}
                        style={[
                            styles.unitButton,
                            fromUnit === unit.id && styles.unitButtonActive
                        ]}
                        onPress={() => setFromUnit(unit.id)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.unitButtonText,
                                fromUnit === unit.id && styles.unitButtonTextActive
                            ]}
                        >
                            {unit.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.unitSelector}>
                {BUTTER_UNITS.slice(3).map((unit) => (
                    <TouchableOpacity
                        key={unit.id}
                        style={[
                            styles.unitButton,
                            fromUnit === unit.id && styles.unitButtonActive
                        ]}
                        onPress={() => setFromUnit(unit.id)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.unitButtonText,
                                fromUnit === unit.id && styles.unitButtonTextActive
                            ]}
                        >
                            {unit.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results - only show conversions to OTHER units */}
            {conversions && (
                <View style={styles.results}>
                    {conversions.filter(conv => conv.id !== fromUnit).map((conv) => (
                        <TouchableOpacity
                            key={conv.id}
                            style={styles.resultCard}
                            onPress={() => handleCopy(conv.amount, conv.id)}
                            activeOpacity={0.7}
                        >
                            {copiedUnit === conv.id && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <Text style={styles.resultLabel}>{conv.label}</Text>
                            <Text style={styles.resultValue}>
                                {conv.amount}
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
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    unitButton: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    unitButtonActive: {
        backgroundColor: colors.accent,
    },
    unitButtonText: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        color: colors.secondary,
    },
    unitButtonTextActive: {
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
