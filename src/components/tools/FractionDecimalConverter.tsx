// src/components/tools/FractionDecimalConverter.tsx
// Convert between fractions and decimals

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily, getDynamicFontSize } from '../../theme/typography';
import { shadows } from '../../theme';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';
import { CopiedBadge } from '../CopiedBadge';

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

    const handleCopy = async (text: string, field: string) => {
        await copyToClipboard(text);
        setCopiedField(field);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopiedField(null), 1500);
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
                            <MarqueeInput
                                containerStyle={styles.fractionInputContainer}
                                inputStyle={styles.fractionInputStyle}
                                fontSize={40}
                                compactMode
                                value={numerator}
                                onChangeText={setNumerator}
                                keyboardType="numeric"
                                placeholder="0"
                                maxLength={10}
                            />
                            <Text style={styles.fractionLabel}>Numerator</Text>
                        </View>
                        <Text style={styles.fractionDivider}>/</Text>
                        <View style={styles.fractionPart}>
                            <MarqueeInput
                                containerStyle={styles.fractionInputContainer}
                                inputStyle={styles.fractionInputStyle}
                                fontSize={40}
                                compactMode
                                value={denominator}
                                onChangeText={setDenominator}
                                keyboardType="numeric"
                                placeholder="1"
                                maxLength={10}
                            />
                            <Text style={styles.fractionLabel}>Denominator</Text>
                        </View>
                    </View>

                    {/* Decimal Result */}
                    {result && (
                        <View style={styles.results}>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => handleCopy(result.decimal || '', 'decimal')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'decimal' && <CopiedBadge size="small" />}
                                <Text style={styles.resultLabel}>DECIMAL</Text>
                                <Text style={[styles.resultValueLarge, { fontSize: getDynamicFontSize(result.decimal || '', 36) }]}>{result.decimal}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => handleCopy(result.percentage || '', 'percentage')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'percentage' && <CopiedBadge size="small" />}
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
                        <MarqueeInput
                            containerStyle={styles.inputContainer}
                            fontSize={40}
                            value={decimalInput}
                            onChangeText={setDecimalInput}
                            keyboardType="numeric"
                            placeholder="0.5"
                            maxLength={15}
                        />
                    </View>

                    {/* Fraction Result */}
                    {result && (
                        <View style={styles.results}>
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => handleCopy(result.fraction || '', 'fraction')}
                                activeOpacity={0.7}
                            >
                                {copiedField === 'fraction' && <CopiedBadge size="small" />}
                                <Text style={styles.resultLabel}>FRACTION</Text>
                                <Text style={[styles.resultValueLarge, { fontSize: getDynamicFontSize(result.fraction || '', 36) }]}>{result.fraction}</Text>
                            </TouchableOpacity>
                            {result.mixed && (
                                <TouchableOpacity
                                    style={styles.resultCard}
                                    onPress={() => handleCopy(result.mixed!, 'mixed')}
                                    activeOpacity={0.7}
                                >
                                    {copiedField === 'mixed' && <CopiedBadge size="small" />}
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
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        ...shadows.card,
    },
    modeButton: {
        flexGrow: 1,
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
        color: colors.primary,
    },
    fractionInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        ...shadows.card,
    },
    fractionPart: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
        overflow: 'hidden',
    },
    fractionInputContainer: {
        width: '100%',
        minHeight: 50,
    },
    fractionInputStyle: {
        textAlign: 'center',
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
        minHeight: 50,
    },
    results: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        ...shadows.card,
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
});
