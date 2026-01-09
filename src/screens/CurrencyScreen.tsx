import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    FlatList,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftRight, RefreshCw, Plus, Search, X, Check } from 'lucide-react-native';

import { CURRENCY_INFO, DEFAULT_CURRENCIES } from '../constants';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { PickerButton } from '../components/PickerButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { ConfirmDialog } from '../components/ConfirmDialog';

// ExchangeRate-API - 160+ currencies
const EXCHANGE_RATE_API_KEY = '3c0edc65cf16a8ca8c3e5a41';
const EXCHANGE_RATE_API = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}`;

interface ExchangeRates {
    [key: string]: number;
}

export const CurrencyScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [value, setValue] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState('EUR');
    const [toCurrency, setToCurrency] = useState('USD');

    const [fromModalVisible, setFromModalVisible] = useState(false);
    const [toModalVisible, setToModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [addedCurrency, setAddedCurrency] = useState<string | null>(null);

    // Favorite currencies (user's selected currencies)
    const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{ visible: boolean; code: string; name: string }>({
        visible: false,
        code: '',
        name: '',
    });

    // API state
    const [rates, setRates] = useState<ExchangeRates>({});
    const [baseCurrency, setBaseCurrency] = useState('EUR');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async (base: string = 'EUR') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${EXCHANGE_RATE_API}/latest/${base}`);
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();

            if (data.result !== 'success') {
                throw new Error(data['error-type'] || 'API error');
            }

            setRates(data.conversion_rates);
            setBaseCurrency(base);
            const updateDate = new Date(data.time_last_update_utc);
            setLastUpdated(updateDate.toLocaleDateString('en-CA'));
        } catch (err) {
            setError('Could not load exchange rates');
            console.error('Currency fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates('EUR');
    }, []);

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const result = useMemo(() => {
        const val = parseFloat(value);
        if (isNaN(val) || Object.keys(rates).length === 0) return '---';

        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];

        if (!fromRate || !toRate) return '---';

        const inBase = val / fromRate;
        const final = inBase * toRate;

        return final.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    }, [value, fromCurrency, toCurrency, rates]);

    const exchangeRate = useMemo(() => {
        if (Object.keys(rates).length === 0) return null;
        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];
        if (!fromRate || !toRate) return null;
        return (toRate / fromRate).toFixed(4);
    }, [fromCurrency, toCurrency, rates]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const addCurrency = (code: string) => {
        if (!favoriteCurrencies.includes(code)) {
            setFavoriteCurrencies([...favoriteCurrencies, code]);
            // Show confirmation
            setAddedCurrency(code);
            setTimeout(() => setAddedCurrency(null), 1500);
        }
        setSearchModalVisible(false);
        setSearchQuery('');
    };

    const removeCurrency = (code: string) => {
        // Don't allow removing if it's currently selected
        if (code === fromCurrency || code === toCurrency) {
            Alert.alert('Cannot Remove', `${code} is currently in use. Select a different currency first.`);
            return;
        }
        // Keep at least 2 currencies
        if (favoriteCurrencies.length <= 2) {
            Alert.alert('Cannot Remove', 'You need at least 2 currencies.');
            return;
        }
        // Show confirm dialog
        const info = CURRENCY_INFO[code];
        const name = info?.name || code;
        setConfirmDialog({ visible: true, code, name });
    };

    const handleConfirmRemove = () => {
        setFavoriteCurrencies(favoriteCurrencies.filter(c => c !== confirmDialog.code));
        setConfirmDialog({ visible: false, code: '', name: '' });
    };

    const handleCancelRemove = () => {
        setConfirmDialog({ visible: false, code: '', name: '' });
    };

    const fromCurrencyData = CURRENCY_INFO[fromCurrency] || { name: fromCurrency, symbol: fromCurrency };
    const toCurrencyData = CURRENCY_INFO[toCurrency] || { name: toCurrency, symbol: toCurrency };

    // Favorite currency options for picker
    const favoriteOptions = useMemo(() => {
        return favoriteCurrencies.map(code => {
            const info = CURRENCY_INFO[code];
            const name = info?.name || code;
            return { label: `${code} - ${name}`, value: code };
        });
    }, [favoriteCurrencies]);

    // All currencies for search (excluding already added)
    const searchResults = useMemo(() => {
        const allCodes = Object.keys(rates).length > 0 ? Object.keys(rates) : Object.keys(CURRENCY_INFO);
        const query = searchQuery.toLowerCase();

        return allCodes
            .filter(code => {
                if (favoriteCurrencies.includes(code)) return false;
                if (!searchQuery) return true;
                const info = CURRENCY_INFO[code];
                const name = info?.name || '';
                return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
            })
            .sort((a, b) => a.localeCompare(b))
            .slice(0, 50); // Limit results
    }, [rates, searchQuery, favoriteCurrencies]);

    // Custom Picker Modal with long press to delete
    const renderPickerModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        selectedValue: string,
        onSelect: (value: string) => void
    ) => (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalHint}>Long press to remove</Text>
                    <FlatList
                        data={favoriteOptions}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    selectedValue === item.value && styles.modalOptionSelected
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                                onLongPress={() => removeCurrency(item.value)}
                                delayLongPress={500}
                            >
                                <View style={styles.modalOptionLeft}>
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedValue === item.value && styles.modalOptionTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {(item.value === fromCurrency || item.value === toCurrency) && item.value !== selectedValue && (
                                        <Text style={styles.inUseHint}>in use</Text>
                                    )}
                                </View>
                                {selectedValue === item.value && (
                                    <Check size={20} color={colors.accent} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            onClose();
                            setSearchModalVisible(true);
                        }}
                    >
                        <Plus size={20} color={colors.accent} />
                        <Text style={styles.addButtonText}>Add Currency</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    // Search Modal for adding currencies
    const renderSearchModal = () => (
        <Modal visible={searchModalVisible} transparent animationType="slide" onRequestClose={() => setSearchModalVisible(false)}>
            <View style={styles.searchModalContainer}>
                <View style={styles.searchModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Currency</Text>
                        <TouchableOpacity onPress={() => {
                            setSearchModalVisible(false);
                            setSearchQuery('');
                        }}>
                            <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color={colors.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search currencies..."
                            placeholderTextColor={colors.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={20} color={colors.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const info = CURRENCY_INFO[item];
                            const name = info?.name || item;
                            const symbol = info?.symbol || item;
                            return (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => addCurrency(item)}
                                >
                                    <View style={styles.searchResultLeft}>
                                        <Text style={styles.searchResultCode}>{item}</Text>
                                        <Text style={styles.searchResultName}>{name}</Text>
                                    </View>
                                    <Text style={styles.searchResultSymbol}>{symbol}</Text>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptySearch}>
                                <Text style={styles.emptySearchText}>
                                    {searchQuery ? 'No currencies found' : 'Type to search'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Currency</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={() => fetchRates(baseCurrency)}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={20}
                            color={loading ? colors.secondary : colors.accent}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>
                    {loading ? 'Loading rates...' :
                     error ? error :
                     lastUpdated ? `Rates from ${lastUpdated}` : 'Rates are approximate'}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {loading && Object.keys(rates).length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={styles.loadingText}>Loading exchange rates...</Text>
                    </View>
                ) : (
                    <>
                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <View style={styles.inputRow}>
                                <Text style={styles.currencySymbol}>{fromCurrencyData.symbol}</Text>
                                <TextInput
                                    style={styles.inputField}
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.secondary}
                                />
                            </View>
                            <Text style={styles.inputLabel}>{fromCurrencyData.name}</Text>
                        </View>

                        {/* Currency Selection */}
                        <View style={styles.currencyContainer}>
                            <View style={styles.currencyField}>
                                <Text style={styles.currencyLabel}>FROM</Text>
                                <PickerButton
                                    value={`${fromCurrency} - ${fromCurrencyData.name}`}
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
                                    value={`${toCurrency} - ${toCurrencyData.name}`}
                                    onPress={() => setToModalVisible(true)}
                                />
                            </View>
                        </View>

                        {/* Result */}
                        <TouchableOpacity
                            style={styles.resultContainer}
                            onPress={() => copyToClipboard(`${toCurrencyData.symbol}${result}`)}
                            activeOpacity={0.7}
                        >
                            {copied && (
                                <View style={styles.copiedBadge}>
                                    <Text style={styles.copiedText}>Copied!</Text>
                                </View>
                            )}
                            <View style={styles.resultRow}>
                                <Text style={styles.resultSymbol}>{toCurrencyData.symbol}</Text>
                                <Text style={styles.resultValue}>{result}</Text>
                            </View>
                            <Text style={styles.resultCurrency}>{toCurrencyData.name}</Text>
                        </TouchableOpacity>

                        {/* Exchange Rate Info */}
                        {exchangeRate && (
                            <View style={styles.rateInfo}>
                                <Text style={styles.rateText}>
                                    1 {fromCurrency} = {exchangeRate} {toCurrency}
                                </Text>
                            </View>
                        )}

                        {/* My Currencies */}
                        <View style={styles.myCurrenciesSection}>
                            <View style={styles.myCurrenciesHeader}>
                                <Text style={styles.myCurrenciesLabel}>MY CURRENCIES</Text>
                                <TouchableOpacity
                                    style={styles.addCurrencyButton}
                                    onPress={() => setSearchModalVisible(true)}
                                >
                                    <Plus size={16} color={colors.accent} />
                                    <Text style={styles.addCurrencyText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.myCurrenciesHint}>Long press to remove</Text>
                            <View style={styles.currencyPillsContainer}>
                                {favoriteCurrencies.map(code => {
                                    const info = CURRENCY_INFO[code];
                                    const isInUse = code === fromCurrency || code === toCurrency;
                                    const isJustAdded = code === addedCurrency;
                                    return (
                                        <TouchableOpacity
                                            key={code}
                                            style={[
                                                styles.currencyPill,
                                                isInUse && styles.currencyPillActive,
                                                isJustAdded && styles.currencyPillAdded,
                                            ]}
                                            onPress={() => {
                                                // Quick select as TO currency
                                                if (code !== fromCurrency) {
                                                    setToCurrency(code);
                                                }
                                            }}
                                            onLongPress={() => removeCurrency(code)}
                                            delayLongPress={500}
                                        >
                                            <Text style={[
                                                styles.currencyPillText,
                                                isInUse && styles.currencyPillTextActive,
                                            ]}>
                                                {info?.symbol || code}
                                            </Text>
                                            <Text style={[
                                                styles.currencyPillCode,
                                                isInUse && styles.currencyPillCodeActive,
                                            ]}>
                                                {code}
                                            </Text>
                                            {isJustAdded && (
                                                <View style={styles.addedBadge}>
                                                    <Text style={styles.addedBadgeText}>NEW</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {renderPickerModal(
                fromModalVisible,
                () => setFromModalVisible(false),
                'Select From Currency',
                fromCurrency,
                setFromCurrency
            )}
            {renderPickerModal(
                toModalVisible,
                () => setToModalVisible(false),
                'Select To Currency',
                toCurrency,
                setToCurrency
            )}
            {renderSearchModal()}

            <ConfirmDialog
                visible={confirmDialog.visible}
                title="Remove Currency"
                message={`Remove ${confirmDialog.code} (${confirmDialog.name}) from your list?`}
                confirmText="Remove"
                cancelText="Cancel"
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
                destructive
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.main },
    header: { paddingHorizontal: 16, paddingVertical: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontFamily, fontSize: 28, fontWeight: '600', color: colors.primary },
    headerSubtitle: { fontSize: 12, color: colors.secondary, marginTop: 4 },
    refreshButton: { padding: 8 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, gap: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    loadingText: { fontSize: 14, color: colors.secondary },
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
    swapButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
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
    copiedText: { color: colors.main, fontSize: 12, fontWeight: '600' },

    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.subtle },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
    modalHint: { fontSize: 12, color: colors.secondary, textAlign: 'center', paddingVertical: 8, backgroundColor: colors.input },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    modalOptionSelected: { backgroundColor: colors.accent + '15' },
    modalOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    modalOptionText: { fontSize: 16, color: colors.primary },
    modalOptionTextSelected: { color: colors.accent, fontWeight: '600' },
    inUseHint: { fontSize: 11, color: colors.secondary, backgroundColor: colors.subtle, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderTopWidth: 1, borderTopColor: colors.subtle },
    addButtonText: { fontSize: 16, fontWeight: '600', color: colors.accent },

    // Search modal styles
    searchModalContainer: { flex: 1, backgroundColor: colors.overlay },
    searchModalContent: { flex: 1, backgroundColor: colors.main, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, margin: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.subtle, gap: 12 },
    searchInput: { flex: 1, paddingVertical: 14, color: colors.primary, fontSize: 16 },
    searchResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.subtle + '40' },
    searchResultLeft: { gap: 4 },
    searchResultCode: { fontSize: 16, fontWeight: '600', color: colors.primary },
    searchResultName: { fontSize: 13, color: colors.secondary },
    searchResultSymbol: { fontSize: 20, color: colors.secondary },
    emptySearch: { padding: 40, alignItems: 'center' },
    emptySearchText: { fontSize: 14, color: colors.secondary },

    // My Currencies section
    myCurrenciesSection: { gap: 8 },
    myCurrenciesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    myCurrenciesLabel: { fontSize: 11, fontWeight: '600', color: colors.secondary, letterSpacing: 1, marginLeft: 4 },
    myCurrenciesHint: { fontSize: 11, color: colors.secondary, marginLeft: 4 },
    addCurrencyButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addCurrencyText: { fontSize: 14, fontWeight: '600', color: colors.accent },
    currencyPillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    currencyPill: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.input,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.subtle,
        minWidth: 60,
    },
    currencyPillActive: {
        backgroundColor: colors.accent + '20',
        borderColor: colors.accent,
    },
    currencyPillAdded: {
        borderColor: colors.accent,
    },
    currencyPillText: { fontSize: 18, fontWeight: '600', color: colors.secondary },
    currencyPillTextActive: { color: colors.primary },
    currencyPillCode: { fontSize: 11, color: colors.secondary, marginTop: 2 },
    currencyPillCodeActive: { color: colors.primary },
    addedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.accent,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 6,
    },
    addedBadgeText: { fontSize: 8, fontWeight: '700', color: colors.main },
});
