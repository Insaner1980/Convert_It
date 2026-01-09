import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { ArrowLeftRight } from 'lucide-react-native';

import { LENGTH_UNITS, WEIGHT_UNITS, TEMPERATURE_UNITS, SPEED_UNITS } from '../constants';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { PickerModal } from '../components/PickerModal';
import { PickerButton } from '../components/PickerButton';
import { AnimatedPressable } from '../components/AnimatedPressable';

// Logo
const logo = require('../../assets/adaptive-icon.png');

enum Category {
    LENGTH = 'Length',
    WEIGHT = 'Weight',
    TEMPERATURE = 'Temperature',
    SPEED = 'Speed',
}

export const ConverterScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [category, setCategory] = useState<Category>(Category.LENGTH);
    const [value, setValue] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<string>('');
    const [toUnit, setToUnit] = useState<string>('');

    // Modal states
    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

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

        if (finalValue < 0.0001 && finalValue > 0) return finalValue.toExponential(4);
        if (finalValue > 1e12) return finalValue.toExponential(4);

        return finalValue.toLocaleString('en-US', {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
        });
    }, [value, fromUnit, toUnit, units, category]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    // Animated category button with color transition
    const CategoryButton = ({ cat, isActive }: { cat: Category; isActive: boolean }) => {
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
                onPress={() => setCategory(cat)}
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

    const unitOptions = units.map(u => ({ label: u.label, value: u.id }));
    const fromUnitLabel = units.find(u => u.id === fromUnit)?.label || 'Select';
    const toUnitLabel = units.find(u => u.id === toUnit)?.label || 'Select';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
                    <Text style={styles.headerTitle}>UnitX</Text>
                </View>
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
                        />
                    ))}
                </View>

                {/* Input Section */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Input Amount</Text>
                    <TextInput
                        style={styles.inputField}
                        value={value}
                        onChangeText={setValue}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.secondary}
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
                    <Text style={styles.resultValue}>{result}</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerLogo: {
        width: 36,
        height: 36,
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
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.subtle,
    },
    categoryButton: {
        flex: 1,
    },
    categoryButtonInner: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    categoryButtonText: {
        fontSize: 13,
        fontWeight: '500',
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
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
    },
    inputField: {
        fontSize: 48,
        fontWeight: '300',
        color: colors.primary,
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
        backgroundColor: colors.input,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignSelf: 'center',
    },
    swapButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.accent,
    },
    resultContainer: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        alignItems: 'center',
        gap: 8,
    },
    resultValue: {
        fontSize: 48,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
    resultUnit: {
        fontSize: 18,
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
    },
    copiedText: {
        color: colors.main,
        fontSize: 12,
        fontWeight: '600',
    },
});
