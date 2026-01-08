// src/components/tools/FractionDecimalConverter.tsx
// Convert between fractions and decimals

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type Mode = 'toDecimal' | 'toFraction';

// Greatest Common Divisor using Euclidean algorithm
const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
};

// Convert decimal to fraction
const decimalToFraction = (decimal: number, maxDenominator: number = 1000): { num: number; den: number } | null => {
    if (isNaN(decimal)) return null;

    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);

    let bestNum = 0;
    let bestDen = 1;
    let bestError = Math.abs(decimal);

    for (let den = 1; den <= maxDenominator; den++) {
        const num = Math.round(decimal * den);
        const error = Math.abs(decimal - num / den);
        if (error < bestError) {
            bestError = error;
            bestNum = num;
            bestDen = den;
        }
        if (error === 0) break;
    }

    const divisor = gcd(bestNum, bestDen);
    return { num: sign * bestNum / divisor, den: bestDen / divisor };
};

export const FractionDecimalConverter: React.FC = () => {
    const [mode, setMode] = useState<Mode>('toDecimal');
    const [numerator, setNumerator] = useState('');
    const [denominator, setDenominator] = useState('');
    const [decimalInput, setDecimalInput] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        await Clipboard.setStringAsync(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

    // Helper function to convert improper fraction to mixed number
    const getMixedNumber = (num: number, den: number): string | null => {
        if (Math.abs(num) < den) return null;
        const whole = Math.floor(num / den);
        const remainder = Math.abs(num % den);
        if (remainder === 0) return whole.toString();
        return `${whole} ${remainder}/${den}`;
    };

    const result = useMemo(() => {
        if (mode === 'toDecimal') {
            const num = parseInt(numerator);
            const den = parseInt(denominator);
            if (isNaN(num) || isNaN(den) || den === 0) return null;
            const decimal = num / den;
            return {
                decimal: decimal.toString(),
                percentage: (decimal * 100).toFixed(2) + '%',
            };
        } else {
            const dec = parseFloat(decimalInput);
            if (isNaN(dec)) return null;
            const fraction = decimalToFraction(dec);
            if (!fraction) return null;
            return {
                fraction: `${fraction.num}/${fraction.den}`,
                mixed: getMixedNumber(fraction.num, fraction.den),
            };
        }
    }, [mode, numerator, denominator, decimalInput]);

    return (
        <View style={styles.container}>
            {/* Mode Selector */}
            <View style={styles.modeContainer}>
                <Pressable
                    onPress={() => setMode('toDecimal')}
                    style={[styles.modeButton, mode === 'toDecimal' && styles.modeButtonActive]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={[styles.modeButtonText, mode === 'toDecimal' && styles.modeButtonTextActive]}>
                        Fraction → Decimal
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setMode('toFraction')}
                    style={[styles.modeButton, mode === 'toFraction' && styles.modeButtonActive]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={[styles.modeButtonText, mode === 'toFraction' && styles.modeButtonTextActive]}>
                        Decimal → Fraction
                    </Text>
                </Pressable>
            </View>

            {mode === 'toDecimal' ? (
                <>
                    {/* Fraction Input */}
                    <View style={styles.fractionInput}>
                        <View style={styles.fractionPart}>
                            <TextInput
                                style={styles.fractionNumber}
                                value={numerator}
                                onChangeText={setNumerator}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.secondary}
                            />
                            <Text style={styles.fractionLabel}>Numerator</Text>
                        </View>
                        <Text style={styles.fractionDivider}>/</Text>
                        <View style={styles.fractionPart}>
                            <TextInput
                                style={styles.fractionNumber}
                                value={denominator}
                                onChangeText={setDenominator}
                                keyboardType="numeric"
                                placeholder="1"
                                placeholderTextColor={colors.secondary}
                            />
                            <Text style={styles.fractionLabel}>Denominator</Text>
                        </View>
                    </View>

                    {/* Decimal Result */}
                    {result && (
                        <View style={styles.results}>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => copyToClipboard(result.decimal || '', 'decimal')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'decimal' && (
                                    <View style={styles.copiedBadge}>
                                        <Text style={styles.copiedText}>Copied!</Text>
                                    </View>
                                )}
                                <Text style={styles.resultLabel}>DECIMAL</Text>
                                <Text style={styles.resultValueLarge}>{result.decimal}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => copyToClipboard(result.percentage || '', 'percentage')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'percentage' && (
                                    <View style={styles.copiedBadge}>
                                        <Text style={styles.copiedText}>Copied!</Text>
                                    </View>
                                )}
                                <Text style={styles.resultLabel}>PERCENTAGE</Text>
                                <Text style={styles.resultValue}>{result.percentage}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            ) : (
                <>
                    {/* Decimal Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>DECIMAL NUMBER</Text>
                        <TextInput
                            style={styles.input}
                            value={decimalInput}
                            onChangeText={setDecimalInput}
                            keyboardType="numeric"
                            placeholder="0.5"
                            placeholderTextColor={colors.secondary}
                        />
                    </View>

                    {/* Fraction Result */}
                    {result && (
                        <View style={styles.results}>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => copyToClipboard(result.fraction || '', 'fraction')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'fraction' && (
                                    <View style={styles.copiedBadge}>
                                        <Text style={styles.copiedText}>Copied!</Text>
                                    </View>
                                )}
                                <Text style={styles.resultLabel}>FRACTION</Text>
                                <Text style={styles.resultValueLarge}>{result.fraction}</Text>
                            </TouchableOpacity>
                            {result.mixed && (
                                <TouchableOpacity
                                    style={styles.resultCard}
                                    onPress={() => copyToClipboard(result.mixed!, 'mixed')}
                                    activeOpacity={0.7}
                                >
                                    {copiedField === 'mixed' && (
                                        <View style={styles.copiedBadge}>
                                            <Text style={styles.copiedText}>Copied!</Text>
                                        </View>
                                    )}
                                    <Text style={styles.resultLabel}>MIXED NUMBER</Text>
                                    <Text style={styles.resultValue}>{result.mixed}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16 },
    modeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    modeButtonActive: {
        backgroundColor: colors.accent,
    },
    modeButtonText: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
    },
    modeButtonTextActive: {
        color: colors.main,
    },
    fractionInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    fractionPart: {
        alignItems: 'center',
        gap: 8,
    },
    fractionNumber: {
        fontFamily,
        fontSize: 40,
        fontWeight: '300',
        color: colors.primary,
        textAlign: 'center',
        minWidth: 80,
    },
    fractionLabel: {
        fontFamily,
        fontSize: 10,
        color: colors.secondary,
        letterSpacing: 1,
    },
    fractionDivider: {
        fontFamily,
        fontSize: 48,
        fontWeight: '200',
        color: colors.secondary,
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
        fontSize: 40,
        fontWeight: '300',
        color: colors.primary,
    },
    results: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 4,
    },
    resultLabel: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    resultValue: {
        fontFamily,
        fontSize: 20,
        fontWeight: '500',
        color: colors.primary,
    },
    resultValueLarge: {
        fontFamily,
        fontSize: 36,
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
