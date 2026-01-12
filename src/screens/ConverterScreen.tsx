import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { ArrowLeftRight } from 'lucide-react-native';

import { LENGTH_UNITS, WEIGHT_UNITS, TEMPERATURE_UNITS, SPEED_UNITS } from '../constants';
import { useClipboard } from '../hooks';
import { colors } from '../theme/colors';
import { fontFamily, getDynamicFontSize } from '../theme/typography';
import { shadows } from '../theme';
import { PickerModal } from '../components/PickerModal';
import { PickerButton } from '../components/PickerButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { MarqueeInput } from '../components/MarqueeInput';

enum Category {
    LENGTH = 'Length',
    WEIGHT = 'Weight',
    TEMPERATURE = 'Temperature',
    SPEED = 'Speed',
}

// Extracted to module scope to prevent re-creation on each render
interface CategoryButtonProps {
    cat: Category;
    isActive: boolean;
    onPress: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ cat, isActive, onPress }) => {
    const progress = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    }, [isActive, progress]);

    const animatedBgStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', colors.accent]
        ),
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            [colors.secondary, colors.primary]
        ),
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.categoryButton]}
        >
            <Animated.View style={[styles.categoryButtonInner, animatedBgStyle]}>
                <Animated.Text style={[styles.categoryButtonText, animatedTextStyle]}>
                    {cat}
                </Animated.Text>
            </Animated.View>
        </AnimatedPressable>
    );
};

export const ConverterScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { copied, copyToClipboard } = useClipboard();
    const [category, setCategory] = useState<Category>(Category.LENGTH);
    const [value, setValue] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<string>('');
    const [toUnit, setToUnit] = useState<string>('');

    // Modal states
    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);

    const units = useMemo(() => {
        switch (category) {
            case Category.LENGTH: return LENGTH_UNITS;
            case Category.WEIGHT: return WEIGHT_UNITS;
            case Category.TEMPERATURE: return TEMPERATURE_UNITS;
            case Category.SPEED: return SPEED_UNITS;
            default: return LENGTH_UNITS;
        }
    }, [category]);

    // Initialize defaults when units change
    useEffect(() => {
        const currentFromValid = units.some(u => u.id === fromUnit);
        const currentToValid = units.some(u => u.id === toUnit);

        if (!currentFromValid || !currentToValid) {
            setFromUnit(units[0].id);
            setToUnit(units[1].id);
        }
    }, [units, category, fromUnit, toUnit]);

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val)) return '---';

        if (category === Category.TEMPERATURE) {
            if (fromUnit === toUnit) return val.toString();

            let final = val;
            if (fromUnit === 'c' && toUnit === 'f') {
                final = (val * 9 / 5) + 32;
            } else if (fromUnit === 'f' && toUnit === 'c') {
                final = (val - 32) * 5 / 9;
            }

            return final.toLocaleString('en-US', {
                maximumFractionDigits: 1,
                minimumFractionDigits: 0,
            });
        }

        const from = units.find(u => u.id === fromUnit);
        const to = units.find(u => u.id === toUnit);

        if (!from || !to) return '---';

        const baseValue = val * from.factor;
        const finalValue = baseValue / to.factor;

        // Format with locale string (spaces as thousand separators)
        // For very small numbers, show more decimals
        if (finalValue < 0.0001 && finalValue > 0) {
            return finalValue.toLocaleString('en-US', {
                maximumFractionDigits: 10,
                minimumFractionDigits: 0,
            });
        }

        return finalValue.toLocaleString('en-US', {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
        });
    }, [value, fromUnit, toUnit, units, category]);

    const handleSwap = useCallback(() => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }, [fromUnit, toUnit]);

    const handleCategoryChange = useCallback((cat: Category) => {
        setCategory(cat);
    }, []);

    // Memoized unit options to prevent unnecessary re-renders
    const unitOptions = useMemo(() =>
        units.map(u => ({ label: u.label, value: u.id })),
        [units]
    );

    const fromUnitLabel = useMemo(() =>
        units.find(u => u.id === fromUnit)?.label || 'Select',
        [units, fromUnit]
    );

    const toUnitLabel = useMemo(() =>
        units.find(u => u.id === toUnit)?.label || 'Select',
        [units, toUnit]
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Convert</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Category Toggle */}
                <View style={styles.categoryContainer}>
                    {Object.values(Category).map((cat) => (
                        <CategoryButton
                            key={cat}
                            cat={cat}
                            isActive={category === cat}
                            onPress={() => handleCategoryChange(cat)}
                        />
                    ))}
                </View>

                {/* Input Section */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Input Amount</Text>
                    <MarqueeInput
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.inputFieldStyle}
                        fontSize={48}
                        value={value}
                        onChangeText={setValue}
                        keyboardType="numeric"
                        placeholder="0"
                        maxLength={15}
                    />
                </View>

                {/* Units Selection - Vertical Layout */}
                <View style={styles.unitsContainer}>
                    {/* From Unit */}
                    <View style={styles.unitRow}>
                        <Text style={styles.unitLabel}>FROM</Text>
                        <PickerButton
                            value={fromUnitLabel}
                            onPress={() => setFromModalVisible(true)}
                        />
                    </View>

                    {/* Swap Button */}
                    <AnimatedPressable
                        style={styles.swapButton}
                        onPress={handleSwap}
                    >
                        <ArrowLeftRight color={colors.accent} size={20} />
                        <Text style={styles.swapButtonText}>Swap</Text>
                    </AnimatedPressable>

                    {/* To Unit */}
                    <View style={styles.unitRow}>
                        <Text style={styles.unitLabel}>TO</Text>
                        <PickerButton
                            value={toUnitLabel}
                            onPress={() => setToModalVisible(true)}
                        />
                    </View>
                </View>

                {/* Result Display */}
                <TouchableOpacity
                    style={styles.resultContainer}
                    onPress={() => copyToClipboard(result)}
                    activeOpacity={0.7}
                >
                    {copied && (
                        <View style={styles.copiedBadge}>
                            <Text style={styles.copiedText}>Copied!</Text>
                        </View>
                    )}
                    <Text style={[styles.resultValue, { fontSize: getDynamicFontSize(result) }]}>{result}</Text>
                    <Text style={styles.resultUnit}>{toUnitLabel}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modals */}
            <PickerModal
                visible={fromModalVisible}
                onClose={() => setFromModalVisible(false)}
                title="Select From Unit"
                options={unitOptions}
                selectedValue={fromUnit}
                onSelect={setFromUnit}
            />
            <PickerModal
                visible={toModalVisible}
                onClose={() => setToModalVisible(false)}
                title="Select To Unit"
                options={unitOptions}
                selectedValue={toUnit}
                onSelect={setToUnit}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.main,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontFamily,
        fontSize: 28,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: -0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        ...shadows.card,
    },
    categoryButton: {
        flexGrow: 1,
    },
    categoryButtonInner: {
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    categoryButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.secondary,
    },
    inputSection: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        ...shadows.card,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flex: 1,
        minHeight: 60,
    },
    inputFieldStyle: {
        textAlign: 'right',
    },
    unitsContainer: {
        gap: 12,
    },
    unitRow: {
        gap: 8,
    },
    unitLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 1,
        marginLeft: 4,
    },
    swapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        backgroundColor: colors.card,
        alignSelf: 'center',
        ...shadows.button,
    },
    swapButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.accent,
    },
    resultContainer: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        ...shadows.card,
    },
    resultValue: {
        fontSize: 48,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    resultUnit: {
        fontSize: 16,
        color: colors.secondary,
        fontWeight: '500',
    },
    copiedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        ...shadows.glow,
    },
    copiedText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
});
