import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight } from 'lucide-react-native';

import { CURRENCIES } from '../constants';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { PickerModal } from '../components/PickerModal';
import { PickerButton } from '../components/PickerButton';
import { AnimatedPressable } from '../components/AnimatedPressable';

export const CurrencyScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [value, setValue] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');

    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val)) return '---';

        const from = CURRENCIES.find(c => c.code === fromCurrency);
        const to = CURRENCIES.find(c => c.code === toCurrency);

        if (!from || !to) return '---';

        const usd = val / from.rate;
        const final = usd * to.rate;

        return final.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    }, [value, fromCurrency, toCurrency]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
    const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);

    const currencyOptions = CURRENCIES.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code }));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Currency</Text>
                <Text style={styles.headerSubtitle}>Rates are approximate</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Input Section */}
                <View style={styles.inputSection}>
                    <View style={styles.inputRow}>
                        <Text style={styles.currencySymbol}>{fromCurrencyData?.symbol}</Text>
                        <TextInput
                            style={styles.inputField}
                            value={value}
                            onChangeText={setValue}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.secondary}
                        />
                    </View>
                    <Text style={styles.inputLabel}>{fromCurrencyData?.name}</Text>
                </View>

                {/* Currency Selection - Vertical */}
                <View style={styles.currencyContainer}>
                    <View style={styles.currencyField}>
                        <Text style={styles.currencyLabel}>FROM</Text>
                        <PickerButton
                            value={`${fromCurrencyData?.code} - ${fromCurrencyData?.name}`}
                            onPress={() => setFromModalVisible(true)}
                        />
                    </View>

                    <AnimatedPressable style={styles.swapButton} onPress={handleSwap}>
                        <ArrowLeftRight color={colors.accent} size={20} />
                        <Text style={styles.swapButtonText}>Swap</Text>
                    </AnimatedPressable>

                    <View style={styles.currencyField}>
                        <Text style={styles.currencyLabel}>TO</Text>
                        <PickerButton
                            value={`${toCurrencyData?.code} - ${toCurrencyData?.name}`}
                            onPress={() => setToModalVisible(true)}
                        />
                    </View>
                </View>

                {/* Result */}
                <TouchableOpacity
                    style={styles.resultContainer}
                    onPress={() => copyToClipboard(`${toCurrencyData?.symbol}${result}`)}
                    activeOpacity={0.7}
                >
                    {copied && (
                        <View style={styles.copiedBadge}>
                            <Text style={styles.copiedText}>Copied!</Text>
                        </View>
                    )}
                    <View style={styles.resultRow}>
                        <Text style={styles.resultSymbol}>{toCurrencyData?.symbol}</Text>
                        <Text style={styles.resultValue}>{result}</Text>
                    </View>
                    <Text style={styles.resultCurrency}>{toCurrencyData?.name}</Text>
                </TouchableOpacity>

                {/* Exchange Rate Info */}
                <View style={styles.rateInfo}>
                    <Text style={styles.rateText}>
                        1 {fromCurrency} = {((CURRENCIES.find(c => c.code === toCurrency)?.rate || 1) /
                            (CURRENCIES.find(c => c.code === fromCurrency)?.rate || 1)).toFixed(4)} {toCurrency}
                    </Text>
                </View>
            </ScrollView>

            <PickerModal
                visible={fromModalVisible}
                onClose={() => setFromModalVisible(false)}
                title="Select From Currency"
                options={currencyOptions}
                selectedValue={fromCurrency}
                onSelect={setFromCurrency}
            />
            <PickerModal
                visible={toModalVisible}
                onClose={() => setToModalVisible(false)}
                title="Select To Currency"
                options={currencyOptions}
                selectedValue={toCurrency}
                onSelect={setToCurrency}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 16, paddingVertical: 16 },
    headerTitle: { fontFamily, fontSize: 28, fontWeight: '600', color: colors.primary },
    headerSubtitle: { fontSize: 12, color: colors.secondary, marginTop: 4 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, gap: 16 },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.subtle,
        gap: 8,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    currencySymbol: { fontSize: 32, fontWeight: '300', color: colors.secondary },
    inputField: { flex: 1, fontSize: 48, fontWeight: '300', color: colors.primary },
    inputLabel: { fontSize: 14, color: colors.secondary },
    currencyContainer: { gap: 12 },
    currencyField: { gap: 8 },
    currencyLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
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
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    resultSymbol: { fontSize: 32, fontWeight: '300', color: colors.primary },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.primary },
    resultCurrency: { fontSize: 16, color: colors.secondary },
    rateInfo: { alignItems: 'center', padding: 16 },
    rateText: { fontSize: 14, color: colors.secondary },
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
