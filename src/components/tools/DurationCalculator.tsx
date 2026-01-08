// src/components/tools/DurationCalculator.tsx
// Calculate time durations and differences

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

type Mode = 'breakdown' | 'add' | 'diff';

interface TimeInputProps {
    label: string;
    h: string;
    m: string;
    s: string;
    setH: (value: string) => void;
    setM: (value: string) => void;
    setS: (value: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, h, m, s, setH, setM, setS }) => (
    <View style={styles.timeInputGroup}>
        <Text style={styles.timeInputLabel}>{label}</Text>
        <View style={styles.timeInputRow}>
            <View style={styles.timeInputField}>
                <TextInput
                    style={styles.timeInput}
                    value={h}
                    onChangeText={setH}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                />
                <Text style={styles.timeUnit}>h</Text>
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeInputField}>
                <TextInput
                    style={styles.timeInput}
                    value={m}
                    onChangeText={setM}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                />
                <Text style={styles.timeUnit}>m</Text>
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeInputField}>
                <TextInput
                    style={styles.timeInput}
                    value={s}
                    onChangeText={setS}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                />
                <Text style={styles.timeUnit}>s</Text>
            </View>
        </View>
    </View>
);

export const DurationCalculator: React.FC = () => {
    const [mode, setMode] = useState<Mode>('breakdown');
    const [totalSeconds, setTotalSeconds] = useState('');
    const [hours1, setHours1] = useState('');
    const [minutes1, setMinutes1] = useState('');
    const [seconds1, setSeconds1] = useState('');
    const [hours2, setHours2] = useState('');
    const [minutes2, setMinutes2] = useState('');
    const [seconds2, setSeconds2] = useState('');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const breakdownResult = useMemo(() => {
        const total = parseInt(totalSeconds);
        if (isNaN(total) || total < 0) return null;

        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        return { days, hours, minutes, seconds, total };
    }, [totalSeconds]);

    const addResult = useMemo(() => {
        const h1 = parseInt(hours1) || 0;
        const m1 = parseInt(minutes1) || 0;
        const s1 = parseInt(seconds1) || 0;
        const h2 = parseInt(hours2) || 0;
        const m2 = parseInt(minutes2) || 0;
        const s2 = parseInt(seconds2) || 0;

        const total = (h1 + h2) * 3600 + (m1 + m2) * 60 + (s1 + s2);

        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        return { hours, minutes, seconds, total };
    }, [hours1, minutes1, seconds1, hours2, minutes2, seconds2]);

    const diffResult = useMemo(() => {
        const h1 = parseInt(hours1) || 0;
        const m1 = parseInt(minutes1) || 0;
        const s1 = parseInt(seconds1) || 0;
        const h2 = parseInt(hours2) || 0;
        const m2 = parseInt(minutes2) || 0;
        const s2 = parseInt(seconds2) || 0;

        const total1 = h1 * 3600 + m1 * 60 + s1;
        const total2 = h2 * 3600 + m2 * 60 + s2;
        const diff = Math.abs(total2 - total1);

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        return { hours, minutes, seconds, total: diff };
    }, [hours1, minutes1, seconds1, hours2, minutes2, seconds2]);

    return (
        <View style={styles.container}>
            {/* Mode Selector */}
            <View style={styles.modeContainer}>
                <Pressable
                    style={[styles.modeButton, mode === 'breakdown' && styles.modeButtonActive]}
                    onPress={() => setMode('breakdown')}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                    <Text style={[styles.modeButtonText, mode === 'breakdown' && styles.modeButtonTextActive]}>
                        Breakdown
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.modeButton, mode === 'add' && styles.modeButtonActive]}
                    onPress={() => setMode('add')}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                    <Text style={[styles.modeButtonText, mode === 'add' && styles.modeButtonTextActive]}>
                        Add
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.modeButton, mode === 'diff' && styles.modeButtonActive]}
                    onPress={() => setMode('diff')}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                    <Text style={[styles.modeButtonText, mode === 'diff' && styles.modeButtonTextActive]}>
                        Difference
                    </Text>
                </Pressable>
            </View>

            {mode === 'breakdown' && (
                <>
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>TOTAL SECONDS</Text>
                        <TextInput
                            style={styles.input}
                            value={totalSeconds}
                            onChangeText={setTotalSeconds}
                            keyboardType="numeric"
                            placeholder="3661"
                            placeholderTextColor={colors.secondary}
                        />
                    </View>

                    {breakdownResult && (
                        <View style={styles.breakdownGrid}>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownValue}>{breakdownResult.days}</Text>
                                <Text style={styles.breakdownLabel}>Days</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownValue}>{breakdownResult.hours}</Text>
                                <Text style={styles.breakdownLabel}>Hours</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownValue}>{breakdownResult.minutes}</Text>
                                <Text style={styles.breakdownLabel}>Minutes</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownValue}>{breakdownResult.seconds}</Text>
                                <Text style={styles.breakdownLabel}>Seconds</Text>
                            </View>
                        </View>
                    )}
                </>
            )}

            {(mode === 'add' || mode === 'diff') && (
                <>
                    <TimeInput
                        label={mode === 'add' ? 'DURATION 1' : 'START TIME'}
                        h={hours1} m={minutes1} s={seconds1}
                        setH={setHours1} setM={setMinutes1} setS={setSeconds1}
                    />
                    <TimeInput
                        label={mode === 'add' ? 'DURATION 2' : 'END TIME'}
                        h={hours2} m={minutes2} s={seconds2}
                        setH={setHours2} setM={setMinutes2} setS={setSeconds2}
                    />

                    <TouchableOpacity
                        style={styles.resultContainer}
                        onPress={() => {
                            const result = mode === 'add' ? addResult : diffResult;
                            copyToClipboard(`${result.hours}h ${result.minutes}m ${result.seconds}s`);
                        }}
                        activeOpacity={0.7}
                    >
                        {copied && (
                            <View style={styles.copiedBadge}>
                                <Text style={styles.copiedText}>Copied!</Text>
                            </View>
                        )}
                        <Text style={styles.resultLabel}>
                            {mode === 'add' ? 'TOTAL' : 'DIFFERENCE'}
                        </Text>
                        <Text style={styles.resultValue}>
                            {mode === 'add'
                                ? `${addResult.hours}h ${addResult.minutes}m ${addResult.seconds}s`
                                : `${diffResult.hours}h ${diffResult.minutes}m ${diffResult.seconds}s`
                            }
                        </Text>
                        <Text style={styles.resultSubtext}>
                            {mode === 'add'
                                ? `= ${addResult.total.toLocaleString()} seconds`
                                : `= ${diffResult.total.toLocaleString()} seconds`
                            }
                        </Text>
                    </TouchableOpacity>
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
        paddingHorizontal: 6,
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
    breakdownGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    breakdownItem: {
        flex: 1,
        backgroundColor: colors.input,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 4,
    },
    breakdownValue: {
        fontFamily,
        fontSize: 24,
        fontWeight: '600',
        color: colors.primary,
    },
    breakdownLabel: {
        fontFamily,
        fontSize: 10,
        color: colors.secondary,
        letterSpacing: 0.5,
    },
    timeInputGroup: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 8,
    },
    timeInputLabel: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeInputField: {
        alignItems: 'center',
    },
    timeInput: {
        fontFamily,
        fontSize: 32,
        fontWeight: '300',
        color: colors.primary,
        textAlign: 'center',
        minWidth: 60,
    },
    timeUnit: {
        fontFamily,
        fontSize: 12,
        color: colors.secondary,
    },
    timeColon: {
        fontFamily,
        fontSize: 32,
        fontWeight: '200',
        color: colors.secondary,
        marginHorizontal: 4,
    },
    resultContainer: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 4,
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
        fontSize: 32,
        fontWeight: '600',
        color: colors.primary,
    },
    resultSubtext: {
        fontFamily,
        fontSize: 12,
        color: colors.secondary,
    },
    copiedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    copiedText: {
        color: colors.main,
        fontSize: 12,
        fontWeight: '600',
    },
});
