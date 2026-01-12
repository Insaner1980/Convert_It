// src/components/tools/PercentageCalculator.tsx
// Calculate percentages in different ways

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily, getDynamicFontSize } from '../../theme/typography';
import { shadows } from '../../theme';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';
import { CopiedBadge } from '../CopiedBadge';

type CalcMode = 'whatIs' | 'whatPercent' | 'percentChange';

export const PercentageCalculator: React.FC = () => {
    const [mode, setMode] = useState<CalcMode>('whatIs');
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const { copied, copyToClipboard } = useClipboard();

    const result = useMemo(() => {
        const v1 = parseFloat(value1);
        const v2 = parseFloat(value2);

        if (isNaN(v1) || isNaN(v2)) return '---';

        switch (mode) {
            case 'whatIs':
                // What is X% of Y?
                return ((v1 / 100) * v2).toFixed(2);
            case 'whatPercent':
                // X is what % of Y?
                if (v2 === 0) return '---'; // Avoid division by zero
                return ((v1 / v2) * 100).toFixed(2) + '%';
            case 'percentChange':
                // % change from X to Y
                if (v1 === 0) return '---'; // Avoid division by zero
                const change = ((v2 - v1) / Math.abs(v1)) * 100;
                return (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            default:
                return '---';
        }
    }, [value1, value2, mode]);

    const modes: { id: CalcMode; label: string; v1Label: string; v2Label: string; question: string }[] = [
        { id: 'whatIs', label: 'X% of Y', v1Label: '%', v2Label: 'OF', question: 'What is' },
        { id: 'whatPercent', label: 'X is ?% of Y', v1Label: 'VALUE', v2Label: 'TOTAL', question: 'Is what % of' },
        { id: 'percentChange', label: '% Change', v1Label: 'FROM', v2Label: 'TO', question: 'Change' },
    ];

    const currentMode = modes.find(m => m.id === mode)!;

    return (
        <View style={styles.container}>
            {/* Mode Selector */}
            <View style={styles.modeContainer}>
                {modes.map((m) => (
                    <Pressable
                        key={m.id}
                        style={[
                            styles.modeButton,
                            mode === m.id && styles.modeButtonActive
                        ]}
                        onPress={() => setMode(m.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                        <Text
                            style={[
                                styles.modeButtonText,
                                mode === m.id && styles.modeButtonTextActive
                            ]}
                        >
                            {m.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Input Fields */}
            <View style={styles.inputsRow}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{currentMode.v1Label}</Text>
                    <MarqueeInput
                        containerStyle={styles.inputContainer}
                        value={value1}
                        onChangeText={setValue1}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        maxLength={15}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{currentMode.v2Label}</Text>
                    <MarqueeInput
                        containerStyle={styles.inputContainer}
                        value={value2}
                        onChangeText={setValue2}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        maxLength={15}
                    />
                </View>
            </View>

            {/* Result */}
            <TouchableOpacity style={styles.resultContainer} onPress={() => copyToClipboard(result)} activeOpacity={0.7}>
                {copied && <CopiedBadge />}
                <Text style={styles.resultLabel}>RESULT</Text>
                <Text style={[styles.resultValue, { fontSize: getDynamicFontSize(result, 40) }]}>{result}</Text>
            </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
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
    inputsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
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
    resultContainer: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        ...shadows.card,
    },
    resultLabel: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    resultValue: {
        fontFamily,
        fontSize: 40,
        fontWeight: '600',
        color: colors.primary,
    },
});
