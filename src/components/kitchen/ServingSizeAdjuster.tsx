// src/components/kitchen/ServingSizeAdjuster.tsx
// Scale recipe ingredients by serving count

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { shadows } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';
import { Minus, Plus } from 'lucide-react-native';
import { useClipboard } from '../../hooks';

export const ServingSizeAdjuster: React.FC = () => {
    const [originalServings, setOriginalServings] = useState('4');
    const [newServings, setNewServings] = useState('4');
    const [ingredientAmount, setIngredientAmount] = useState('');
    const { copied, copyToClipboard } = useClipboard();

    const scaleFactor = useMemo(() => {
        const orig = parseInt(originalServings) || 1;
        const target = parseInt(newServings) || 1;
        return target / orig;
    }, [originalServings, newServings]);

    const scaledAmount = useMemo(() => {
        const amount = parseFloat(ingredientAmount);
        if (isNaN(amount)) return '---';

        const scaled = amount * scaleFactor;

        // Format nicely
        if (scaled === Math.floor(scaled)) {
            return scaled.toString();
        }
        return scaled.toFixed(2);
    }, [ingredientAmount, scaleFactor]);

    const adjustServings = (delta: number) => {
        const current = parseInt(newServings) || 1;
        const newValue = Math.max(1, current + delta);
        setNewServings(newValue.toString());
    };

    // Common serving presets
    const presets = [2, 4, 6, 8, 12];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>SERVING SIZE ADJUSTER</Text>

            {/* Original Servings */}
            <View style={styles.servingsRow}>
                <View style={styles.servingsGroup}>
                    <Text style={styles.label}>ORIGINAL RECIPE</Text>
                    <View style={styles.servingInput}>
                        <TextInput
                            style={styles.servingNumber}
                            value={originalServings}
                            onChangeText={setOriginalServings}
                            keyboardType="numeric"
                            placeholder="4"
                            placeholderTextColor={colors.secondary}
                            maxLength={4}
                        />
                        <Text style={styles.servingLabel}>servings</Text>
                    </View>
                </View>

                <View style={styles.servingsGroup}>
                    <Text style={styles.label}>NEW SERVINGS</Text>
                    <View style={styles.adjustRow}>
                        <AnimatedPressable
                            style={styles.adjustButton}
                            onPress={() => adjustServings(-1)}
                        >
                            <Minus size={20} color={colors.primary} />
                        </AnimatedPressable>
                        <TextInput
                            style={styles.servingNumberLarge}
                            value={newServings}
                            onChangeText={setNewServings}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                        <AnimatedPressable
                            style={styles.adjustButton}
                            onPress={() => adjustServings(1)}
                        >
                            <Plus size={20} color={colors.primary} />
                        </AnimatedPressable>
                    </View>
                </View>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
                {presets.map((count) => (
                    <AnimatedPressable
                        key={count}
                        style={[
                            styles.presetButton,
                            parseInt(newServings) === count && styles.presetButtonActive
                        ]}
                        onPress={() => setNewServings(count.toString())}
                    >
                        <Text style={[
                            styles.presetText,
                            parseInt(newServings) === count && styles.presetTextActive
                        ]}>
                            {count}
                        </Text>
                    </AnimatedPressable>
                ))}
            </View>

            {/* Scale Factor Display */}
            <View style={styles.scaleDisplay}>
                <Text style={styles.scaleLabel}>SCALE FACTOR</Text>
                <Text style={styles.scaleValue}>
                    ×{scaleFactor.toFixed(2)}
                </Text>
            </View>

            {/* Ingredient Calculator */}
            <View style={styles.ingredientSection}>
                <Text style={styles.label}>ORIGINAL AMOUNT</Text>
                <View style={styles.ingredientRow}>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.ingredientInput}
                            value={ingredientAmount}
                            onChangeText={setIngredientAmount}
                            keyboardType="numeric"
                            placeholder="e.g. 250"
                            placeholderTextColor={colors.secondary}
                            maxLength={12}
                            multiline
                            numberOfLines={2}
                            textAlignVertical="center"
                        />
                    </View>
                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>→</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.resultBox}
                        onPress={() => scaledAmount !== '---' && copyToClipboard(scaledAmount)}
                        activeOpacity={0.7}
                    >
                        {copied && (
                            <View style={styles.copiedBadge}>
                                <Text style={styles.copiedText}>Copied!</Text>
                            </View>
                        )}
                        <Text style={styles.resultValue} numberOfLines={2} adjustsFontSizeToFit>{scaledAmount}</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    servingsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    servingsGroup: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 12,
        gap: 8,
        ...shadows.card,
    },
    label: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    servingInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    servingNumber: {
        fontFamily,
        fontSize: 24,
        fontWeight: '300',
        color: colors.primary,
        minWidth: 40,
        textAlign: 'center',
    },
    servingLabel: {
        fontFamily,
        fontSize: 12,
        color: colors.secondary,
    },
    adjustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    adjustButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button,
    },
    servingNumberLarge: {
        fontFamily,
        fontSize: 32,
        fontWeight: '600',
        color: colors.primary,
        minWidth: 50,
        textAlign: 'center',
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    presetButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 10,
        ...shadows.button,
    },
    presetButtonActive: {
        backgroundColor: colors.accent,
    },
    presetText: {
        fontFamily,
        fontSize: 14,
        fontWeight: '600',
        color: colors.secondary,
    },
    presetTextActive: {
        color: colors.primary,
    },
    scaleDisplay: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        gap: 4,
        ...shadows.glow,
    },
    scaleLabel: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
        opacity: 0.7,
        letterSpacing: 1,
    },
    scaleValue: {
        fontFamily,
        fontSize: 28,
        fontWeight: '600',
        color: colors.primary,
    },
    ingredientSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        ...shadows.card,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputBox: {
        flex: 1,
        backgroundColor: colors.input,
        borderRadius: 8,
        padding: 8,
        minHeight: 60,
        justifyContent: 'center',
    },
    ingredientInput: {
        fontFamily,
        fontSize: 20,
        fontWeight: '300',
        color: colors.primary,
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
    arrow: {
        paddingHorizontal: 8,
    },
    arrowText: {
        fontFamily,
        fontSize: 24,
        color: colors.secondary,
    },
    resultBox: {
        flex: 1,
        backgroundColor: colors.input,
        borderRadius: 8,
        padding: 8,
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultValue: {
        fontFamily,
        fontSize: 20,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    copiedBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
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
