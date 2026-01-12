// src/components/tools/UnixTimestampConverter.tsx
// Convert between Unix timestamp and human-readable date

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { shadows } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';
import { useClipboard } from '../../hooks';
import { MarqueeInput } from '../MarqueeInput';
import { CopiedBadge } from '../CopiedBadge';

export const UnixTimestampConverter: React.FC = () => {
    const [timestamp, setTimestamp] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());
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

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper function to get relative time
    const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const absDiff = Math.abs(diff);
        const isPast = diff > 0;

        if (absDiff < 60000) return 'Just now';
        if (absDiff < 3600000) {
            const mins = Math.floor(absDiff / 60000);
            return `${mins} min${mins > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
        }
        if (absDiff < 86400000) {
            const hours = Math.floor(absDiff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
        }
        const days = Math.floor(absDiff / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
    };

    const parseResult = useMemo(() => {
        if (!timestamp) return null;

        const ts = parseInt(timestamp);
        if (isNaN(ts)) return null;

        // Check if seconds or milliseconds
        const date = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);

        if (isNaN(date.getTime())) return null;

        return {
            local: date.toLocaleString(),
            utc: date.toUTCString(),
            iso: date.toISOString(),
            relative: getRelativeTime(date),
        };
    }, [timestamp]);

    const setNow = () => {
        setTimestamp(Math.floor(Date.now() / 1000).toString());
    };

    const currentUnix = Math.floor(currentTime / 1000);

    return (
        <View style={styles.container}>
            {/* Current Time Display */}
            <TouchableOpacity
                style={styles.currentTimeCard}
                onPress={() => handleCopy(currentUnix.toString(), 'current')}
                activeOpacity={0.7}
            >
                {copiedField === 'current' && <CopiedBadge />}
                <Text style={styles.currentLabel}>CURRENT UNIX TIME</Text>
                <Text style={styles.currentValue}>{currentUnix}</Text>
            </TouchableOpacity>

            {/* Input */}
            <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                    <Text style={styles.label}>ENTER TIMESTAMP</Text>
                    <AnimatedPressable style={styles.nowButton} onPress={setNow}>
                        <Text style={styles.nowButtonText}>Use Now</Text>
                    </AnimatedPressable>
                </View>
                <MarqueeInput
                    containerStyle={styles.inputContainer}
                    value={timestamp}
                    onChangeText={setTimestamp}
                    keyboardType="numeric"
                    placeholder="e.g. 1704067200"
                    maxLength={13}
                />
            </View>

            {/* Results */}
            {parseResult && (
                <View style={styles.results}>
                    <TouchableOpacity
                        style={styles.resultCard}
                        onPress={() => handleCopy(parseResult.local, 'local')}
                        activeOpacity={0.7}
                    >
                        {copiedField === 'local' && <CopiedBadge size="small" />}
                        <Text style={styles.resultLabel}>LOCAL</Text>
                        <Text style={styles.resultValue}>{parseResult.local}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.resultCard}
                        onPress={() => handleCopy(parseResult.utc, 'utc')}
                        activeOpacity={0.7}
                    >
                        {copiedField === 'utc' && <CopiedBadge size="small" />}
                        <Text style={styles.resultLabel}>UTC</Text>
                        <Text style={styles.resultValue}>{parseResult.utc}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.resultCard}
                        onPress={() => handleCopy(parseResult.iso, 'iso')}
                        activeOpacity={0.7}
                    >
                        {copiedField === 'iso' && <CopiedBadge size="small" />}
                        <Text style={styles.resultLabel}>ISO 8601</Text>
                        <Text style={styles.resultValue}>{parseResult.iso}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.resultCard}
                        onPress={() => handleCopy(parseResult.relative, 'relative')}
                        activeOpacity={0.7}
                    >
                        {copiedField === 'relative' && <CopiedBadge size="small" />}
                        <Text style={styles.resultLabel}>RELATIVE</Text>
                        <Text style={styles.resultValue}>{parseResult.relative}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16 },
    currentTimeCard: {
        backgroundColor: colors.accent,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        ...shadows.glow,
    },
    currentLabel: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: 1,
        opacity: 0.7,
    },
    currentValue: {
        fontFamily,
        fontSize: 32,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: 2,
    },
    inputSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        ...shadows.card,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
    },
    nowButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.accent + '20',
        borderRadius: 8,
    },
    nowButtonText: {
        fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: colors.accent,
    },
    inputContainer: {
        flex: 1,
        minHeight: 36,
    },
    results: {
        gap: 8,
    },
    resultCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
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
        fontSize: 14,
        color: colors.primary,
    },
});
