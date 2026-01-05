import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight, ChevronDown, Check, X } from 'lucide-react-native';

import { CURRENCIES } from '../constants';

const colors = {
    main: '#09090b',
    card: '#18181b',
    input: '#27272a',
    subtle: '#3f3f46',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#FDDA0D',
};

// Custom Picker Modal
interface PickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const PickerModal: React.FC<PickerModalProps> = ({
    visible, onClose, title, options, selectedValue, onSelect
}) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color={colors.secondary} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.modalOption, selectedValue === item.value && styles.modalOptionSelected]}
                            onPress={() => { onSelect(item.value); onClose(); }}
                        >
                            <Text style={[styles.modalOptionText, selectedValue === item.value && styles.modalOptionTextSelected]}>
                                {item.label}
                            </Text>
                            {selectedValue === item.value && <Check size={20} color={colors.accent} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Pressable>
    </Modal>
);

const PickerButton: React.FC<{ value: string; onPress: () => void }> = ({ value, onPress }) => (
    <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={styles.pickerButtonText} numberOfLines={1}>{value}</Text>
        <ChevronDown size={18} color={colors.secondary} />
    </TouchableOpacity>
);

export const CurrencyScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [value, setValue] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');

    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);

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

                    <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                        <ArrowLeftRight color={colors.accent} size={20} />
                        <Text style={styles.swapButtonText}>Swap</Text>
                    </TouchableOpacity>

                    <View style={styles.currencyField}>
                        <Text style={styles.currencyLabel}>TO</Text>
                        <PickerButton
                            value={`${toCurrencyData?.code} - ${toCurrencyData?.name}`}
                            onPress={() => setToModalVisible(true)}
                        />
                    </View>
                </View>

                {/* Result */}
                <View style={styles.resultContainer}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultSymbol}>{toCurrencyData?.symbol}</Text>
                        <Text style={styles.resultValue}>{result}</Text>
                    </View>
                    <Text style={styles.resultCurrency}>{toCurrencyData?.name}</Text>
                </View>

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
    header: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 28, fontWeight: '600', color: colors.primary },
    headerSubtitle: { fontSize: 12, color: colors.secondary, marginTop: 4 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, gap: 24 },
    inputSection: {
        backgroundColor: colors.input,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.accent,
        gap: 8,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    currencySymbol: { fontSize: 32, fontWeight: '300', color: colors.secondary },
    inputField: { flex: 1, fontSize: 48, fontWeight: '300', color: colors.primary },
    inputLabel: { fontSize: 14, color: colors.secondary },
    currencyContainer: { gap: 12 },
    currencyField: { gap: 8 },
    currencyLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    pickerButtonText: { fontSize: 16, fontWeight: '500', color: colors.primary, flex: 1 },
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
        borderColor: colors.accent,
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
        padding: 24,
        borderWidth: 1,
        borderColor: colors.accent,
        alignItems: 'center',
        gap: 8,
    },
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    resultSymbol: { fontSize: 32, fontWeight: '300', color: colors.accent },
    resultValue: { fontSize: 48, fontWeight: '600', color: colors.accent },
    resultCurrency: { fontSize: 16, color: colors.secondary },
    rateInfo: { alignItems: 'center', padding: 16 },
    rateText: { fontSize: 14, color: colors.secondary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle + '40',
    },
    modalOptionSelected: { backgroundColor: colors.accent + '15' },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },
});
